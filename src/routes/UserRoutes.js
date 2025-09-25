import React from "react";

import { Routes, Route } from 'react-router-dom';
import Login from '../pages/user/Login';
import Home from "../pages/user/Home";
import NewRequest from '../pages/user/NewRequest';
import MultiSearch from '../pages/user/MultiSearch';
import Reports from '../pages/user/Reports';

export default function UserRoutes() {


    return (
        <Routes>
            <Route index element={<Login />} />
            <Route path="/home" element={<Home />} />
            <Route path="/new_request" element={<NewRequest />} />
            <Route path="/multisearch" element={<MultiSearch />} />
            <Route path="/reports" element={<Reports />} />
        </Routes>
    )
}