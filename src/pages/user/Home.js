import React, { useContext, useEffect, useState } from "react";
import Hd from './Hd';
import Foot from './Foot';
import { UserContext } from "../../Context/UserContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from 'react-router-dom';
import Datatable from "./Datatable";

import {
    faShoppingCart,
    faSpinner,
    faTimes,
    faTasks,
    faBolt,
    faBell,
    faPauseCircle,
    faCogs,
    faCalendarDay,
    faCalendarCheck,
    faCalendarWeek,
    faComment,
} from "@fortawesome/free-solid-svg-icons";


export default function Home() {
    const { user } = useContext(UserContext);
    const [data, setData] = useState([]);
    const columns = [
        { header: <input type='checkbox' size="2.4" />, accessor: "select" },
        { header: "OrderId", accessor: "orderid" },
        { header: "Name", accessor: "name" },
        { header: "TAT", accessor: "tduration" },
        { header: 'Status', accessor: 'status' },
        { header: 'Unit', accessor: 'unit' },
        { header: 'Tooth', accessor: 'tooth' },
        { header: 'Lab Name', accessor: 'labname' },
        { header: 'Date', accessor: 'created_at' },
        { header: 'Message', accessor: 'message' },
    ];

    useEffect(() => {
        async function newRequest() {
            try {
                const res = await fetch("http://localhost/bravodent_ci/new-cases", {
                    method: "GET",
                    credentials: "include",
                });

                const result = await res.json();

                if (result.status === "success" && result.new_cases) {
                    const casesArray = Array.isArray(result.new_cases)
                        ? result.new_cases
                        : [result.new_cases]; // ensure it's always an array

                    const transformed = casesArray.map((item, index) => ({
                        select: <input type="checkbox" value={item.id} id="rowid" />,
                        orderid: index + 1,
                        name: item.fname || "", // fname is the name
                        email: item.orderid ? `${item.orderid}@example.com` : "",
                        orderid: item.orderid || "",
                        tduration: item.tduration || "",
                        status: item.status || "",
                        unit: item.unit || "",
                        tooth: item.tooth || "",
                        labname: item.labname || "",
                        created_at: item.created_at || "",
                        message: item.message || ""
                    }));

                    setData(transformed);
                } else {
                    setData([]); // fallback empty array
                }
            } catch (error) {
                setData([]);
            }
        }

        newRequest();
    }, []);


    return (
        <>
            <Hd />
            <main className="py-22 px-4">
                <DashboardCards />
                <Datatable columns={columns} data={data} rowsPerPage={10} />
            </main>
            <Foot />
        </>
    );
}

function DashboardCards() {
    const cards = [
        { href: "/user/new_case", title: "New Cases", count: 12, color: "bg-gray-800", icon: faShoppingCart },
        { href: "/user/in_progress", title: "In Progress", count: 8, color: "bg-yellow-500", icon: faSpinner },
        { href: "/user/canceled_case", title: "Canceled Cases", count: 3, color: "bg-red-500", icon: faTimes },
        { href: "/user/completed_case", title: "Completed Cases", count: 25, color: "bg-green-600", icon: faTasks },
        { href: "/user/rush_cases", title: "Rush Cases", count: 5, color: "bg-blue-500", icon: faBolt },
        { href: "/user/qc_required", title: "QC Required", count: 7, color: "bg-orange-400", icon: faBell },
        { href: "/user/case_on_hold", title: "Case On Hold", count: 4, color: "bg-pink-500", icon: faPauseCircle },
        { href: "/user/all_cases", title: "All Cases", count: 59, color: "bg-green-500", icon: faCogs },
        { href: "/user/yesterday_cases", title: "Yesterday's Cases", count: 6, color: "bg-blue-400", icon: faCalendarDay },
        { href: "/user/today_cases", title: "Today's Cases", count: 11, color: "bg-purple-500", icon: faCalendarCheck },
        { href: "/user/weekly_case", title: "Weekly Cases", count: 34, color: "bg-indigo-500", icon: faCalendarWeek },
        { href: "/user/feedback", title: "Your Feedback!", count: null, color: "bg-teal-500", icon: faComment },
    ];

    return (
        <section className="p-6 bg-gray-200 rounded-xl shadow-xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {cards.map((card, idx) => (
                    <Link
                        key={idx}
                        to={card.href}
                        className="rounded-xl shadow-md p-4 text-gray-800 bg-white hover:shadow-xl transition cursor-pointer"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`flex items-center justify-center w-14 h-14 rounded-full text-white text-2xl ${card.color}`}>
                                <FontAwesomeIcon icon={card.icon} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                                {card.count !== null ? (
                                    <h3 className="text-xl font-bold text-gray-900">{card.count}</h3>
                                ) : (
                                    <button className="mt-1 text-sm text-blue-600 underline hover:text-blue-800">
                                        Give Feedback
                                    </button>
                                )}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}



