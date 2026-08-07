import { useEffect } from "react";
import { chatAudioPlay } from "./chatAudioPlay/chatAudioPlay";

export const useTwitchChat = (token: any, login: any, functions: any) => {
  useEffect(() => {
    if (!token || !login) return;

    console.log(functions);

    const ws = new WebSocket("wss://irc-ws.chat.twitch.tv:443");

    ws.onopen = () => {
      ws.send(`PASS oauth:${token}`);
      ws.send(`NICK ${login}`);

      ws.send(`JOIN #${login}`);
    };

    ws.onmessage = (event: MessageEvent<string>) => {
      const rawMessage = event.data.trim();

      if (rawMessage.startsWith("PING")) {
        ws.send("PONG :tmi.twitch.tv");
        return;
      }

      if (rawMessage.includes("PRIVMSG")) {
        const username = rawMessage.slice(1, rawMessage.indexOf("!"));

        const messageIndex = rawMessage.indexOf(" :");
        const message =
          messageIndex !== -1 ? rawMessage.slice(messageIndex + 2) : "";

        console.log(`${username}: ${message}`);
        chatAudioPlay();
      }
    };

    ws.onerror = (error) => {
      console.error("Erro na conexão com o chat da Twitch:", error);
    };

    return () => {
      if (
        ws.readyState === WebSocket.OPEN ||
        ws.readyState === WebSocket.CONNECTING
      ) {
        ws.close();
      }
    };
  }, [token, login]);
};
