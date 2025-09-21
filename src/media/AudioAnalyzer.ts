declare global {
    interface Window {
        webkitAudioContext: typeof AudioContext
        AudioContext: typeof AudioContext
    }
}

const audioContext = new (window.AudioContext || window.webkitAudioContext)();


export interface AudioAnalyzer {
    getValue(): number;

    destroy(): void;
}

export function createAudioAnalyzer(track: MediaStreamTrack): AudioAnalyzer {

    const mediaStream = new MediaStream([track]);
    const source = audioContext.createMediaStreamSource(mediaStream)
    const analyserNode = audioContext.createAnalyser()
    source.connect(analyserNode)

    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    return {
        getValue(): number {
            analyserNode.getByteTimeDomainData(dataArray);
            let min = 256, max = 0;
            for (let d in dataArray) {
                min = Math.min(dataArray[d], min)
                max = Math.max(dataArray[d], max)
            }
            let value = (max - min - 1) / 256
            value = Math.max(0, Math.min(value, 1))
            return value
        },

        destroy() {
            analyserNode.disconnect();
        }

    };
}