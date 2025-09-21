import React, {memo} from "react";
import {AudioTrack} from "./AudioTrack";
import {VideoTrack} from "./VideoTrack";

type UserParams = {
    mute: boolean;
    status: { audio: boolean; video: boolean };
    tracks: MediaStreamTrack[];
    connection: string;
}

export const User = memo(({tracks, connection, status}: UserParams) => {
    return <div style={{border: "1px solid black", width: 300, minHeight: 200}}>
        <div>{"a:" + (status.audio ? 1 : 0) + " v:" + (status.video ? 1 : 0)} c: {connection}</div>
        {tracks.map(track => {
            return track.kind === "audio" ?
                <AudioTrack track={track} enabled={status.audio}/> :
                <VideoTrack track={track} enabled={status.video}/>;
        })}
    </div>;
});

