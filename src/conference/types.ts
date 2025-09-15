export type ConferenceId = `conf_${string}`;
export type UserId = `user_${string}`;

export type User = {
    userId: UserId;
    connection?: Connection;
    tracks: MediaStreamTrack[];
}

export interface Conference {
    addUser();
    removeUser();
    setSignalling(signalling: Signalling): void;
}

export interface RtcMessage<T> {
    from: UserId;
    to: UserId;
    payload: T;
}

export interface Signalling {
    offer: SignallingChannel<RtcMessage<RTCSessionDescription>>;
    answer: SignallingChannel<RtcMessage<RTCSessionDescription>>;
    iceCandidate: SignallingChannel<RtcMessage<RTCIceCandidate>>;
    off();
}

export interface SignallingChannel<T> {
    emit(payload: T): Promise<void>;
    on(callback: (payload: T) => void):void
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

