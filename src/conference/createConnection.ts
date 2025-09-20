import {Connection, ConnectionInnerState, UserId} from "./types";
import {createLogger} from "../app/logger";

declare global {
    interface Window {
        cfg: RTCConfiguration;
    }
}

const log = createLogger({prefix: "[createConnection]"})

export function createConnection(localUserId: UserId, remoteUserId: UserId): Connection {
    const offerOptions: RTCOfferOptions = {
        iceRestart: true,
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
    };

    const peerConnection = new RTCPeerConnection(window.cfg);

    peerConnection.oniceconnectionstatechange = () => {
        if (peerConnection.iceConnectionState === "failed") {
            peerConnection.restartIce();
        }
    };

    const state: ConnectionInnerState = {
        peerConnection,
        localUserId,
        remoteUserId
    }

    return {
        innerState: state,
        async createOffer(): Promise<RTCSessionDescription> {
            const offer = await peerConnection.createOffer(offerOptions)
            await peerConnection.setLocalDescription(new RTCSessionDescription(offer));
            return peerConnection.localDescription;
        },
        async receiveOffer(description: RTCSessionDescriptionInit): Promise<RTCSessionDescription> {
            await peerConnection.setRemoteDescription(description);
            const answer = await peerConnection.createAnswer(offerOptions)
            await peerConnection.setLocalDescription(new RTCSessionDescription(answer));
            return peerConnection.localDescription;
        },
        async receiveAnswer(answer: RTCSessionDescriptionInit) {
            await peerConnection.setRemoteDescription(answer);
        },
        async disconnect() {
            await peerConnection.close()
        },
        async iceCandidate(payload: RTCIceCandidate) {
            log("processing ice candidate")
            await peerConnection.addIceCandidate(payload)
        },
        updateTracks(tracks: MediaStreamTrack[]) {
            tracks.forEach(item => peerConnection.addTrack(item));
        },
    }
}