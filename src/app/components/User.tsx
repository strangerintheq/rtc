import React, {memo, useEffect, useRef} from "react";
import {HasTrack} from "./HasTrack";
import {AudioTrack} from "./AudioTrack";
import {VideoTrack} from "./VideoTrack";

export const User = memo(({tracks, connection, status}: { status?:string; tracks: MediaStreamTrack[], connection: string }) => {

    return <div style={{border: "1px solid black", width: 300, minHeight: 200}}>
        <div>{status} connection: {connection}</div>
        {tracks.map(track => <Track track={track} key={track.id}/>)}
    </div>;
});

const Track = memo(({track}: HasTrack) => {
    return track.kind === "audio" ? <AudioTrack track={track}/> : <VideoTrack track={track}/>;
})
