import {Conference, ConferenceId, Signalling} from "./types";

export function createConference(id: ConferenceId): Conference {

    const state = {
        signalling: null as Signalling
    };

    return {

        addUser() {
        },

        removeUser() {
        },

        setSignalling(signalling: Signalling) {
            state.signalling = signalling;
        }
    }
}