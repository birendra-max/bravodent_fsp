import { Routes, Route } from 'react-router-dom';
import Login from '../pages/user/Login';
import Home from "../pages/user/Home";
import NewRequest from '../pages/user/NewRequest';
import MultiSearch from '../pages/user/MultiSearch';
import Reports from '../pages/user/Reports';
import Progress from "../pages/user/Progress";
import Cancel from '../pages/user/Cancel';
import Completed from '../pages/user/Completed';
import Rush from '../pages/user/Rush';
import Hold from '../pages/user/Hold';
import Qc from '../pages/user/Qc';
import AllCases from '../pages/user/AllCases';
import Yesterday_cases from '../pages/user/Yestearday_cases';
import TodayCases from '../pages/user/TodayCases';
import WeeklyCases from '../pages/user/WeeklyCases';
import Profile from '../pages/user/Profile';

export default function UserRoutes() {
    return (
        <Routes>
            <Route index element={<Login />} />
            <Route path="/home" element={<Home />} />
            <Route path="/new_request" element={<NewRequest />} />
            <Route path="/multisearch" element={<MultiSearch />} />
            <Route path="/reports" element={<Reports />} />

            <Route path="/new_case" element={<Home />} />
            <Route path="/in_progress" element={<Progress />} />
            <Route path="/canceled_case" element={<Cancel />} />
            <Route path="/completed_case" element={<Completed />} />
            <Route path="/rush_cases" element={<Rush />} />
            <Route path="/qc_required" element={<Qc />} />
            <Route path="/case_on_hold" element={<Hold />} />
            <Route path="/all_cases" element={<AllCases />} />
            <Route path="/yesterday_cases" element={<Yesterday_cases />} />
            <Route path="/today_cases" element={<TodayCases />} />
            <Route path="/weekly_case" element={<WeeklyCases />} />\

            <Route path='/profile' element={<Profile />} />
        </Routes>
    )
}