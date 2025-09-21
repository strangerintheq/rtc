import {Connection, ConnectionInnerState, UserId} from "./types";
import {createLogger} from "../app/logger";

declare global {
    interface Window {
        cfg: RTCConfiguration;
    }
}

const log = createLogger({prefix: "[createConnection]", color: "#ded"})

export function createConnection(localUserId: UserId, remoteUserId: UserId): Connection {
    const offerOptions: RTCOfferOptions = {
        iceRestart: true,
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
    };

    const peerConnection = new RTCPeerConnection(window.cfg);

    const mediaChannel = peerConnection.createDataChannel("media")


    peerConnection.oniceconnectionstatechange = () => {
        if (peerConnection.iceConnectionState === "failed") {
            peerConnection.restartIce();
        }
    };

    const state: ConnectionInnerState = {
        peerConnection,
        localUserId,
        remoteUserId,
    }

    const senders = {
        audio: null as RTCRtpSender,
        video: null as RTCRtpSender
    };

    const mediaChannelMsgQueue = [];

    async function updateTrackByKind(tracks: MediaStreamTrack[], kind: "audio" | "video") {
        const track = tracks.find(t => t.kind === kind);
        if (track) {
            if (senders[kind]) {
                await senders[kind].replaceTrack(track)
            } else {
                senders[kind] = peerConnection.addTrack(track)
            }
        }
    }

    let connection : Connection ={
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
        async updateTracks(tracks: MediaStreamTrack[]) {
            await updateTrackByKind(tracks, "audio")
            await updateTrackByKind(tracks, "video")

            const msg = JSON.stringify(tracks.map(t => t.kind));
            if (mediaChannel.readyState === "open") {
                mediaChannel.send(msg)
            } else {
                mediaChannelMsgQueue.push(msg);
            }
        },
    };


    mediaChannel.onopen = () => {
        while (mediaChannelMsgQueue.length) {
            mediaChannel.send(mediaChannelMsgQueue.shift());
        }
    };

    peerConnection.ondatachannel = (e) => {
        if (e.channel.label === "media") {
            e.channel.onmessage = msg => {
                const data : string[]= JSON.parse(msg.data)
                connection.mediaStateChanged({
                    audio: data.includes("audio"),
                    video: data.includes("video")
                });
            }
        }
    };

    return connection
}