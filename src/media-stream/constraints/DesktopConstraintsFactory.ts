import {MediaQuality} from "../MediaQuality";
import {MediaConstraintsFactory} from "./MediaConstraintsFactory";

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


export const DesktopConstraintsFactory: MediaConstraintsFactory = (quality: MediaQuality) => {
    return true as any
    // const ratio = 1 / 1.777;
    // return {
    //     facingMode: 'user',
    //     width: {ideal: SIZES[quality]},
    //     // height: {ideal: SIZES[quality] / ratio},
    //     frameRate: {max: RATES[quality]}
    // }
}