import { BrowserRouter, Routes, Route } from "react-router-dom";

import Main from "../pages/main";
import Chatbot from "../pages/chatbot";
import Overlay from "../pages/overlay";
import Funcoes from "../pages/redemptions";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/main" element={<Main />} />
        <Route path="/chatbot" element={<Chatbot />} />
        <Route path="/overlay" element={<Overlay />} />
        <Route path="/redemptions" element={<Funcoes />} />
      </Routes>
    </BrowserRouter>
  );
}
