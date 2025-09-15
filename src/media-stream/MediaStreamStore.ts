import {create} from "zustand";
import {MediaQuality} from "./MediaQuality";
import {MediaStreamStoreApi} from "./MediaStreamStoreApi";
import {DesktopConstraintsFactory} from "./constraints/DesktopConstraintsFactory";
import {MicrophoneConstraintsFactory} from "./constraints/MicrophoneConstraintsFactory";
import {CameraConstraintsFactory} from "./constraints/CameraConstraintsFactory";


type TrackType = "desktopStreamTrack" | "cameraStreamTrack" | "microphoneStreamTrack"

export const useMediaStreamStore = create<MediaStreamStoreApi>((
    set,
    get
) => {

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
            state[trackType] = null
        })
        set(state)
    }

    return {
        quality: MediaQuality.LOW,

        async setQuality(quality: MediaQuality) {
            const {cameraStreamTrack, desktopStreamTrack, microphoneStreamTrack} = get();
            await applyQuality(cameraStreamTrack, CameraConstraintsFactory(quality))
            await applyQuality(desktopStreamTrack, DesktopConstraintsFactory(quality));
            await applyQuality(microphoneStreamTrack, MicrophoneConstraintsFactory(quality));
            set({quality});
        },
        async startCameraStream() {
            const cameraStream = await navigator.mediaDevices.getUserMedia({
                audio: false, video: CameraConstraintsFactory(get().quality)
            });
            const cameraStreamTrack = cameraStream.getTracks()[0];
            set({cameraStreamTrack});
        },
        async stopCameraStream() {
            stop("cameraStreamTrack")
        },
        async startDesktopStream() {
            const desktopStream = await navigator.mediaDevices.getDisplayMedia({
                audio: false, video: DesktopConstraintsFactory(get().quality)
            });
            const desktopStreamTrack = desktopStream.getTracks()[0];
            set({desktopStreamTrack});
        },
        async stopDesktopStream() {
            stop("desktopStreamTrack")
        },
        async startMicrophoneStream() {
            const microphoneStream = await navigator.mediaDevices.getUserMedia({
                video: false, audio: MicrophoneConstraintsFactory(get().quality)
            });
            const microphoneStreamTrack = microphoneStream.getTracks()[0];
            set({microphoneStreamTrack});
        },
        async stopMicrophoneStream() {
            stop("microphoneStreamTrack")
        },

        stop() {
            stop("cameraStreamTrack", "desktopStreamTrack", "microphoneStreamTrack")
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
        }
    }
});
