import React from "react";
import {App} from "./app/App";
import {createRoot} from "preact/compat/client";
import {initSignalling} from "./app/signalling";
import {useMediaStreamStore} from "./media/MediaStreamStore";
import {useAppStore} from "./app/AppStore";
import {createMediaStreamPersistentStore} from "./media/createMediaStreamPersistentStore";

(async () => {
    await useMediaStreamStore.getState().restore(createMediaStreamPersistentStore());
    createRoot(document.getElementById('root')).render(<App/>);
    const userId = await initSignalling();
    useAppStore.getState().enter(userId, "deadbeefx")
})();



