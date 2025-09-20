import React, {memo, useEffect, useMemo, useRef} from "react";
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

const User = memo(({tracks, connection}: { tracks: MediaStreamTrack[], connection: string }) => {
    return <div style={{border: "1px solid black", width: 300, minHeight: 200}}>
        <div>tracks: {tracks.length} connection: {connection}</div>
        {tracks.map(track => <Track track={track} key={track.id}/>)}
    </div>;
});

type HasTrack = { track: MediaStreamTrack };

const Track = memo(({track}: HasTrack) => {
    return track.kind === "audio" ? <AudioTrack track={track}/> : <VideoTrack track={track}/>;
})

const AudioTrack = memo(({track}: HasTrack) => {
    const ref = useRef<HTMLAudioElement>(null)
    useEffect(() => {
        (async function() {
            try {
                await ref.current.play();
            } catch (e) {
            }
            try {
                await ref.current.play();
            } catch (e) {
            }
        })();
    }, [track])
    // @ts-ignore
    return <audio ref={ref} autoplay={true} playsInline srcObject={new MediaStream([track])}/>;
})

const VideoTrack = memo(({track}: HasTrack) => {
    // @ts-ignore
    return <video width={300} muted autoPlay playsinline={true} playsInline
                  srcObject={new MediaStream([track])}/>;
})



