import React from "react";
import {useAppStore} from "./AppStore";
import {ButtonsPanel} from "./components/ButtonsPanel";
import {User} from "./components/User";
import {useMediaStreamStore} from "../media/MediaStreamStore";

export function App() {
    const {otherUsers} = useAppStore();
    const mss = useMediaStreamStore();
    return <div>
        <ButtonsPanel/>
        <div>
            <User tracks={mss.getActualTracks(true)} connection={"self"} status={{audio:true, video:true}}/>
            {otherUsers.map(user => <User id={user.userId} key={user.userId} status={{
                audio: user.remoteAudio,
                video: user.remoteVideo
            }} tracks={user.tracks} connection={user.status}/>)}
        </div>
    </div>
}
