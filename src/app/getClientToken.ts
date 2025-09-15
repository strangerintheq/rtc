export async function getClientToken(
    xhr,
    url: string,
    userId: string,
    name?:string
): Promise<{ user_id: string; session: string; }> {
    return new Promise<{ user_id: string; session: string; }>((resolve, reject) => {
        xhr.open("POST", url);
        xhr.onload = () => resolve(JSON.parse(xhr.response || xhr.responseText))
        xhr.onerror = reject;
        xhr.send(JSON.stringify({user_id: userId, name}));
    });
}
