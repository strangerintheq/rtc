import React, {memo, useEffect, useMemo, useRef} from "react";
import {HasTrack} from "./HasTrack";

export const VideoTrack = memo(({track}: HasTrack) => {
    const ref = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const videoTag = ref.current
        videoTag.autoplay = true;
        videoTag.style.width = "300px";
        videoTag.disablePictureInPicture = true;
        videoTag.controls = false;
        videoTag.playsInline = true;
        videoTag.muted = true;
        videoTag.setAttribute('playsInline', 'true');
        videoTag.setAttribute('playsinline', 'true');
        videoTag.setAttribute('webkit-playsinline', 'true');
        videoTag.setAttribute('autoPlay', 'true')
    }, []);

    const ms = useMemo(() => new MediaStream([track]), [track])

    return <video ref={ref} srcObject={ms}/>;
})

