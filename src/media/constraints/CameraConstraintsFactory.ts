import {MediaConstraintsFactory, MediaQuality} from "../MediaStreamStoreApi";

const SIZES = {
    [MediaQuality.HIGH]: 1024,
    [MediaQuality.MEDIUM]: 512,
    [MediaQuality.LOW]: 256,
}

const RATES = {
    [MediaQuality.HIGH]: 30,
    [MediaQuality.MEDIUM]: 20,
    [MediaQuality.LOW]: 10,
}

export const CameraConstraintsFactory: MediaConstraintsFactory = (quality: MediaQuality) => {
    return {
        facingMode: 'user',
        width: {ideal: SIZES[quality]},
        // height: {ideal: SIZES[quality] / ratio},
        frameRate: {max: RATES[quality]}
    }
}