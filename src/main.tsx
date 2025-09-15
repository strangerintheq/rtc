import React from "react";
import {App} from "./App";
import {getClientToken} from "./getClientToken";
import {createRoot} from "preact/compat/client";
import {connectToCentrifuge} from "@chessclub/realtime_infrastructure";
import {ContainerNode} from "preact";
import {ConferenceId, UserId} from "./types";
import {centrifugeInstance} from "@chessclub/realtime_infrastructure/src/RealtimeInfrastructure";
import {useAppStore} from "./AppStore";


const root = document.getElementById('root') as ContainerNode;
createRoot(root).render(<App/>);

(async function (){
    const url = 'https://chessclub.spb.ru/rest/auth.rest.jwt';
    const xhr = new XMLHttpRequest();
    const {session} = await getClientToken(xhr, url, "userId", 'test-client');
    const centrifugeUrl = 'wss://chessclub.spb.ru/centrifugo/connection/websocket';
    connectToCentrifuge(centrifugeUrl, session);
    centrifugeInstance.socket.on('connected', () => {
        const userId = centrifugeInstance.socketId as UserId;
        const conferenceId = 'deadbeef' as ConferenceId;
        useAppStore.getState().enter(userId, conferenceId)
    })
})();


