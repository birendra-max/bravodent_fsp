import React, { useContext, useEffect, useState } from "react";
import Hd from './Hd';
import Foot from './Foot';
import { UserContext } from "../../Context/UserContext";
import Datatable from "./Datatable";
import { useNavigate } from 'react-router-dom';
import Dashboard from "./Dashboard";
import { ThemeContext } from "../../Context/ThemeContext";

export default function TodayCases() {
    const { theme, setTheme } = useContext(ThemeContext);
    const navigate = useNavigate();

    const { user } = useContext(UserContext);
    const [data, setData] = useState([]);

    const columns = [
        { header: "Order Id", accessor: "orderid" },
        { header: "File Name", accessor: "fname" },
        { header: "TAT", accessor: "tduration" },
        { header: "Status", accessor: "status" },
        { header: "Unit", accessor: "unit" },
        { header: "Tooth", accessor: "tooth" },
        { header: "Lab Name", accessor: "labname" },
        { header: "Date", accessor: "order_date" },
        { header: "Message", accessor: "message" },
    ];

    useEffect(() => {
        const checkSession = async () => {
            try {
                const resp = await fetch('http://localhost/bravodent_ci/session-check', {
                    method: "GET",
                    credentials: "include",
                });

                const data = await resp.json();

                if (data.status !== "success") {
                    navigate("/", { replace: true });
                }
            } catch (error) {
                navigate("/", { replace: true });
            }
        };

        checkSession();
    }, [navigate]);


    useEffect(() => {
        async function fetchNewCases() {
            try {
                const res = await fetch('http://localhost/bravodent_ci/today-cases', {
                    method: "GET",
                    credentials: "include",
                });

                const da_ta = await res.json();

                if (da_ta.status === 'success') {
                    setData(da_ta.new_cases);
                } else {
                    setData([]);
                }
            } catch (error) {
                setData([]);
            }
        }

        fetchNewCases();
    }, []);


    return (
        <>
            <Hd />
            <main id="main" className={`py-22 px-4 transition-colors duration-300 min-h-screen ${theme === 'light' ? 'bg-white text-black' : 'bg-black text-white'}`}>
                <Dashboard />
                <Datatable columns={columns} data={data} rowsPerPage={10} />
            </main>
            <Foot />
        </>
    );
}
