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
    restore(state: MediaStreamStorePersistentStore): Promise<void>;
}

export enum TrackType {
    desktopStreamTrack = "desktopStreamTrack",
    cameraStreamTrack = "cameraStreamTrack",
    microphoneStreamTrack = "microphoneStreamTrack"
}

export enum MediaQuality {
    HIGH = "HIGH",
    MEDIUM = "MEDIUM",
    LOW = "LOW"
}

export interface MediaStreamStorePersistentStore {
    getQuality(): MediaQuality;
    setQuality(quality: MediaQuality): void;

    isEnabled(trackType: TrackType): boolean;
    setEnabled(trackType: TrackType, isEnabled: boolean): void;
}

export type MediaConstraintsFactory = (quality: MediaQuality) => MediaTrackConstraints;