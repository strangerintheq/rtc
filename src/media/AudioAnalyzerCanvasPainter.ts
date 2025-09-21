import {useRef} from "react";

export function AudioAnalyzerCanvasPainter() {
    let gradient, step, data;

    return (ctx2d: CanvasRenderingContext2D, value: number) => {
        const canvas = ctx2d.canvas;

        const h = canvas.height;
        const {clientWidth: w} = canvas.parentElement as Element;

        if (canvas.width !== w || !data|| !step) {
            canvas.width = w;
            data = Array((w / 4) | 0).fill(0)

            step = w / data.length;

            gradient = ctx2d.createLinearGradient(w / 2, 0, w / 2, h);
            gradient.addColorStop(0, "#0000");
            gradient.addColorStop(1, "#0008");
        }


        ctx2d.clearRect(0, 0, w, h)
        ctx2d.fillStyle = gradient;
        ctx2d.fillRect(0, 0, w, h)

        data.shift()
        data.push(Math.min(0.95, Math.pow(value, 1)));

        ctx2d.beginPath()
        const l = data.length;
        for (let i = 0; i < l * 2; i++) {
            const x = (i < l ? i * step : w - (i % l + 1) * step) + step / 2;
            const y = (i < l ? -data[i % l] : data[l - i % l - 1]) * h / 2 + h / 2;
            i === 0 ? ctx2d.moveTo(x, y) : ctx2d.lineTo(x, y);
        }
        ctx2d.closePath()

        ctx2d.strokeStyle = "#fff"
        ctx2d.fillStyle = "#fff3"
        ctx2d.fill();
        ctx2d.stroke();
    }
}