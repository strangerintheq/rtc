import {MediaQuality} from "./MediaQuality";

export interface MediaStreamStoreApi {
    quality: MediaQuality;
    setQuality(quality: MediaQuality): void;

    cameraStreamTrack?: MediaStreamTrack;
    startCameraStream(): void;
    stopCameraStream(): void;

    microphoneStreamTrack?: MediaStreamTrack;
    startMicrophoneStream(): void;
    stopMicrophoneStream(): void;

    desktopStreamTrack?: MediaStreamTrack;
    startDesktopStream(): void;
    stopDesktopStream(): void;

    stop(): void;

    getActualTracks(noAudio?: boolean): MediaStreamTrack[];
}