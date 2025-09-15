import {create} from "zustand";
import {MediaQuality, MediaStreamStoreApi, MediaStreamStorePersistentStore, TrackType} from "./MediaStreamStoreApi";
import {DesktopConstraintsFactory} from "./constraints/DesktopConstraintsFactory";
import {MicrophoneConstraintsFactory} from "./constraints/MicrophoneConstraintsFactory";
import {CameraConstraintsFactory} from "./constraints/CameraConstraintsFactory";

export const useMediaStreamStore = create<MediaStreamStoreApi>((
    set,
    get
) => {

    let persistentState: MediaStreamStorePersistentStore;

    async function applyQuality(track: MediaStreamTrack, constraints: MediaTrackConstraints) {
        track && await track.applyConstraints(constraints);
    }

    function stop(...tracks: TrackType[]) {
        const state = {};
        tracks.forEach(trackType => {
            const track = get()[trackType];
            if (!track)
                return;
            track.stop();
            state[trackType] = null;
            localStorage.removeItem(trackType);
        })
        set(state)
    }

    function update(track: MediaStreamTrack, trackType: TrackType) {
        set({[trackType]: track});
        persistentState.setEnabled(trackType, !!track);
    }

    return {
        quality: MediaQuality.LOW,

        async setQuality(quality: MediaQuality) {
            const {cameraStreamTrack, desktopStreamTrack, microphoneStreamTrack} = get();
            await applyQuality(cameraStreamTrack, CameraConstraintsFactory(quality))
            await applyQuality(desktopStreamTrack, DesktopConstraintsFactory(quality));
            await applyQuality(microphoneStreamTrack, MicrophoneConstraintsFactory(quality));
            set({quality});
            persistentState?.setQuality(quality);
        },

        async startCameraStream() {
            const cameraStream = await navigator.mediaDevices.getUserMedia({
                audio: false, video: CameraConstraintsFactory(get().quality)
            });
            update(cameraStream.getTracks()[0], TrackType.cameraStreamTrack);
        },

        async stopCameraStream() {
            stop(TrackType.cameraStreamTrack)
        },

        async startDesktopStream() {
            const desktopStream = await navigator.mediaDevices.getDisplayMedia({
                audio: false, video: DesktopConstraintsFactory(get().quality)
            });
            update(desktopStream.getTracks()[0], TrackType.desktopStreamTrack);
        },

        async stopDesktopStream() {
            stop(TrackType.desktopStreamTrack)
        },

        async startMicrophoneStream() {
            const microphoneStream = await navigator.mediaDevices.getUserMedia({
                video: false, audio: MicrophoneConstraintsFactory(get().quality)
            });
            update(microphoneStream.getTracks()[0], TrackType.microphoneStreamTrack);
        },

        async stopMicrophoneStream() {
            stop(TrackType.microphoneStreamTrack)
        },

        stop() {
            stop(TrackType.cameraStreamTrack, TrackType.microphoneStreamTrack, TrackType.microphoneStreamTrack);
        },

        getActualTracks(noAudio?: boolean): MediaStreamTrack[] {
            const actualTracks = [];
            const {desktopStreamTrack, cameraStreamTrack, microphoneStreamTrack} = get();
            if (desktopStreamTrack)
                actualTracks.push(desktopStreamTrack)
            else if (cameraStreamTrack)
                actualTracks.push(cameraStreamTrack)
            if (!noAudio && microphoneStreamTrack)
                actualTracks.push(microphoneStreamTrack)
            return actualTracks;
        },

        async restore(state: MediaStreamStorePersistentStore) {
            persistentState = state;
            set({quality: state.getQuality()});
            if (persistentState.isEnabled(TrackType.cameraStreamTrack))
                await get().startCameraStream();
            if (persistentState.isEnabled(TrackType.microphoneStreamTrack))
                await get().startMicrophoneStream();
            if (persistentState.isEnabled(TrackType.desktopStreamTrack))
                await get().startDesktopStream();
        }
    }
});
