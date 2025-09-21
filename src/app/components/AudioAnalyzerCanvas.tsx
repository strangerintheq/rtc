import React, {CSSProperties, useEffect, useRef} from "react";
import {AudioAnalyzer, createAudioAnalyzer} from "../../media/AudioAnalyzer";
import {AudioAnalyzerCanvasPainter} from "../../media/AudioAnalyzerCanvasPainter";

export function AudioAnalyzerCanvas(props: { track: MediaStreamTrack, style?: CSSProperties }) {
    const ctx = useRef<CanvasRenderingContext2D>(null);
    const analyzer = useRef<AudioAnalyzer>(null);
    const animationFrame = useRef<number>(0);
    useEffect(() => {
        const painter = AudioAnalyzerCanvasPainter()
        if (props.track) {
            analyzer.current = createAudioAnalyzer(props.track);
            let prevT = 0
            const animate = (t) => {
                document.title = t-prevT;
                prevT = t
                painter(ctx.current, analyzer.current.getValue());
                animationFrame.current = requestAnimationFrame(animate);
            };
            animationFrame.current = requestAnimationFrame(animate);
            return () => {
                ctx.current.clearRect(0, 0, 1e5, 1e5)
                cancelAnimationFrame(animationFrame.current)
                analyzer.current.destroy();
                analyzer.current = null;
            }
        }
    }, [props.track])

    return <canvas
        height={50}
        ref={canvas => ctx.current = canvas?.getContext("2d") as any}
        style={props.style}
    />;
}