import React, {memo, useEffect, useMemo, useRef} from "react";
import {HasTrack} from "./HasTrack";

export const AudioTrack = memo(({track}: HasTrack) => {
    const ref = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        const audioTag = ref.current
        audioTag.setAttribute('playsInline', 'true');
        audioTag.setAttribute('playsinline', 'true');
        audioTag.setAttribute('webkit-playsinline', 'true');
        audioTag.setAttribute('autoPlay', 'true')
        audioTag.setAttribute('autoplay', 'true')

        ;(async function() {
            try {
                await audioTag.play();
            } catch (e) {
            }
            try {
                await audioTag.play();
            } catch (e) {
            }
        })();

    }, [track]);

    const ms = useMemo(() => new MediaStream([track]), [track])

    return <audio ref={ref} srcObject={ms}/>;
})