import {MediaQuality, MediaStreamStorePersistentStore, TrackType} from "../media-stream/MediaStreamStoreApi";

export function createMediaStreamPersistentStore(): MediaStreamStorePersistentStore {
    return {
        setEnabled(trackType: TrackType, isEnabled: boolean) {
            if (isEnabled)
                localStorage.setItem(trackType, "true");
            else
                localStorage.removeItem(trackType);
        },
        isEnabled(trackType: TrackType): boolean {
            return !!localStorage.getItem(trackType);
        },
        setQuality(quality: MediaQuality) {
            localStorage.setItem("quality", quality);
        },
        getQuality(): MediaQuality {
            const q = localStorage.getItem("quality")
            return q ? MediaQuality[q] : MediaQuality.LOW;
        }
    }
}