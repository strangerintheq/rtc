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
