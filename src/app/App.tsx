import React, {memo, useMemo} from "react";
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
        <button onClick={toggleCam}>{mss.cameraStreamTrack ? "disable cam" : "enable cam"}</button>
        <button onClick={toggleMic}>{mss.microphoneStreamTrack ? "disable mic" : "enable mic"}</button>
        <button onClick={toggleShareScreen}>{mss.desktopStreamTrack ? "share screen" : "share screen"}</button>
        <div>
            <User tracks={mss.getActualTracks(true)} connection={"self"}/>
            {otherUsers.map(user => <User key={user.userId} tracks={user.tracks} connection={user.status}/>)}
        </div>
    </div>
}

type HasTrack = { track: MediaStreamTrack };

const User = memo(({tracks, connection}: HasTrack & { connection: string }) => {
    return <div style={{border: "1px solid black", width: 300, minHeight: 200}}>
        <div>tracks: {tracks.length} connection: {connection}</div>
        {tracks.map(track => <Track track={track} key={track.id}/>)}
    </div>;
});

const Track = memo(({track}: HasTrack) => {
    return track.kind === "audio" ? <AudioTrack track={track}/> : <VideoTrack track={track}/>;
})

const AudioTrack = memo(({track}: HasTrack) => {
    // @ts-ignore
    return <audio autoplay={true} playsInline srcObject={new MediaStream([track])}/>;
})

const VideoTrack = memo(({track}: HasTrack) => {
    // @ts-ignore
    return <video width={300} muted autoPlay playsinline={true} playsInline
                  srcObject={new MediaStream([track])}/>;
})



