import { Routes, Route } from 'react-router-dom';
import Login from "../pages/admin/Login";
import Dashboard from '../pages/admin/Dashboard';
import { AdminProvider } from '../Context/AdminContext';
import AllClients from '../pages/admin/AllClients';
import AddClient from '../pages/admin/AddClient';
import ClientReports from '../pages/admin/ClientResports';
import AllDesigner from '../pages/admin/AllDesigner';
export default function Adminroutes() {
    return (
        <AdminProvider>
            <Routes>
                <Route index element={<Login />} />
                <Route path='/dashboard' element={<Dashboard />} />
                <Route path='/all-clients' element={<AllClients />} />
                <Route path='/add-client' element={<AddClient />} />
                <Route path='/clients-report' element={<ClientReports />} />
                <Route path='/all-designer' element={<AllDesigner />} />
            </Routes>
        </AdminProvider>
    )
}