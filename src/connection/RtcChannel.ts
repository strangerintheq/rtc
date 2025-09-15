import {ChannelEvent} from "@chessclub/realtime_infrastructure/src/RealtimeInfrastructure"
import {initChannel} from "@chessclub/realtime_infrastructure/src/public/initChannel"
import {UserId} from "../app/types";

export interface Route<T> {
    from: UserId;
    to: UserId;
    payload: T;
}

export let RtcChannel = {
    NEGOTIATE: new ChannelEvent<Route<void>>(),
    ICE_CANDIDATE: new ChannelEvent<Route<RTCIceCandidate>>(),
    OFFER: new ChannelEvent<Route<RTCSessionDescriptionInit>>(),
    ANSWER: new ChannelEvent<Route<RTCSessionDescriptionInit>>(),
}

initChannel(RtcChannel);