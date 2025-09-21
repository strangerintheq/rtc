import {User, UserId} from "./types";

export function createUser(userId: UserId): User {
    return {
        userId,
        tracks: [],
        progress: 0,
        iceCandidates: [],
        status: ""
    }
}