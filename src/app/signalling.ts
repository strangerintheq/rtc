import {connectToCentrifuge} from "@chessclub/realtime_infrastructure";
import {centrifugeInstance, ChannelEvent} from "@chessclub/realtime_infrastructure/src/RealtimeInfrastructure";
import {ConferenceId, RtcMessage, Signalling, SignallingChannel, UserId} from "../conference/types";
import {addCentrifugeEventListener} from "@chessclub/realtime_infrastructure/src/public/addCentrifugeEventListener";
import {emitCentrifugeEvent} from "@chessclub/realtime_infrastructure/src/public/emitCentrifugeEvent";
import {initChannel} from "@chessclub/realtime_infrastructure/src/public/initChannel";

export let RtcChannel = {
    // NEGOTIATE: new ChannelEvent<Route<void>>(),
    ICE_CANDIDATE: new ChannelEvent<RtcMessage<RTCIceCandidate>>(),
    OFFER: new ChannelEvent<RtcMessage<RTCSessionDescriptionInit>>(),
    ANSWER: new ChannelEvent<RtcMessage<RTCSessionDescriptionInit>>(),
}

initChannel(RtcChannel);

export function createSignalling(conferenceId: ConferenceId): Signalling {
    const offListeners: (() => void)[] = []
    const key = {key: "conf_" + conferenceId};
    return {
        off: () => offListeners.forEach(off => off()),
        offer: createSignallingChannel(key, RtcChannel.OFFER, offListeners),
        answer: createSignallingChannel(key, RtcChannel.ANSWER, offListeners),
        iceCandidate: createSignallingChannel(key, RtcChannel.ICE_CANDIDATE, offListeners)
    }
}

function createSignallingChannel<T>(key, evt: ChannelEvent<T>, offListeners: (() => void)[]): SignallingChannel<any> {
    return {
        async emit(payload: T) {
            await emitCentrifugeEvent(key, evt, payload);
        },
        on(callback: (payload: T) => void) {
            offListeners.push(addCentrifugeEventListener(key, evt, callback))
        }
    }
}

export async function initSignalling(): Promise<UserId> {
    const url = 'https://chessclub.spb.ru/rest/auth.rest.jwt';
    const {session} = await getClientToken(new XMLHttpRequest(), url, "userId", 'test-client');
    const centrifugeUrl = 'wss://chessclub.spb.ru/centrifugo/connection/websocket';
    return new Promise<UserId>((resolve) => {
        connectToCentrifuge(centrifugeUrl, session);
        centrifugeInstance.socket.on('connected', () => {
            resolve(centrifugeInstance.socketId as UserId);
        });
    });
}

export async function getClientToken(
    xhr,
    url: string,
    userId: string,
    name?: string
): Promise<{ session: string; }> {
    return new Promise<{ user_id: string; session: string; }>((resolve, reject) => {
        xhr.open("POST", url);
        xhr.onload = () => resolve(JSON.parse(xhr.response || xhr.responseText))
        xhr.onerror = reject;
        xhr.send(JSON.stringify({user_id: userId, name}));
    });
}