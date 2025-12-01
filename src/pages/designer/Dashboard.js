import { useEffect, useState, useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from 'react-router-dom';
import { ThemeContext } from "../../Context/ThemeContext";
import { fetchWithAuth } from '../../utils/designerapi';
import Loder from "../../Components/Loder";

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
    faRepeat
} from "@fortawesome/free-solid-svg-icons";

export default function Dashboard() {
    const { theme } = useContext(ThemeContext);
    const [cases, setCases] = useState(null);
    const [cards, setCards] = useState([]);

    useEffect(() => {
        async function fetchCardsData() {
            try {
                const data = await fetchWithAuth('/all-cases-data-count', {
                    method: "GET",
                });

                // data is already the parsed JSON response
                if (data.status === 'success') {
                    setCases(data);
                } else {
                    setCases(null);
                }
            } catch (error) {
                console.error("Error fetching cases:", error);
                setCases(null);
            }
        }

        fetchCardsData();
    }, []);


    useEffect(() => {
        if (cases) {
            const updatedCards = [
                { id: "home", href: "/designer/home", title: "New Cases", count: cases.new_cases, color: "bg-gray-800", icon: faShoppingCart },
                { id: "progress", href: "/designer/in_progress", title: "In Progress", count: cases.progress, color: "bg-yellow-500", icon: faSpinner },
                { id: "canceled", href: "/designer/canceled_case", title: "Canceled Cases", count: cases.canceled, color: "bg-red-500", icon: faTimes },
                { id: "completed", href: "/designer/completed_case", title: "Completed Cases", count: cases.completed, color: "bg-green-600", icon: faTasks },
                { id: "rush", href: "/designer/rush_cases", title: "Rush Cases", count: cases.rush, color: "bg-blue-500", icon: faBolt },
                { id: "qc", href: "/designer/qc_required", title: "QC Required", count: cases.qc, color: "bg-orange-400", icon: faBell },
                { id: "hold", href: "/designer/case_on_hold", title: "Case On Hold", count: cases.hold, color: "bg-pink-500", icon: faPauseCircle },
                { id: "all_c", href: "/designer/all_cases", title: "All Cases", count: cases.all, color: "bg-green-500", icon: faCogs },
                { id: "yesterday", href: "/designer/yesterday_cases", title: "Yesterday's Cases", count: cases.yesterday_cases, color: "bg-blue-400", icon: faCalendarDay },
                { id: "today", href: "/designer/today_cases", title: "Today's Cases", count: cases.today_cases, color: "bg-purple-500", icon: faCalendarCheck },
                { id: "weekly", href: "/designer/weekly_case", title: "Weekly Cases", count: cases.weekly_cases, color: "bg-indigo-500", icon: faCalendarWeek },
                { id: "Redesign", href: "/designer/redesign_cases", title: "Redesign Cases", count: cases.redesign, color: "bg-teal-500", icon: faRepeat },
            ];

            setCards(updatedCards);
        }
    }, [cases]);

    // ✅ CHANGED: Added loading state handling
    if (cases === null) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <div className="text-center">
                    <Loder status="" />
                </div>
            </div>
        )
    }

    // Theme-based background classes - ✅ KEPT EXACTLY THE SAME
    const getBackgroundClass = () => {
        return theme === 'dark'
            ? 'bg-gray-900 text-white'
            : 'bg-gray-200 text-gray-800';
    };

    const getCardClass = () => {
        return theme === 'dark'
            ? 'bg-gray-800 text-white hover:bg-gray-700'
            : 'bg-white text-gray-800 hover:bg-gray-50';
    };

    const getTextClass = () => {
        return theme === 'dark'
            ? 'text-gray-300'
            : 'text-gray-600';
    };

    const getCountClass = () => {
        return theme === 'dark'
            ? 'text-white'
            : 'text-gray-900';
    };

    return (
        <section className={`p-6 rounded-xl ${getBackgroundClass()}`}>
            {/* ✅ KEPT EXACTLY THE SAME: Grid layout */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {cards.map((card, idx) => (
                    <Link
                        key={idx}
                        to={card.href}
                        className={`rounded-xl shadow-md p-4 hover:shadow-xl transition cursor-pointer ${getCardClass()}`}
                        id={card.id}
                    >
                        <div className="flex items-center gap-4">
                            {/* ✅ KEPT EXACTLY THE SAME: Card icon */}
                            <div className={`flex items-center justify-center w-14 h-14 rounded-full text-white text-2xl ${card.color}`}>
                                <FontAwesomeIcon icon={card.icon} />
                            </div>
                            <div>
                                {/* ✅ KEPT EXACTLY THE SAME: Title and count */}
                                <p className={`text-sm font-medium ${getTextClass()}`}>{card.title}</p>
                                {card.count !== null ? (
                                    <h3 className={`text-xl font-bold ${getCountClass()}`}>{card.count}</h3>
                                ) : (
                                    <h3 className={`text-xl font-bold ${getCountClass()}`}>{0}</h3>
                                )}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    )
}