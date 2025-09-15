import {Conference, ConferenceId, Logger, RtcMessage, Signalling, User, UserId} from "./types";

import {createConnection} from "./createConnection";
import {useMediaStreamStore} from "../media-stream/MediaStreamStore";
import {determineMaster} from "./determineMaster";

export function createConference(log: Logger): Conference {

    const state = {
        conferenceId: null as ConferenceId,
        currentUserId: null as UserId,
        signalling: null as Signalling,
        otherUsers: [] as User[]
    };

    async function join(userId: UserId) {
        const user: User = {userId, tracks: []};
        state.otherUsers.push(user);
        if (determineMaster(state.currentUserId, userId)) {
            await createConnectionToUser(user, true);
            await sendOffer(user);
        }
    }

    async function leave(userId: UserId) {
        const user = state.otherUsers.find(u => u.userId === userId);
        await user.connection.disconnect();
        state.otherUsers.splice(state.otherUsers.indexOf(user), 1);
    }

    async function createConnectionToUser(user: User, master: boolean) {
        if (user.connection)
            return;
        log('createConnection \nsrc:', state.currentUserId, "\ndst:", user.userId);
        user.connection = createConnection(state.currentUserId, user.userId);
        const pc = user.connection.state.peerConnection;
        pc.onicecandidate = async (e) => {
            await state.signalling.iceCandidate.emit(rtcMessage(user, e.candidate))
        };
        pc.onnegotiationneeded = async (e) => {
            log("negotiation needed with:", user.userId);
            await sendOffer(user);
        }
        pc.onconnectionstatechange = (e: Event) => {
            log("connection state with:", user.userId, "\n", pc.connectionState)
            document.title = pc.connectionState
        };
        pc.ontrack = (e: RTCTrackEvent) => {
            log("tracks changed:", user.userId, e)
            user.tracks.push(e.track);
        };

        await user.connection.updateTracks(useMediaStreamStore.getState().getActualTracks())
    }

    async function sendOffer(user: User) {
        const offer = await user.connection.createOffer();
        log("send offer to:", user.userId);
        await state.signalling.offer.emit(rtcMessage(user, offer));
    }

    async function processOffer(user: User, offer: RTCSessionDescription) {
        log("received OFFER from:", user.userId)
        await createConnectionToUser(user, false);
        const answer = await user.connection.receiveOffer(offer);
        log("send ANSWER to:", user.userId)
        await state.signalling.answer.emit(rtcMessage(user, answer))
    }

    async function processAnswer(user: User, answer: RTCSessionDescription) {
        log("received ANSWER from:", user.userId)
        await user.connection.receiveAnswer(answer);
    }

    async function processCandidate(user: User, candidate: RTCIceCandidate) {
        log("received ICE_CANDIDATE from:", user.userId)
        await user.connection.iceCandidate(candidate);
    }

    function forUser<P>(callback: (user: User, payload: P) => void): (route: RtcMessage<P>) => void {
        return (r: RtcMessage<P>) => callback(state.otherUsers.find(u => u.userId === r.from), r.payload)
    }

    function rtcMessage<T>(to: User, payload?: T): RtcMessage<T> {
        return {from: state.currentUserId, to: to.userId, payload}
    }

    return {
        async connect(currentUserId: UserId, conferenceId: ConferenceId, signalling: Signalling) {
            state.currentUserId = currentUserId;
            state.conferenceId = conferenceId;
            state.signalling = signalling;
            signalling.onJoin(join);
            signalling.onLeave(leave);
            signalling.offer.on(forUser(processOffer));
            signalling.answer.on(forUser(processAnswer));
            signalling.iceCandidate.on(forUser(processCandidate));
            signalling.connect(conferenceId);
        },
        async disconnect() {

        },
    }
}