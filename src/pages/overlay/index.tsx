import { useEffect } from "react";
import "./index.css";
import { useTwitchChat } from "../../utils/twitchChat/useTwitchChat";
import { useTwitchRedemptions } from "../../utils/twitchRedemptions/useTwitchRedemptions";

export default function Overlay() {
  const params = new URLSearchParams(window.location.search);
  const user = params.get("usr");
  const token = params.get("tkn");
  const user_id = params.get("usr_id");
  const typesnd = params.get("typesnd") === "true";
  console.log("Overlay params:", { user, token, user_id, typesnd });
  const chatFunctions = {
    chatMessageSound: typesnd,
  };
  const redemptionsFunctions = {};
  if (token && user && user_id) {
    useTwitchChat(token, user, chatFunctions);
    useTwitchRedemptions(token, user_id, redemptionsFunctions);
  }
  useEffect(() => {
    document.documentElement.classList.add("overlay-page");
    document.body.classList.add("overlay-page");

    return () => {
      document.documentElement.classList.remove("overlay-page");
      document.body.classList.remove("overlay-page");
    };
  }, []);

  return <div className="fixed inset-0 pointer-events-none"></div>;
}
