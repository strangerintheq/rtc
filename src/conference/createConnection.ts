import {UserId} from "../app/types";
import {Connection, ConnectionState} from "./types";

declare global {
    interface Window {
        cfg: RTCConfiguration;
    }
}

export function createConnection(localUserId: UserId, remoteUserId: UserId): Connection {
    const offerOptions: RTCOfferOptions = {
        iceRestart: true,
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
    };

    const peerConnection = new RTCPeerConnection(window.cfg);

    const state: ConnectionState = {
        peerConnection,
        localUserId,
        remoteUserId
    }

    return {
        state,
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
            await peerConnection.addIceCandidate(payload)
        },
        async updateTracks(tracks: MediaStreamTrack[]) {
            peerConnection.getSenders().forEach(t => peerConnection.removeTrack(t))
            tracks.forEach(item => peerConnection.addTrack(item));
        },
    }
}