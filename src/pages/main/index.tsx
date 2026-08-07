import { useEffect } from "react";
import Navbar from "../../components/navbar/navbar";
import { useTwitchAuth } from "../../context/TwitchAuthContext";

export default function Main() {
  const { isConnected, user, connect, disconnect, setAuthData } =
    useTwitchAuth();

  useEffect(() => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const token = params.get("access_token");

    if (token) {
      window.history.replaceState({}, document.title, window.location.pathname);

      fetch("https://api.twitch.tv/helix/users", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Client-Id": "dpyv195nlbka9wh7c7aprukdlua50w",
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.data && data.data.length > 0) {
            const twitchUser = data.data[0];
            setAuthData(token, twitchUser);
          }
        })
        .catch((err) => {
          console.error("Erro ao buscar usuário do Twitch:", err);
        });
    }
  }, [setAuthData]);

  return (
    <>
      <Navbar />

      <div className="p-8">
        {isConnected && user ? (
          <div className="flex items-center gap-4 p-4 bg-green-900/30 border border-green-600 rounded-lg">
            <img
              src={user.profile_image_url}
              alt={user.display_name}
              className="h-16 w-16 rounded-full"
            />
            <div>
              <h2 className="text-xl font-semibold text-green-300">
                Conectado como {user.display_name}
              </h2>
              <p className="text-gray-400 text-left">@{user.login}</p>
            </div>
            <button
              onClick={disconnect}
              className="ml-auto bg-red-600 hover:bg-red-700 transition py-2 px-4 rounded-lg text-white font-semibold"
            >
              Desconectar
            </button>
          </div>
        ) : (
          <div className="text-left">
            <button
              onClick={connect}
              className="bg-purple-600 hover:bg-purple-700 transition py-3 px-8 rounded-lg text-white font-semibold text-lg inline-flex items-center gap-3"
            >
              Conectar com a Twitch
              <img
                src="https://cdn-icons-png.flaticon.com/512/5968/5968819.png"
                width="32px"
                height="32px"
              />
            </button>
          </div>
        )}
      </div>
    </>
  );
}
