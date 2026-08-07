import AppRoutes from "./routes";
import { TwitchAuthProvider } from "./context/TwitchAuthContext";

export default function App() {
  return (
    <TwitchAuthProvider>
      <AppRoutes />
    </TwitchAuthProvider>
  );
}
