import {Conference, Logger, RtcMessage, Signalling, User, UserId} from "./types";
import {createConnection} from "./createConnection";
import {useMediaStreamStore} from "../media-stream/MediaStreamStore";
import {determineMaster} from "./determineMaster";

export function createConference(log: Logger = (_ => {})): Conference {

    const state = {
        currentUserId: null as UserId,
        signalling: null as Signalling,
        otherUsers: [] as User[]
    };

    const rtcMessage = <T>(to: User, payload?: T): RtcMessage<T> => ({
        from: state.currentUserId, to: to.userId, payload});

    function forUser<P>(callback: (user: User, payload: P) => void): (route: RtcMessage<P>) => void {
        return (r: RtcMessage<P>) => {
            const user = state.otherUsers.find(u => u.userId === r.from);
            user && callback(user, r.payload);
        };
    }

    async function processNewUserIdList(newUserList: UserId[]) {
        const newOtherUsersIds = newUserList
            .filter(id => id !== state.currentUserId);
        await handleJoined(toJoiningUsers(newOtherUsersIds));
        await handleLeft(toLeavingUsers(newOtherUsersIds));
    }

    function toLeavingUsers(newOtherUsersIds: UserId[]) {
        return state.otherUsers.filter(u => !newOtherUsersIds.includes(u.userId));
    }

    function toJoiningUsers(newOtherUsersIds: UserId[]) : User[]{
        const oldOtherUsersIds = state.otherUsers.map(u => u.userId);
        return newOtherUsersIds.filter(id => !oldOtherUsersIds.includes(id))
            .map(userId => ({userId, tracks: []}))
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

    const conference: Conference = {

        onChange: null,
        onJoin: null,
        onLeft: null,

        async connect(currentUserId: UserId, signalling: Signalling) {
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
            await handleLeft(state.otherUsers);
        },

        updateTracks(tracks: MediaStreamTrack[]) {
            log('updateTracks:', tracks)
            state.otherUsers.forEach(u => u.connection.updateTracks(tracks))
        }
    };

    async function handleLeft(leftUsers: User[]) {
        for (const user of leftUsers) {
            log('user left:', user.userId);
            await user.connection.disconnect();
            state.otherUsers.splice(state.otherUsers.indexOf(user), 1);
        }
        leftUsers.length && await conference.onLeft(leftUsers)
    }

    async function handleJoined(joinedUsers: User[]) {
        for (const user of joinedUsers) {
            log('user joined:', user.userId);
            state.otherUsers.push(user)
            if (determineMaster(state.currentUserId, user.userId)) {
                await createConnectionToUser(user, true);
                await sendOffer(user);
            }
        }
        joinedUsers.length && await conference.onJoin(joinedUsers)
    }

    async function createConnectionToUser(user: User, master: boolean) {
        if (user.connection)
            return;
        log('createConnection \nsrc:', state.currentUserId, "\ndst:", user.userId);
        user.connection = createConnection(state.currentUserId, user.userId);

        const actualTracks = useMediaStreamStore.getState().getActualTracks();
        log('setupTracks', actualTracks);
        user.connection.updateTracks(actualTracks);

        const pc = user.connection.state.peerConnection;
        pc.onicecandidate = async (e) => {
            await state.signalling.iceCandidate.emit(rtcMessage(user, e.candidate))
        };

        pc.onconnectionstatechange = (e: Event) => {
            log("connection state with:", user.userId, "\n", pc.connectionState)
            document.title = pc.connectionState
            if (pc.connectionState === "connected" && !pc.onnegotiationneeded) {
                pc.onnegotiationneeded = async (e) => {
                    log("negotiation needed with:", user.userId);
                    await sendOffer(user);
                }
            }
        };
        pc.ontrack = (e: RTCTrackEvent) => {
            log("tracks changed:", user.userId, e)
            user.tracks.push(e.track);
            conference.onChange([user])
        };
    }

    return conference;
}