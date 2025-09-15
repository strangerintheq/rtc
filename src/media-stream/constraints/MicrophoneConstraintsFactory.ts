import {MediaQuality} from "../MediaQuality";
import {MediaConstraintsFactory} from "./MediaConstraintsFactory";

export const MicrophoneConstraintsFactory: MediaConstraintsFactory = (quality: MediaQuality) => {
    return true as any;
}