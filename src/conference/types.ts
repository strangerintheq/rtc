
export type ConferenceId = `conf_${string}`;

export type UserId = `user_${string}`;

export type User = {
    userId: UserId;
    connection?: Connection;
    tracks: MediaStreamTrack[];
}

export interface Conference {
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

