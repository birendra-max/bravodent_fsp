import React from "react";

import { Routes, Route } from 'react-router-dom';
import Login from '../pages/user/Login';

export default function UserRoutes() {
    return (
        <Routes>
            <Route index element={<Login />} />
        </Routes>
    )
}