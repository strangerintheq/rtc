import {Conference, Logger, RtcMessage, Signalling, User, UserId} from "./types";
import {createConnection} from "./createConnection";
import {useMediaStreamStore} from "../media-stream/MediaStreamStore";
import {determineMaster} from "./determineMaster";

export function createConference(log: Logger): Conference {

    const state = {
        currentUserId: null as UserId,
        signalling: null as Signalling,
        otherUsers: [] as User[]
    };

    const rtcMessage = <T>(to: User, payload?: T): RtcMessage<T> => ({
        from: state.currentUserId, to: to.userId, payload});

    const forUser = <P>(callback: (user: User, payload: P) => void): (route: RtcMessage<P>) =>
        void => (r: RtcMessage<P>) => callback(state.otherUsers.find(u => u.userId === r.from), r.payload);

    async function processNewUserIdList(newUserList: UserId[]) {
        const newOtherUsers = newUserList
            .filter(id => id !== state.currentUserId);
        await handleJoined(newOtherUsers);
        await handleLeft(newOtherUsers);
    }

    async function handleLeft(newOtherUsers: UserId[]) {
        const leftUsers = state.otherUsers.filter(u => !newOtherUsers.includes(u.userId));
        for (const user of leftUsers) {
            log('user left:', user.userId);
            await user.connection.disconnect();
            state.otherUsers.splice(state.otherUsers.indexOf(user), 1);
        }
    }

    async function handleJoined(newOtherUsers: UserId[]) {
        const oldOtherUsersIds = state.otherUsers.map(u => u.userId);
        const joinedUsersIds = newOtherUsers.filter(id => !oldOtherUsersIds.includes(id))
        for (const userId of joinedUsersIds) {
            log('user joiner:', userId);
            const user = {userId, tracks: []};
            state.otherUsers.push(user)
            if (determineMaster(state.currentUserId, userId)) {
                await createConnectionToUser(user, true);
                await sendOffer(user);
            }
        }
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

    return {
        async connect(currentUserId: UserId,  signalling: Signalling) {
            log('connect, currentUserId:', currentUserId)
            state.currentUserId = currentUserId;
            state.signalling = signalling;
            signalling.setUserIdList = processNewUserIdList;
            signalling.offer.on(forUser(processOffer));
            signalling.answer.on(forUser(processAnswer));
            signalling.iceCandidate.on(forUser(processCandidate));
            await signalling.connect();
        },
        async disconnect() {
            await state.signalling.off();
            await handleLeft(state.otherUsers.map( u=> u.userId));
        },

        updateTracks(tracks: MediaStreamTrack[]) {
            state.otherUsers.forEach(u => u.connection.updateTracks(tracks))
        }
    }
}