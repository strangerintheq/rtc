export type ConferenceId = `conf_${string}`;
export type UserId = `user_${string}`;

export type User = {
    userId: UserId;
    connection?: Connection;
    tracks: MediaStreamTrack[];
    iceCandidates: RTCIceCandidate[];
    progress: number;
    status: ConnectionStatus;
}

export interface Conference {
    onChange: (users: User[]) => Promise<void>;
    onJoin: (users: User[]) => Promise<void>;
    onLeft: (users: User[]) => Promise<void>;
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
    setUserIdList: (userIdList: UserId[]) => Promise<void>;
    connect(): Promise<void>;
    offer: SignallingTopic<RTCSessionDescription>;
    answer: SignallingTopic<RTCSessionDescription>;
    iceCandidate: SignallingTopic<RTCIceCandidate>;
    off();
}

export interface SignallingTopic<T> {
    emit(payload: RtcMessage<T>): Promise<void>;
    on(callback: (payload: RtcMessage<T>) => void):void
}

export interface Connection {
    innerState: ConnectionInnerState;
    createOffer(): Promise<RTCSessionDescription>;
    receiveOffer(description: RTCSessionDescriptionInit): Promise<RTCSessionDescription>;
    receiveAnswer(description: RTCSessionDescriptionInit): Promise<void>;
    disconnect(): Promise<void>;
    iceCandidate(payload: RTCIceCandidate): Promise<void>;
    updateTracks(tracks: MediaStreamTrack[]): void;
}

export interface ConnectionInnerState {
    peerConnection: RTCPeerConnection;
    localUserId: UserId;
    remoteUserId: UserId;
}

export type Logger = (...str) => void;

export enum ConnectionStatus {
    INITIAL = "INITIAL",
    CREATED = "CREATED",
    RECREATED = "RECREATED",
    CONNECTING = "CONNECTING",
    CONNECTED = "CONNECTED",
    ERROR = "ERROR"
}
