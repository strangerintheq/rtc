import {MediaConstraintsFactory, MediaQuality} from "../MediaStreamStoreApi";

const RATES = {
    [MediaQuality.HIGH]: 30,
    [MediaQuality.MEDIUM]: 10,
    [MediaQuality.LOW]: 3,
}

export const DesktopConstraintsFactory: MediaConstraintsFactory = (quality: MediaQuality) => {
    return {
        displaySurface: "monitor",
        facingMode: 'user',
        frameRate: {max: RATES[quality]}
    }
}