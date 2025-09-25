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

            <Route path="/new_case" element={<Reports />} />
            <Route path="/in_progress" element={<Reports />} />
            <Route path="/canceled_case" element={<Reports />} />
            <Route path="/completed_case" element={<Reports />} />
            <Route path="/rush_cases" element={<Reports />} />
            <Route path="/qc_required" element={<Reports />} />
            <Route path="/case_on_hold" element={<Reports />} />
            <Route path="/all_cases" element={<Reports />} />
            <Route path="/yesterday_cases" element={<Reports />} />
            <Route path="/today_cases" element={<Reports />} />
            <Route path="/weekly_case" element={<Reports />} />\

        </Routes>
    )
}