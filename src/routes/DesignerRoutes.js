import React from "react";

import { Routes, Route } from 'react-router-dom';
import Login from '../pages/designer/Login';

export default function DesignerRoutes() {
    return (
        <Routes>
            <Route index element={<Login />} />
        </Routes>
    )
}