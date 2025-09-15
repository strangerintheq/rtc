import {MediaConstraintsFactory, MediaQuality} from "../MediaStreamStoreApi";

const RATES = {
    [MediaQuality.HIGH]: 30,
    [MediaQuality.MEDIUM]: 20,
    [MediaQuality.LOW]: 10,
}

export const DesktopConstraintsFactory: MediaConstraintsFactory = (quality: MediaQuality) => {
    return {
        facingMode: 'user',
        frameRate: {max: RATES[quality]}
    }
}