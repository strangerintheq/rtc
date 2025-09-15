import {UserId} from "../app/types";

export interface Conference {
    connect();
    setUsers();
    addUser();
    removeUser();
}

export interface Connection {
    state: ConnectionState;
    createOffer(): Promise<RTCSessionDescription>;
    receiveOffer(description: RTCSessionDescriptionInit): Promise<RTCSessionDescription>;
    receiveAnswer(description: RTCSessionDescriptionInit): Promise<void>;
    disconnect();
    iceCandidate(payload: RTCIceCandidate): void;
    updateTracks(tracks: MediaStreamTrack[]): Promise<void>;
}

export interface ConnectionState {
    peerConnection: RTCPeerConnection;
    localUserId: UserId;
    remoteUserId: UserId;
}