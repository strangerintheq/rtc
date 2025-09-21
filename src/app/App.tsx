import React from "react";
import {useAppStore} from "./AppStore";
import {useMediaStreamStore} from "../media-stream/MediaStreamStore";
import {ButtonsPanel} from "./components/ButtonsPanel";
import {User} from "./components/User";

export function App() {
    const {otherUsers} = useAppStore();
    const mss = useMediaStreamStore();
    return <div>
        <ButtonsPanel/>
        <div>
            <User tracks={mss.getActualTracks(true)} connection={"self"} />
            {otherUsers.map(user => <User key={user.userId} tracks={user.tracks} connection={user.status}/>)}
        </div>
    </div>
}
