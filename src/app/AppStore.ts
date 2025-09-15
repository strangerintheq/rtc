import {create} from "zustand";
import {Subscription} from "centrifuge";
import {createConnection} from "../conference/createConnection";
import {joinChannelIfAlreadyNot} from "@chessclub/realtime_infrastructure";
import {addCentrifugeEventListener} from "@chessclub/realtime_infrastructure/src/public/addCentrifugeEventListener";
import {emitCentrifugeEvent} from "@chessclub/realtime_infrastructure/src/public/emitCentrifugeEvent";
import {ChannelEvent} from "@chessclub/realtime_infrastructure/src/RealtimeInfrastructure";
import {determineMaster} from "../conference/determineMaster";
import {useMediaStreamStore} from "../media-stream/MediaStreamStore";
import {ConferenceId, RtcMessage, User, UserId} from "../conference/types";
import {RtcChannel} from "./signalling";
import {logger} from "./logger";

export interface AppStore {
    conferenceId?: ConferenceId;
    currentUserId?: UserId;
    otherUsers: User[];

    updateTracks();
    enter(currentUser: UserId, conferenceId: string);
}

export const useAppStore = create<AppStore>((
    set,
    get
) => {

    function on<T>(e: ChannelEvent<RtcMessage<T>>, callback: (payload: RtcMessage<T>) => void) {
        addCentrifugeEventListener(makeChannelKey(get().conferenceId), e,
            (r: RtcMessage<T>) => r.to === get().currentUserId && callback(r))
    }

    async function emit<T>(e: ChannelEvent<T>, payload: T) {
        await emitCentrifugeEvent(makeChannelKey(get().conferenceId), e, payload);
    }

    async function handleLeft(newOtherUsers: UserId[]) {
        const leftUsers = get().otherUsers.filter(u => !newOtherUsers.includes(u.userId));
        if (!leftUsers.length)
            return;
        logger('[AppStore] handleLeft, leftUsers:', leftUsers);
        leftUsers.forEach(u => u.connection.disconnect())
        set({otherUsers: get().otherUsers.filter(u => !leftUsers.includes(u))})
    }

    async function sendOffer(user: User) {
        const offer = await user.connection.createOffer();
        logger("send offer to:", user.userId)
        await emit(RtcChannel.OFFER, makeRoute(user, offer));
    }

    async function handleJoined(newOtherUsers: UserId[]) {
        // log('[AppStore] handleJoined:', newOtherUsers);
        const {otherUsers, currentUserId} = get();
        const oldOtherUsersIds = otherUsers.map(u => u.userId);
        const joinedUsersIds = newOtherUsers.filter(id => !oldOtherUsersIds.includes(id))
        if (!joinedUsersIds.length)
            return;
        logger('[AppStore] handleJoined, joinedUsers:', joinedUsersIds);

        const joinedUsers = joinedUsersIds.map(id => ({
            userId: id, tracks: []
        } as User));

        set({otherUsers: [...otherUsers, ...joinedUsers]})
        joinedUsers.map(async user => {
            if (determineMaster(get().currentUserId, user.userId)) {
                await createConnectionToUser(user, true);
                await sendOffer(user);
            }
        });
    }

    async function handlePresence(conn: Subscription) {
        const presence = await conn.presence();
        const currentUserId = get().currentUserId;
        const ids = Object.values(presence.clients)
            .map(c => c.client as UserId)
            .filter(id => id !== currentUserId);
        await handleLeft(ids);
        await handleJoined(ids);
    }

    function filterRoute<P>(callback: (user: User, payload: P) => void): (route: RtcMessage<P>) => void {
        return (route: RtcMessage<P>) => {
            callback(get().otherUsers.find(u => u.userId === route.from), route.payload);
        };
    }

    function makeRoute<T>(to: User, payload?: T): RtcMessage<T> {
        return {
            from: get().currentUserId,
            to: to.userId,
            payload
        }
    }

    async function processOffer(user: User, p: RTCSessionDescriptionInit) {
        logger("received OFFER from:", user.userId)
        await createConnectionToUser(user, false);
        const answer = await user.connection.receiveOffer(p);
        logger("send ANSWER to:", user.userId)
        await emit(RtcChannel.ANSWER, makeRoute(user, answer))
    }

    async function createConnectionToUser(user: User, master: boolean) {
        if (user.connection)
            return
        logger('createConnection \nsrc:', get().currentUserId, "\ndst:", user.userId);
        user.connection = createConnection(get().currentUserId, user.userId);
        const pc = user.connection.state.peerConnection;
        pc.onicecandidate = async (e) => {
            // log("send ica candidate to:", user.userId)
            await emit(RtcChannel.ICE_CANDIDATE, makeRoute(user, e.candidate))
        };
        pc.onnegotiationneeded = async (e) => {
            logger("negotiation needed with:", user.userId);
            // if (master)
                await sendOffer(user);
            // else {
            //     log("sending NEGOTIATE to:", user.userId)
            //     await emit(RtcChannel.NEGOTIATE, makeRoute(user))
            // }
        }
        pc.onconnectionstatechange = (e: Event) => {
            logger("connection state with:", user.userId, "\n", pc.connectionState)
            document.title = pc.connectionState
        };
        pc.ontrack = (e: RTCTrackEvent) => {
            logger("tracks changed:", user.userId, e)
            user.tracks.push(e.track);
            set({otherUsers: get().otherUsers})
        }

        await user.connection.updateTracks(useMediaStreamStore.getState().getActualTracks())
    }

    async function processAnswer(user: User, p: RTCSessionDescriptionInit) {
        logger("received ANSWER from:", user.userId)
        await user.connection.receiveAnswer(p);
    }

    async function processIceCandidate(user: User, p: RTCIceCandidate) {
        // log('processIceCandidate from:', user.userId);
        user.connection.iceCandidate(p);
    }

    return {
        otherUsers: [],

        async updateTracks() {
            const tracks = useMediaStreamStore.getState().getActualTracks();
            get().otherUsers.forEach(u => u.connection.updateTracks(tracks))
            console.log('updateTracks:', tracks)
        },

        async enter(currentUserId: UserId, conferenceId: ConferenceId) {
            set({currentUserId, conferenceId})
            const key = makeChannelKey(conferenceId)
            const {subscription} = await joinChannelIfAlreadyNot(key);
            await handlePresence(subscription);
            subscription.on('leave', async () => await handlePresence(subscription));
            subscription.on('join', async () => await handlePresence(subscription));
            on(RtcChannel.OFFER, filterRoute(processOffer));
            on(RtcChannel.ANSWER, filterRoute(processAnswer));
            on(RtcChannel.ICE_CANDIDATE, filterRoute(processIceCandidate));
            // on(RtcChannel.NEGOTIATE, filterRoute((user) => {
            //     log("received NEGOTIATE from:", user.userId)
            //     sendOffer(user)
            // }))
        },

    }
});

function makeChannelKey(conferenceId: ConferenceId) {
    return {key: "conf_" + conferenceId};
}
