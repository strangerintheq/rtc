import {connectToCentrifuge, joinChannelIfAlreadyNot} from "@chessclub/realtime_infrastructure";
import {centrifugeInstance, ChannelEvent} from "@chessclub/realtime_infrastructure/src/RealtimeInfrastructure";
import {ConferenceId, RtcMessage, Signalling, SignallingTopic, User, UserId} from "../conference/types";
import {addCentrifugeEventListener} from "@chessclub/realtime_infrastructure/src/public/addCentrifugeEventListener";
import {emitCentrifugeEvent} from "@chessclub/realtime_infrastructure/src/public/emitCentrifugeEvent";
import {initChannel} from "@chessclub/realtime_infrastructure/src/public/initChannel";

export let RtcChannel = {
    ICE_CANDIDATE: new ChannelEvent<RtcMessage<RTCIceCandidate>>(),
    OFFER: new ChannelEvent<RtcMessage<RTCSessionDescription>>(),
    ANSWER: new ChannelEvent<RtcMessage<RTCSessionDescription>>(),
}

initChannel(RtcChannel);

export function createSignalling(currentUserId: UserId, conferenceId: ConferenceId): Signalling {

    const offListeners: (() => void)[] = []
    const key = {key: "conf_" + conferenceId};

    return {
        off: () => offListeners.forEach(off => off()),
        offer: createSignallingTopic(key, RtcChannel.OFFER, offListeners),
        answer: createSignallingTopic(key, RtcChannel.ANSWER, offListeners),
        iceCandidate: createSignallingTopic(key, RtcChannel.ICE_CANDIDATE, offListeners),
        setUserIdList: null,
        async connect() {
            const handlePresence = async () =>
                await this.setUserIdList(Object.keys((await subscription.presence()).clients));
            const {subscription} = await joinChannelIfAlreadyNot(key);
            subscription.on('join', async () => await handlePresence());
            subscription.on('leave', async ()  => await handlePresence());
            await handlePresence();
        }
    }
}

function createSignallingTopic<T>(
    key,
    evt: ChannelEvent<RtcMessage<T>>,
    offListeners: (() => void)[]
): SignallingTopic<T> {
    return {
        async emit(payload: RtcMessage<T>) {
            await emitCentrifugeEvent(key, evt, payload);
        },
        on(callback: (payload: RtcMessage<T>) => void) {
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