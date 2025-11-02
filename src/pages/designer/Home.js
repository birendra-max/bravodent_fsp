import { ThemeContext } from "../../Context/ThemeContext";
import Hd from "./Hd";
import Foot from "./Foot";
import Dashboard from "./Dashboard";
import { useContext, useState, useEffect } from "react";
import Datatable from "./Datatable";
import { fetchWithAuth } from '../../utils/designerapi';

export default function Home() {
    const token = localStorage.getItem('token');
    const { theme } = useContext(ThemeContext);
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
                const data = await fetchWithAuth('/get-new-cases', {
                    method: "GET",
                });

                // data is already the parsed JSON response
                if (data && data.status === 'success') {
                    setData(data.new_cases);
                } else {
                    setData([]);
                }
            } catch (error) {
                console.error("Error fetching cases:", error);
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