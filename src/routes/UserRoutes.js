import React from "react";

import { Routes, Route } from 'react-router-dom';
import Login from '../pages/user/Login';
import Home from "../pages/user/Home";

export default function UserRoutes() {


    return (
        <Routes>
            <Route index element={<Login />} />
            <Route path="/home" element={<Home />} />
        </Routes>
    )
}