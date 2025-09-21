import React, {memo} from "react";
import {HasTrack} from "./HasTrack";
import {AudioTrack} from "./AudioTrack";
import {VideoTrack} from "./VideoTrack";

export const User = memo(({tracks, connection}: { tracks: MediaStreamTrack[], connection: string }) => {
    return <div style={{border: "1px solid black", width: 300, minHeight: 200}}>
        <div>tracks: {tracks.length} connection: {connection}</div>
        {tracks.map(track => <Track track={track} key={track.id}/>)}
    </div>;
});

const Track = memo(({track}: HasTrack) => {
    return track.kind === "audio" ? <AudioTrack track={track}/> : <VideoTrack track={track}/>;
})
