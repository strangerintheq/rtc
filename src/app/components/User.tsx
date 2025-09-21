import React, {memo} from "react";
import {AudioTrack} from "./AudioTrack";
import {VideoTrack} from "./VideoTrack";
import {AudioAnalyzerCanvas} from "./AudioAnalyzerCanvas";

type UserParams = {
    mute?: boolean;
    status: { audio: boolean; video: boolean };
    tracks: MediaStreamTrack[];
    connection: string;
    id?
}

export const User = memo(({tracks, connection, status,id}: UserParams) => {
    const audio = tracks.find(t => t.kind === 'audio')
    const video = tracks.find(t => t.kind === 'video')
    return <div style={{border: "1px solid black", width: 300, minHeight: 200}}>
        <div>{"a:" + (status.audio ? 1 : 0) + " v:" + (status.video ? 1 : 0)} c: {connection} {id}</div>
        {audio && status.audio && <>
            <AudioTrack track={audio} enabled={status.audio}/>
            {/*<AudioAnalyzerCanvas track={audio}/>*/}
        </>}
        {video && <VideoTrack track={video} enabled={status.video}/>}
    </div>;
});

