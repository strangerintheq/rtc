import {MediaQuality, MediaStreamStorePersistentStore, TrackType} from "./MediaStreamStoreApi";

export function createMediaStreamPersistentStore(prefix: string = ""): MediaStreamStorePersistentStore {

    const getKey = (name: string) => prefix + "_" + name;
    const qualityKey = getKey("quality");

    return {
        setEnabled(trackType: TrackType, isEnabled: boolean) {
            if (isEnabled)
                localStorage.setItem(getKey(trackType), "true");
            else
                localStorage.removeItem(getKey(trackType));
        },
        isEnabled(trackType: TrackType): boolean {
            return !!localStorage.getItem(getKey(trackType));
        },
        setQuality(quality: MediaQuality) {
            localStorage.setItem(qualityKey, quality);
        },
        getQuality(): MediaQuality {
            const q = localStorage.getItem(qualityKey)
            return q ? MediaQuality[q] : MediaQuality.LOW;
        }
    }
}