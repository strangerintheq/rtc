import {UserId} from "../app/types";

export function determineMaster(localUserId: UserId, remoteUserId:UserId): boolean {
    return xorShift128(localUserId) < xorShift128(remoteUserId);
}

function xorShift128(str: string): number {
    let t, x = new Uint32Array([1, 2, 3, 4].map(i => parseInt(str.substr(i * 8, 8), 16)));
    t = x[3], x[3] = x[2], x[2] = x[1], x[1] = x[0], t ^= t << 11, t ^= t >>> 8, x[0] = t ^ x[0] ^ x[0] >>> 19;
    return x[0] / 0x100000000;
}