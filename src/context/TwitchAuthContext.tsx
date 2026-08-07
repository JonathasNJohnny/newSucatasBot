import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  useEffect,
} from "react";

interface TwitchUser {
  id: string;
  login: string;
  display_name: string;
  email?: string;
  profile_image_url: string;
}

interface TwitchAuthContextType {
  isConnected: boolean;
  user: TwitchUser | null;
  token: string | null;
  connect: () => void;
  disconnect: () => void;
  setAuthData: (token: string, user: TwitchUser) => void;
}

const TwitchAuthContext = createContext<TwitchAuthContextType | undefined>(
  undefined,
);

const client_id = import.meta.env.VITE_CLIENT_ID;

export function TwitchAuthProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [user, setUser] = useState<TwitchUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("twitch_token");
    const savedUser = localStorage.getItem("twitch_user");

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      setIsConnected(true);
    }
  }, []);

  const setAuthData = (newToken: string, newUser: TwitchUser) => {
    setToken(newToken);
    setUser(newUser);
    setIsConnected(true);
    localStorage.setItem("twitch_token", newToken);
    localStorage.setItem("twitch_user", JSON.stringify(newUser));
  };

  const disconnect = () => {
    setToken(null);
    setUser(null);
    setIsConnected(false);
    localStorage.removeItem("twitch_token");
    localStorage.removeItem("twitch_user");
  };

  const connect = () => {
    const scopes = [
      "chat:read",
      "chat:edit",
      "user:read:email",
      "channel:read:redemptions",
      "channel:manage:redemptions",
    ].join(" ");

    window.location.href =
      `https://id.twitch.tv/oauth2/authorize` +
      `?client_id=${client_id}` +
      `&redirect_uri=${encodeURIComponent("http://localhost:5173/main")}` +
      `&response_type=token` +
      `&scope=${encodeURIComponent(scopes)}`;
  };

  return (
    <TwitchAuthContext.Provider
      value={{
        isConnected,
        user,
        token,
        connect,
        disconnect,
        setAuthData,
      }}
    >
      {children}
    </TwitchAuthContext.Provider>
  );
}

export function useTwitchAuth() {
  const context = useContext(TwitchAuthContext);
  if (!context) {
    throw new Error(
      "useTwitchAuth deve ser usado dentro de um TwitchAuthProvider",
    );
  }
  return context;
}
