import React from "react";
import {useAppStore} from "../AppStore";
import {useMediaStreamStore} from "../../media-stream/MediaStreamStore";

export function ButtonsPanel() {
    const {updateTracks} = useAppStore();

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
    </div>
}