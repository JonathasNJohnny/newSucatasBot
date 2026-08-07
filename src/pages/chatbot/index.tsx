import { useEffect, useState } from "react";
import Navbar from "../../components/navbar/navbar";
import { useTwitchAuth } from "../../context/TwitchAuthContext";
import { Eye, EyeOff, Copy, Check } from "lucide-react";

const SWITCHES_STORAGE_KEY = "funcoes_switches";

type FuncoesSwitches = {
  typesnd: boolean;
};

const defaultSwitches: FuncoesSwitches = {
  typesnd: false,
};

function loadSwitches(): FuncoesSwitches {
  try {
    const raw = localStorage.getItem(SWITCHES_STORAGE_KEY);
    if (!raw) return defaultSwitches;
    return { ...defaultSwitches, ...JSON.parse(raw) };
  } catch {
    return defaultSwitches;
  }
}

export default function Chatbot() {
  const { isConnected, user, token } = useTwitchAuth();
  const [switches, setSwitches] = useState<FuncoesSwitches>(loadSwitches);
  const [showUrl, setShowUrl] = useState(false);
  const [copied, setCopied] = useState(false);

  const { typesnd } = switches;

  useEffect(() => {
    localStorage.setItem(SWITCHES_STORAGE_KEY, JSON.stringify(switches));
  }, [switches]);

  const toggleSwitch = (key: keyof FuncoesSwitches) => {
    setSwitches((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const baseUrl = `${window.location.origin}/overlay`;
  const overlayUrl =
    isConnected && user && token
      ? `${baseUrl}?tkn=${token}&usr=${user.login}&usr_id=${user.id}${typesnd ? "&typesnd=true" : ""}`
      : "";

  const handleCopy = async () => {
    if (!overlayUrl) return;
    try {
      await navigator.clipboard.writeText(overlayUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Erro ao copiar URL:", err);
    }
  };

  return (
    <>
      <Navbar />

      <div className="p-8 text-left">
        {/* URL da Overlay */}
        <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-700 max-w-2xl">
          <label className="block text-sm font-medium text-gray-400 mb-2 text-left">
            URL da Overlay
          </label>

          {isConnected && overlayUrl ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowUrl((prev) => !prev)}
                title={showUrl ? "Ocultar URL" : "Mostrar URL"}
                className="flex-shrink-0 p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white transition"
              >
                {showUrl ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>

              <button
                type="button"
                onClick={handleCopy}
                title={copied ? "Copiado!" : "Copiar URL"}
                className="flex-shrink-0 p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white transition relative"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-green-400" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </button>

              <input
                type="text"
                readOnly
                value={overlayUrl}
                className={`flex-1 min-w-0 bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white outline-none select-all transition-[filter] ${
                  showUrl ? "blur-none" : "blur-sm select-none"
                }`}
              />
            </div>
          ) : (
            <p className="text-gray-500 text-sm text-left">
              Conecte na Twitch para gerar o link
            </p>
          )}
        </div>

        <div className="mb-4 p-4 bg-gray-800 rounded-lg border border-gray-700 max-w-2xl">
          <label
            className={`flex items-center gap-3 ${
              isConnected ? "cursor-pointer" : "cursor-not-allowed opacity-60"
            }`}
          >
            <button
              type="button"
              role="switch"
              aria-checked={typesnd}
              disabled={!isConnected}
              onClick={() => toggleSwitch("typesnd")}
              className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${
                typesnd ? "bg-purple-600" : "bg-gray-600"
              }`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                  typesnd ? "translate-x-4.5" : "translate-x-1"
                }`}
              />
            </button>
            <span className="text-white text-lg text-left">
              Barulho ao falar no chat
            </span>
            {!isConnected && (
              <span className="text-gray-500 text-sm ml-auto">
                (requer conexão)
              </span>
            )}
          </label>
        </div>
      </div>
    </>
  );
}
