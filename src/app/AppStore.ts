import {create} from "zustand";
import {useMediaStreamStore} from "../media-stream/MediaStreamStore";
import {ConferenceId, User, UserId} from "../conference/types";
import {logger} from "./logger";
import {createConference} from "../conference/createConference";
import {createSignalling} from "./signalling";

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

    const log = (...args) => console.log("[Conference]", ...args);
    const conference = createConference(log);

    async function handleLeft(newOtherUsers: UserId[]) {
        const leftUsers = get().otherUsers.filter(u => !newOtherUsers.includes(u.userId));
        if (!leftUsers.length)
            return;
        logger('[AppStore] handleLeft, leftUsers:', leftUsers);
        leftUsers.forEach(u => u.connection.disconnect())
        set({otherUsers: get().otherUsers.filter(u => !leftUsers.includes(u))})
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
        // joinedUsers.map(async user => {
        //     if (determineMaster(get().currentUserId, user.userId)) {
        //         await createConnectionToUser(user, true);
        //         await sendOffer(user);
        //     }
        // });
    }



    return {
        otherUsers: [],

        async updateTracks() {
            const tracks = useMediaStreamStore.getState().getActualTracks();
            conference.updateTracks(tracks);
            log('updateTracks:', tracks)
        },

        async enter(currentUserId: UserId, conferenceId: ConferenceId) {
            const signalling = createSignalling(currentUserId, conferenceId);
            await conference.connect(currentUserId, signalling);
        },

    }
});

function makeChannelKey(conferenceId: ConferenceId) {
    return {key: "conf_" + conferenceId};
}
