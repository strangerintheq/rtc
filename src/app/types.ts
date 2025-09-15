import {Connection} from "../conference/types";

export type ConferenceId = `conf_${string}`;

export type UserId = `user_${string}`;

export type User = {
    userId: UserId;
    connection?: Connection;
    tracks: MediaStreamTrack[];
}

