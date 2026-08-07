import { useTwitchAuth } from "../../context/TwitchAuthContext";

export default function Navbar() {
  const { isConnected, user } = useTwitchAuth();

  return (
    <nav className="grid h-16 grid-cols-3 items-center bg-gray-800 px-6 text-white">
      <div className="text-left">
        Status:{" "}
        {isConnected ? (
          <span className="text-green-400">Conectado</span>
        ) : (
          <span className="text-red-400">Desconectado</span>
        )}
      </div>
      <div className="flex justify-center">
        <a href="/main" className="text-lg font-medium hover:text-gray-300">
          Menu
        </a>
        <a
          href="/chatbot"
          className="text-lg font-medium hover:text-gray-300 ml-6"
        >
          ChatBot
        </a>
        <a
          href="/redemptions"
          className="text-lg font-medium hover:text-gray-300 ml-6"
        >
          Resgates
        </a>
      </div>
      <div className="flex justify-end items-center gap-4">
        {isConnected && user ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-green-300">{user.display_name}</span>
            <img
              src={user.profile_image_url}
              alt={user.display_name}
              className="h-8 w-8 rounded-full border border-gray-600 object-cover"
            />
          </div>
        ) : (
          <img
            src="https://i.pravatar.cc/40"
            alt="Perfil"
            className="h-10 w-10 rounded-full border border-gray-600 object-cover"
          />
        )}
      </div>
    </nav>
  );
}
