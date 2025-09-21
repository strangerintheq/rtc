import {create} from "zustand";
import {useMediaStreamStore} from "../media/MediaStreamStore";
import {Conference, ConferenceId, User, UserId} from "../conference/types";
import {createConference} from "../conference/createConference";
import {createSignalling} from "./signalling";
import {createLogger} from "./logger";

export interface AppStore {
    conferenceId?: ConferenceId;
    currentUserId?: UserId;
    otherUsers: User[];

    updateTracks();
    enter(currentUser: UserId, conferenceId: string);
}

const log = createLogger({prefix: "[AppStore]", color: "#ddd"})

export const useAppStore = create<AppStore>((
    set,
    get
) => {

    const conference : Conference = createConference();

    conference.onChange = async (users: User[]) => {
        log('users changed', users);
        set({otherUsers: [...get().otherUsers]});
    };

    conference.onJoin = async (users: User[]) => {
        log('users joined', users);
        set({otherUsers: [...get().otherUsers, ...users]});
    };

    conference.onLeft = async (users: User[]) => {
        log('users left', users);
        const otherUsers = [...get().otherUsers];
        users.forEach(user => {
            const targetUser = otherUsers.find(u => u.userId === user.userId)
            otherUsers.splice(otherUsers.indexOf(targetUser), 1)
        })
        set({otherUsers});
    };

    return {
        otherUsers: [],

        async updateTracks() {
            const tracks = useMediaStreamStore.getState().getActualTracks();
            conference.updateTracks(tracks);
        },

        async enter(currentUserId: UserId, conferenceId: ConferenceId) {
            const signalling = createSignalling(currentUserId, conferenceId);
            await conference.connect(currentUserId, signalling);
        },

    }
});
