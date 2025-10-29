import React from "react";

import { Routes, Route } from 'react-router-dom';
import Login from '../pages/designer/Login';
import Home from "../pages/designer/Home";
import NewRequest from "../pages/designer/NewRequest";
import { DesignerProvider } from "../Context/DesignerContext";

export default function DesignerRoutes() {
    return (
        <DesignerProvider>
            <Routes>
                <Route index element={<Login />} />
                <Route path="/home" element={<Home />} />
                <Route path="/new_request" element={<NewRequest />} />
            </Routes>
        </DesignerProvider>
    )
}