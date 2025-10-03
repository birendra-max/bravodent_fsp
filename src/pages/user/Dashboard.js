import React, { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from 'react-router-dom';
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

export default function Dashboard() {
    const [cases, setCases] = useState(null);
    const [cards, setCards] = useState([]);
    const [form, setForm] = useState({
        feedback: "",
        likes: "",
    });
    const [showModal, setShowModal] = useState(false);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const feedBackaRef = useRef(null);

    const saveFeedback = async () => {
        if (form.feedback === '') {
            feedBackaRef.current.focus();
        }
        else {
            const resp = await fetch('http://localhost/bravodent_ci/save-feedback', {
                method: "POST",
                headers: {
                    'Content-Type': "application/json",
                },
                credentials: 'include',
                body: JSON.stringify(form),
            })

            const data = await resp.json()
            if (data.status === 'success') {
                const statusEl = document.getElementById('status');
                statusEl.className = 'mb-6 w-full px-4 py-3 text-sm font-medium border shadow-md rounded-lg border-green-400 bg-green-100 text-green-700';
                statusEl.innerText = data.message;
                setForm({ feedback: "", likes: "" });
                document.getElementById('feedbackform').reset();
                setTimeout(() => {
                    setShowModal(false);
                }, 2000);

            } else {
                const statusEl = document.getElementById('status');
                statusEl.className = 'mb-6 w-full px-4 py-3 text-sm font-medium border shadow-md rounded-lg border-red-400 bg-red-100 text-red-700';
                statusEl.innerText = data.message;
                setForm({ feedback: "", likes: "" });
                document.getElementById('feedbackform').reset();
                setTimeout(() => {
                    setShowModal(false);
                }, 2000);
            }
        }
    };

    useEffect(() => {
        const fetchCardsData = async () => {
            try {
                const res = await fetch('http://localhost/bravodent_ci/all-cases-data-count', {
                    method: "GET",
                    headers: {
                        'Content-Type': "application/json",
                    },
                    credentials: 'include',
                });

                const data = await res.json();

                if (data.status === 'success') {
                    setCases(data);
                } else {
                    setCases(null);
                }
            } catch (error) {
                console.error("Error fetching cases:", error);
                setCases(null);
            }
        };

        fetchCardsData();
    }, []);

    useEffect(() => {
        if (cases) {
            const updatedCards = [
                { id: "home", href: "/user/home", title: "New Cases", count: cases.new_cases, color: "bg-gray-800", icon: faShoppingCart },
                { id: "progress", href: "/user/in_progress", title: "In Progress", count: cases.progress, color: "bg-yellow-500", icon: faSpinner },
                { id: "canceled", href: "/user/canceled_case", title: "Canceled Cases", count: cases.canceled, color: "bg-red-500", icon: faTimes },
                { id: "completed", href: "/user/completed_case", title: "Completed Cases", count: cases.completed, color: "bg-green-600", icon: faTasks },
                { id: "rush", href: "/user/rush_cases", title: "Rush Cases", count: cases.rush, color: "bg-blue-500", icon: faBolt },
                { id: "qc", href: "/user/qc_required", title: "QC Required", count: cases.qc, color: "bg-orange-400", icon: faBell },
                { id: "hold", href: "/user/case_on_hold", title: "Case On Hold", count: cases.hold, color: "bg-pink-500", icon: faPauseCircle },
                { id: "all_c", href: "/user/all_cases", title: "All Cases", count: cases.all, color: "bg-green-500", icon: faCogs },
                { id: "yesterday", href: "/user/yesterday_cases", title: "Yesterday's Cases", count: cases.yesterday_cases, color: "bg-blue-400", icon: faCalendarDay },
                { id: "today", href: "/user/today_cases", title: "Today's Cases", count: cases.today_cases, color: "bg-purple-500", icon: faCalendarCheck },
                { id: "weekly", href: "/user/weekly_case", title: "Weekly Cases", count: cases.weekly_cases, color: "bg-indigo-500", icon: faCalendarWeek },
                { id: "feedback", href: "", title: "Your Feedback!", count: null, color: "bg-teal-500", icon: faComment },
            ];

            setCards(updatedCards);
        }
    }, [cases]);

    const handleOpenModal = () => {
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    function star(num) {
        const starElement = document.getElementById('star');
        if (!starElement) return;

        const items = starElement.children;
        setForm((prevForm) => ({
            ...prevForm,
            likes: num
        }))

        for (let i = 0; i < items.length; i++) {
            items[i].classList.remove('bg-yellow-400');
        }

        for (let i = 0; i < num && i < items.length; i++) {
            items[i].classList.add('bg-yellow-400');
        }
    }

    if (cards && cards != null) {
        return (
            <section className="p-6 bg-gray-200 rounded-xl shadow-xl">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {cards.map((card, idx) => (
                        <Link
                            key={idx}
                            to={card.href}
                            className="rounded-xl shadow-md p-4 text-gray-800 bg-white hover:shadow-xl transition cursor-pointer"
                            id={card.id}
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
                                        <button
                                            type="button"
                                            className="mt-1 text-sm text-blue-600 underline hover:text-blue-800 cursor-pointer"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleOpenModal();
                                            }}
                                        >
                                            Give Feedback
                                        </button>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                <div
                    id="feedbackModal"
                    className={`${showModal ? 'flex' : 'hidden'} fixed inset-0 bg-black/10 backdrop-blur-lg flex items-center justify-center z-50`}
                >
                    <div className="bg-white border border-white/30 w-full max-w-lg p-6 rounded-2xl shadow-2xl relative animate-fadeIn">
                        <button
                            onClick={handleCloseModal}
                            className="absolute top-3 right-3 text-gray-700 hover:text-gray-900 text-2xl cursor-pointer"
                        >
                            ✖
                        </button>
                        <h2 className="text-2xl font-bold text-black">We value your feedback</h2>
                        <p className="text-gray-800 mb-6">Please take a moment to share your thoughts with us.</p>

                        <p id="status" className="w-full"></p>

                        <form className="space-y-4" id="feedbackform">
                            <div>
                                <label className="block text-black mb-1 font-medium">Your Feedback</label>
                                <textarea ref={feedBackaRef} rows="4" name="feedback" value={form.feedback} onChange={handleChange} className="w-full px-4 py-2 border border-gray-500 bg-white rounded-lg text-black placeholder-gray-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none" placeholder="Write your feedback..."></textarea>
                            </div>
                            <div>
                                <label className="block text-black mb-2 font-medium">Rate Us</label>
                                <div className="flex space-x-2" id="star">
                                    <button onClick={() => star(1)} type="button" className="w-10 h-10 flex items-center justify-center border border-black/30 bg-white/10 rounded-full text-yellow-300 hover:bg-yellow-400 hover:text-white cursor-pointer">⭐</button>
                                    <button onClick={() => star(2)} type="button" className="w-10 h-10 flex items-center justify-center border border-black/30 bg-white/10 rounded-full text-yellow-300 hover:bg-yellow-400 hover:text-white cursor-pointer">⭐</button>
                                    <button onClick={() => star(3)} type="button" className="w-10 h-10 flex items-center justify-center border border-black/30 bg-white/10 rounded-full text-yellow-300 hover:bg-yellow-400 hover:text-white cursor-pointer">⭐</button>
                                    <button onClick={() => star(4)} type="button" className="w-10 h-10 flex items-center justify-center border border-black/30 bg-white/10 rounded-full text-yellow-300 hover:bg-yellow-400 hover:text-white cursor-pointer">⭐</button>
                                    <button onClick={() => star(5)} type="button" className="w-10 h-10 flex items-center justify-center border border-black/30 bg-white/10 rounded-full text-yellow-300 hover:bg-yellow-400 hover:text-white cursor-pointer">⭐</button>
                                </div>
                            </div>
                            <div className="text-right">
                                <button type="button" onClick={saveFeedback} className="px-6 py-2 bg-indigo-600/80 text-white rounded-lg shadow-lg hover:bg-indigo-700 transition cursor-pointer">Submit Feedback</button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>
        )
    } else {
        return (
            <>
                <h1>Data not found</h1>
            </>
        )
    }
}