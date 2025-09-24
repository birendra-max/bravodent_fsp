import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import AdminRoutes from "./routes/Adminroutes";
import DesignerRoutes from "./routes/DesignerRoutes";
import UserRoutes from './routes/UserRoutes';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UserRoutes />} />
        <Route path="/admin/*" element={<AdminRoutes />} />
        <Route path="/designer/*" element={<DesignerRoutes />} />
      </Routes>
    </BrowserRouter>
  )
}