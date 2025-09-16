import {create} from "zustand";
import {useMediaStreamStore} from "../media-stream/MediaStreamStore";
import {Conference, ConferenceId, User, UserId} from "../conference/types";
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

    const log = (...args) => console.log("[Conference]", ...args.map(a => [a, "\n"]).flat());
    const conference : Conference = createConference(log);
    conference.onChange = async (users: User[]) => {
        log('users changed', users)
    };
    conference.onJoin = async (users: User[]) => {
        log('users joined', users)
    };
    conference.onLeft = async (users: User[]) => {
        log('users left', users)
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

function makeChannelKey(conferenceId: ConferenceId) {
    return {key: "conf_" + conferenceId};
}
