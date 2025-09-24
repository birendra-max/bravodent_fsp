import React from "react";

import { Routes, Route } from 'react-router-dom';
import Login from "../pages/admin/Login";

export default function Adminroutes() {
    return (
        <Routes>
            <Route>
                <Route index element={<Login />} />
            </Route>
        </Routes>
    )
}