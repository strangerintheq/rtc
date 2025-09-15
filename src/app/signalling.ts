import {connectToCentrifuge} from "@chessclub/realtime_infrastructure";
import {centrifugeInstance} from "@chessclub/realtime_infrastructure/src/RealtimeInfrastructure";
import {UserId} from "../conference/types";

export async function initSignalling(): Promise<UserId> {
    const url = 'https://chessclub.spb.ru/rest/auth.rest.jwt';
    const {session} = await getClientToken(new XMLHttpRequest(), url, "userId", 'test-client');
    const centrifugeUrl = 'wss://chessclub.spb.ru/centrifugo/connection/websocket';
    return new Promise<UserId>((resolve) => {
        connectToCentrifuge(centrifugeUrl, session);
        centrifugeInstance.socket.on('connected', () => {
            resolve(centrifugeInstance.socketId as UserId);
        });
    });
}

export async function getClientToken(
    xhr,
    url: string,
    userId: string,
    name?: string
): Promise<{ session: string; }> {
    return new Promise<{ user_id: string; session: string; }>((resolve, reject) => {
        xhr.open("POST", url);
        xhr.onload = () => resolve(JSON.parse(xhr.response || xhr.responseText))
        xhr.onerror = reject;
        xhr.send(JSON.stringify({user_id: userId, name}));
    });
}