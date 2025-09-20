import {User} from "./types";
import {createLogger} from "../app/logger";

const log = createLogger({prefix: "[processIceCandidate]"})

export async function processIceCandidate(user: User, candidate: RTCIceCandidate) {
    log("received ice candidate")
    if (user.connection && user.connection.innerState.peerConnection.remoteDescription) {
        await user.connection.iceCandidate(candidate);
    } else {
        log("queuing ice candidate")
        user.iceCandidates.push(candidate)
    }
}

export function processIceCandidatesQueue(user: User){
    if (!user.iceCandidates.length)
        return;
    log("processing ice candidates queue")
    user.iceCandidates.forEach(user.connection.iceCandidate);
    user.iceCandidates.splice(0, user.iceCandidates.length);
}