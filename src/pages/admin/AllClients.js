import { useContext, useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Hd from "./Hd";
import { ThemeContext } from "../../Context/ThemeContext";
import Datatable from './Datatable';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { fetchWithAuth } from '../../utils/adminapi';
export default function AllClients() {
    const { theme } = useContext(ThemeContext);
    const [data, setData] = useState([]);

    const columns = [
        { header: "Client Id", accessor: "userid" },
        { header: "Name", accessor: "name" },
        { header: "Designation", accessor: "designation" },
        { header: "Email", accessor: "email" },
        { header: "Occlusion", accessor: "occlusion" },
        { header: "Lab Name", accessor: "labname" },
        { header: "Mobile", accessor: "mobile" },
        { header: "Status", accessor: "status" },
    ];


    useEffect(() => {
        async function getClients() {
            try {
                const data = await fetchWithAuth('/get-all-clients', {
                    method: "GET",
                });

                // data is already the parsed JSON response
                if (data && data.status === 'success') {
                    console.log(data);
                    setData(data.clients)
                } else {
                    setData([]);
                }
            } catch (error) {
                console.error("Error fetching cases:", error);
                setData([]);
            }
        }

        getClients();
    }, []);

    return (
        <>
            <Hd />
            <main className={`min-h-screen flex transition-all duration-300 ${theme === 'dark'
                ? "bg-gray-950 text-gray-100"
                : "bg-gray-200 text-gray-800"
                }`}
            >
                <Sidebar />
                <div className="flex-1 p-6 mt-16">
                    {/* Header */}
                    <div className="mb-6">
                        <h1
                            className={`text-3xl font-semibold flex items-center gap-2 ${theme === "dark" ? "text-white" : "text-gray-800"
                                }`}
                        >
                            <FontAwesomeIcon icon={faUsers} className="text-blue-500" />
                            All Clients
                        </h1>
                        <p
                            className={`${theme === "dark" ? "text-gray-400" : "text-gray-500"
                                }`}
                        >
                            Manage and monitor your registered client accounts.
                        </p>
                    </div>

                    <Datatable columns={columns} data={data} rowsPerPage={10} />
                </div>
            </main>
        </>
    )
}