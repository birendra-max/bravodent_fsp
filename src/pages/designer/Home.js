import { ThemeContext } from "../../Context/ThemeContext";
import Hd from "./Hd";
import Foot from "./Foot";
import Dashboard from "./Dashboard";
import { useContext, useState, useEffect } from "react";
import { DesignerContext } from "../../Context/DesignerContext";
import Datatable from "./Datatable";

export default function Home() {
    const token = localStorage.getItem('token');
    const { theme } = useContext(ThemeContext);
    const { desinger } = useContext(DesignerContext);
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
        { header: "Download", accessor: "file_path" },
    ];

    useEffect(() => {
        async function fetchNewCases() {
            try {
                const res = await fetch('http://localhost/bravodent_ci/designer/get-new-cases', {
                    method: "GET",
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
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
    )
}