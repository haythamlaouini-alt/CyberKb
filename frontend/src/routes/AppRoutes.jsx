import { BrowserRouter, Routes, Route } from "react-router-dom";

import HomePage from "../pages/public/HomePage";
import LoginPage from "../pages/auth/LoginPage";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}