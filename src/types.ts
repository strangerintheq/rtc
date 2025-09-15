import {Connection} from "./connection/types";

export type ConferenceId = `conferenceId_${string}`;
export type UserId = `userId_${string}`;

export type User = {
    userId: UserId;
    connection?: Connection;
    tracks: MediaStreamTrack[];
}

