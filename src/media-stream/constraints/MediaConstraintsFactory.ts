import {MediaQuality} from "../MediaQuality";

export type MediaConstraintsFactory = (quality: MediaQuality) => MediaTrackConstraints;


