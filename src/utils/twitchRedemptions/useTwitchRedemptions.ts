import { useEffect } from "react";

export const useTwitchRedemptions = (
  token: any,
  user_id: any,
  functions: any,
) => {
  useEffect(() => {
    if (!token || !user_id) return;
    console.log(functions);

    const ws = new WebSocket("wss://eventsub.wss.twitch.tv/ws");

    ws.onmessage = async (event: MessageEvent<string>) => {
      const data = JSON.parse(event.data);

      if (data.metadata?.message_type === "session_welcome") {
        const sessionId = data.payload.session.id;

        try {
          await fetch("https://api.twitch.tv/helix/eventsub/subscriptions", {
            method: "POST",
            headers: {
              "Client-ID": "dpyv195nlbka9wh7c7aprukdlua50w",
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              type: "channel.channel_points_custom_reward_redemption.add",
              version: "1",
              condition: {
                broadcaster_user_id: user_id,
              },
              transport: {
                method: "websocket",
                session_id: sessionId,
              },
            }),
          });
          console.log("Inscrição de resgates ativada com sucesso!");
        } catch (error) {
          console.error("Erro ao registrar a inscrição de resgates:", error);
        }
      }

      if (data.metadata?.message_type === "notification") {
        const redemption = data.payload.event;

        const userName = redemption.user_name;
        const rewardTitle = redemption.reward.title;
        const rewardCost = redemption.reward.cost;
        const userInput = redemption.user_input || "";

        console.log(
          `[REDEMPTION] ${userName} resgatou "${rewardTitle}" por ${rewardCost} pontos! ${
            userInput ? `(Texto: ${userInput})` : ""
          }`,
        );
      }
    };

    ws.onerror = (error) => {
      console.error("Erro na conexão WebSocket dos resgates:", error);
    };

    return () => {
      if (
        ws.readyState === WebSocket.OPEN ||
        ws.readyState === WebSocket.CONNECTING
      ) {
        ws.close();
      }
    };
  }, [token, user_id]);
};
