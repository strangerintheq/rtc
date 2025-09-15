export type ConferenceId = `conf_${string}`;
export type UserId = `user_${string}`;

export type User = {
    userId: UserId;
    connection?: Connection;
    tracks: MediaStreamTrack[];
}

export interface Conference {
    connect(currentUserId: UserId, signalling: Signalling): Promise<void>;
    disconnect(): Promise<void>;
    updateTracks(tracks: MediaStreamTrack[]): void;
}

export interface RtcMessage<T> {
    from: UserId;
    to: UserId;
    payload: T;
}

export interface Signalling {
    onLeave: (userId: UserId) => Promise<void>;
    onJoin: (userId: UserId) => Promise<void>;
    connect(): Promise<void>;
    offer: SignallingChannel<RTCSessionDescription>;
    answer: SignallingChannel<RTCSessionDescription>;
    iceCandidate: SignallingChannel<RTCIceCandidate>;
    off();
}

export interface SignallingChannel<T> {
    emit(payload: RtcMessage<T>): Promise<void>;
    on(callback: (payload: RtcMessage<T>) => void):void
}

export interface Connection {
    state: ConnectionState;
    createOffer(): Promise<RTCSessionDescription>;
    receiveOffer(description: RTCSessionDescriptionInit): Promise<RTCSessionDescription>;
    receiveAnswer(description: RTCSessionDescriptionInit): Promise<void>;
    disconnect(): Promise<void>;
    iceCandidate(payload: RTCIceCandidate): Promise<void>;
    updateTracks(tracks: MediaStreamTrack[]): Promise<void>;
}

export interface ConnectionState {
    peerConnection: RTCPeerConnection;
    localUserId: UserId;
    remoteUserId: UserId;
}

export type Logger = (...str) => void;

