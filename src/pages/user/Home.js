import React, { useContext, useEffect, useState } from "react";
import Hd from './Hd';
import Foot from './Foot';
import { UserContext } from "../../Context/UserContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from 'react-router-dom';
import Datatable from "./Datatable";
import { useNavigate } from 'react-router-dom';

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
    const navigate = useNavigate();

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
                console.error("Error checking session:", error);
                navigate("/", { replace: true });
            }
        };

        checkSession();
    }, []);


    const { user } = useContext(UserContext);
    

    return (
        <>
            <Hd />
            <main className="py-22 px-4">
                <DashboardCards />
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



