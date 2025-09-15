import {MediaConstraintsFactory, MediaQuality} from "../MediaStreamStoreApi";

export const MicrophoneConstraintsFactory: MediaConstraintsFactory = (quality: MediaQuality) => {
    return true as any;
}