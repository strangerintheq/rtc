import React from "react";
import {useAppStore} from "./AppStore";
import {useMediaStreamStore} from "../media-stream/MediaStreamStore";

export function App() {
    const {updateTracks, otherUsers} = useAppStore();
    const mss = useMediaStreamStore();

    async function toggleCam() {
        await (mss.cameraStreamTrack ? mss.stopCameraStream : mss.startCameraStream)();
        await updateTracks();
    }

    async function toggleMic() {
        await (mss.microphoneStreamTrack ? mss.stopMicrophoneStream : mss.startMicrophoneStream)();
        await updateTracks();
    }

    async function toggleShareScreen() {
        await (mss.desktopStreamTrack ? mss.stopDesktopStream : mss.startDesktopStream)();
        await updateTracks();
    }

    return <div>
        <button onClick={toggleCam}>{mss.cameraStreamTrack? "disable cam" : "enable cam"}</button>
        <button onClick={toggleMic}>{mss.microphoneStreamTrack? "disable mic" : "enable mic"}</button>
        <button onClick={toggleShareScreen}>{mss.desktopStreamTrack? "share screen" : "share screen"}</button>
        <div>
            <User tracks={mss.getActualTracks(false)} />
            {otherUsers.map(user => <User tracks={user.tracks} key={user.userId}/>)}
        </div>
    </div>
}

function User({tracks}: { tracks: MediaStreamTrack[] }) {
    return <div style={{border: "1px solid black", width:300, minHeight: 200}}>
        <div>tracks: {tracks.length}</div>
        {tracks.map(track => <Track track={track} key={track.id}/>)}
    </div>;
}

function Track({track}: { track: MediaStreamTrack }) {
    return track.kind === "audio" ? <AudioTrack track={track}/> : <VideoTrack track={track}/>;
}

function AudioTrack({track}: { track: MediaStreamTrack }) {
    // @ts-ignore
    return <audio autoplay={true} playsInline srcObject={new MediaStream([track])}/>;
}

function VideoTrack({track}: { track: MediaStreamTrack }) {
    // @ts-ignore
    return <video width={300} muted autoPlay playsinline={true} playsInline srcObject={new MediaStream([track])}/>;
}

