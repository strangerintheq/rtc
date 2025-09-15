import {ChannelEvent} from "@chessclub/realtime_infrastructure/src/RealtimeInfrastructure"
import {initChannel} from "@chessclub/realtime_infrastructure/src/public/initChannel"
import {UserId} from "../app/types";

export interface RtcMessage<T> {
    from: UserId;
    to: UserId;
    payload: T;
}

export let RtcChannel = {
    // NEGOTIATE: new ChannelEvent<Route<void>>(),
    ICE_CANDIDATE: new ChannelEvent<RtcMessage<RTCIceCandidate>>(),
    OFFER: new ChannelEvent<RtcMessage<RTCSessionDescriptionInit>>(),
    ANSWER: new ChannelEvent<RtcMessage<RTCSessionDescriptionInit>>(),
}

initChannel(RtcChannel);