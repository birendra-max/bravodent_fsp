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
                {/* <Route path="/multisearch" element={<MultiSearch />} />
                <Route path="/reports" element={<Reports />} /> */}

                {/* <Route path="/new_case" element={<Home />} />
                <Route path="/in_progress" element={<Progress />} />
                <Route path="/canceled_case" element={<Cancel />} />
                <Route path="/completed_case" element={<Completed />} />
                <Route path="/rush_cases" element={<Rush />} />
                <Route path="/qc_required" element={<Qc />} />
                <Route path="/case_on_hold" element={<Hold />} />
                <Route path="/all_cases" element={<AllCases />} />
                <Route path="/yesterday_cases" element={<Yesterday_cases />} />
                <Route path="/today_cases" element={<TodayCases />} />
                <Route path="/weekly_case" element={<WeeklyCases />} />

                <Route path='/profile' element={<Profile />} /> */}
            </Routes>
        </DesignerProvider>
    )
}