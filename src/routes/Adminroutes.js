import { Routes, Route } from 'react-router-dom';
import Login from "../pages/admin/Login";
import Dashboard from '../pages/admin/Dashboard';
import { AdminProvider } from '../Context/AdminContext';
import AllClients from '../pages/admin/AllClients';
import AddClient from '../pages/admin/AddClient';
export default function Adminroutes() {
    return (
        <AdminProvider>
            <Routes>
                <Route index element={<Login />} />
                <Route path='/dashboard' element={<Dashboard />} />
                <Route path='/all-clients' element={<AllClients />} />
                <Route path='/add-client' element={<AddClient />} />
            </Routes>
        </AdminProvider>
    )
}