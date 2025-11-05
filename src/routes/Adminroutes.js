import { Routes, Route } from 'react-router-dom';
import Login from "../pages/admin/Login";
import Dashboard from '../pages/admin/Dashboard';
import { AdminProvider } from '../Context/AdminContext';
export default function Adminroutes() {
    return (
        <AdminProvider>
            <Routes>
                <Route index element={<Login />} />
                <Route path='/dashboard' element={<Dashboard />} />
            </Routes>
        </AdminProvider>
    )
}