import { useEffect, useRef, useState, useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, useNavigate } from 'react-router-dom';
import { fetchWithAuth } from "../../utils/userapi";
import { ThemeContext } from "../../Context/ThemeContext";
import { UserContext } from "../../Context/UserContext";

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
    faRepeat,
    faStar,
    faMessage,
    faLightbulb,
} from "@fortawesome/free-solid-svg-icons";

export default function Dashboard() {
    const base_url = localStorage.getItem('bravo_user_base_url');
    const navigate = useNavigate();
    const { logout } = useContext(UserContext);
    const { theme } = useContext(ThemeContext);
    const [cases, setCases] = useState(null);
    const [cards, setCards] = useState([]);
    const [form, setForm] = useState({
        feedback: "",
        likes: "",
    });
    const [showModal, setShowModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    // Function to fetch dashboard data
    const fetchDashboardData = async () => {
        try {
            const data = await fetchWithAuth('all-cases-data-count', {
                method: "GET",
            });

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

    useEffect(() => {
        fetchDashboardData();
    }, []);

    useEffect(() => {
        if (cases) {
            const updatedCards = [
                { id: "home", href: "/user/home", title: "New Cases", count: cases.new_cases, color: "bg-gray-700", icon: faShoppingCart },
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
                { id: "Redesign", href: "/user/redesign_cases", title: "Redesign Cases", count: cases.redesign_cases, color: "bg-teal-500", icon: faRepeat },
            ];

            setCards(updatedCards);
        }
    }, [cases]);

    const handleOpenModal = () => {
        setShowModal(true);
    };

    const handleCloseModal = () => {
        if (!isSubmitting) {
            setShowModal(false);
        }
    };

    const feedBackaRef = useRef(null);
    const token = localStorage.getItem('bravo_user_token');
    
    const saveFeedback = async () => {
        if (form.feedback === '') {
            feedBackaRef.current.focus();
            return;
        }
        
        setIsSubmitting(true);
        
        try {
            const resp = await fetch(`${base_url}/save-feedback`, {
                method: "POST",
                headers: {
                    'Content-Type': "application/json",
                    'Authorization': `Bearer ${token}`,
                    'X-Tenant': 'bravodent'
                },
                body: JSON.stringify(form),
            });

            const data = await resp.json();
            
            setIsSubmitting(false);
            
            if (data.status === 'success') {
                const statusEl = document.getElementById('status');
                statusEl.className = 'mb-4 w-full px-4 py-2 text-sm font-medium border rounded-lg border-green-400 bg-green-100 text-green-700';
                statusEl.innerText = data.message;
                setForm({ feedback: "", likes: "" });
                document.getElementById('feedbackform').reset();
                
                setTimeout(() => {
                    setShowModal(false);
                }, 2000);
            } else {
                if (data.error === 'Invalid or expired token') {
                    alert('Invalid or expired token. Please log in again.');
                    navigate(logout);
                }

                const statusEl = document.getElementById('status');
                statusEl.className = 'mb-4 w-full px-4 py-2 text-sm font-medium border rounded-lg border-red-400 bg-red-100 text-red-700';
                statusEl.innerText = data.message;
                setForm({ feedback: "", likes: "" });
                document.getElementById('feedbackform').reset();
                
                setTimeout(() => {
                    setShowModal(false);
                }, 2000);
            }
        } catch (error) {
            setIsSubmitting(false);
            const statusEl = document.getElementById('status');
            statusEl.className = 'mb-4 w-full px-4 py-2 text-sm font-medium border rounded-lg border-red-400 bg-red-100 text-red-700';
            statusEl.innerText = 'Network error. Please try again.';
            console.error("Feedback submission error:", error);
        }
    };

    // Handle card click - FORCE RELOAD even for same page
    const handleCardClick = (e, href) => {
        e.preventDefault();
        
        // Force full page reload for all clicks
        if (window.location.pathname === href) {
            // If already on the same page, force reload
            window.location.href = href;
        } else {
            // For different page, navigate normally
            navigate(href);
        }
    };

    // Theme-based background classes
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

    const getModalClass = () => {
        return theme === 'dark'
            ? 'bg-gray-800 border-gray-700 text-white'
            : 'bg-white border-white/30 text-black';
    };

    const getTextAreaClass = () => {
        return theme === 'dark'
            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
            : 'bg-white border-gray-500 text-black placeholder-gray-300';
    };

    const getButtonClass = () => {
        return theme === 'dark'
            ? 'text-gray-300 hover:text-white'
            : 'text-gray-700 hover:text-gray-900';
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

    if (cards && cards != null) {
        return (
            <section className={`p-6 rounded-xl ${getBackgroundClass()}`}>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {cards.map((card, idx) => (
                        <div
                            key={idx}
                            onClick={(e) => handleCardClick(e, card.href)}
                            className={`rounded-xl shadow-md p-4 hover:shadow-xl transition cursor-pointer ${getCardClass()}`}
                            id={card.id}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`flex items-center justify-center w-14 h-14 rounded-full text-white text-2xl ${card.color}`}>
                                    <FontAwesomeIcon icon={card.icon} />
                                </div>
                                <div>
                                    <p className={`text-sm font-medium ${getTextClass()}`}>{card.title}</p>
                                    {card.count !== null ? (
                                        <h3 className={`text-xl font-bold ${getCountClass()}`}>{card.count}</h3>
                                    ) : (
                                        <h3 className={`text-xl font-bold ${getCountClass()}`}>{0}</h3>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>


                {/* Feedback Modal - Compact Design */}
                <div
                    id="feedbackModal"
                    className={`${showModal ? 'flex' : 'hidden'} fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4`}
                >
                    <div className={`border w-full max-w-md rounded-xl shadow-lg relative ${getModalClass()}`}>
                        <button
                            onClick={handleCloseModal}
                            disabled={isSubmitting}
                            className={`absolute top-3 right-3 w-8 h-8 rounded flex items-center justify-center text-sm cursor-pointer 
                                ${isSubmitting ? 'opacity-50 cursor-not-allowed' : getButtonClass()}`}
                        >
                            ✖
                        </button>

                        <div className="p-5">
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-3">
                                    <div className={`w-9 h-9 rounded-lg ${theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'} flex items-center justify-center`}>
                                        <FontAwesomeIcon icon={faLightbulb} className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} />
                                    </div>
                                    <div>
                                        <h3 className={`text-base font-semibold`}>
                                            Share Feedback
                                        </h3>
                                        <p className={`text-xs`}>
                                            Help us improve your experience
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <p id="status" className=" mt-4 w-full mb-3"></p>

                            <form className="space-y-4" id="feedbackform">
                                <div>
                                    <label className={`block mb-2 text-sm font-medium ${getTextClass()}`}>Your Feedback</label>
                                    <textarea
                                        ref={feedBackaRef}
                                        rows="3"
                                        name="feedback"
                                        value={form.feedback}
                                        onChange={handleChange}
                                        disabled={isSubmitting}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none text-sm 
                                            ${getTextAreaClass()} 
                                            ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}
                                        placeholder="Share your thoughts..."
                                    ></textarea>
                                </div>

                                {/* Rate Your Experience Section */}
                                <div className="mt-4">
                                    <label className={`block mb-2 text-sm font-medium ${getTextClass()}`}>
                                        Rate Your Experience
                                    </label>

                                    <div className="flex items-center justify-start space-x-2">
                                        {[1, 2, 3, 4, 5].map((num) => (
                                            <button
                                                key={num}
                                                onClick={() => !isSubmitting && setForm((prev) => ({ ...prev, likes: num }))}
                                                type="button"
                                                disabled={isSubmitting}
                                                className={`
                                                    group relative w-8 h-8 rounded-full flex items-center justify-center
                                                    transition-all duration-300 transform hover:scale-110
                                                    ${isSubmitting ? 'cursor-not-allowed opacity-60' : ''}
                                                    ${form.likes >= num
                                                        ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-white shadow-[0_0_10px_rgba(250,204,21,0.6)]'
                                                        : theme === 'dark'
                                                            ? 'bg-gray-700 text-yellow-400 hover:bg-yellow-400 hover:text-white'
                                                            : 'bg-gray-200 text-yellow-500 hover:bg-yellow-400 hover:text-white'
                                                    }
                                                `}
                                            >
                                                <FontAwesomeIcon icon={faStar} className="text-lg" />
                                                <span className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-xs px-2 py-1 rounded-md bg-black/70 text-white whitespace-nowrap">
                                                    {num === 1
                                                        ? 'Terrible 😞'
                                                        : num === 2
                                                            ? 'Poor 😕'
                                                            : num === 3
                                                                ? 'Average 🙂'
                                                                : num === 4
                                                                    ? 'Good 😃'
                                                                    : 'Excellent 🤩'}
                                                </span>
                                            </button>
                                        ))}
                                    </div>

                                    {form.likes > 0 && (
                                        <p
                                            className={`mt-2 text-sm font-medium ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'
                                                }`}
                                        >
                                            You rated:{' '}
                                            {form.likes === 1
                                                ? 'Terrible'
                                                : form.likes === 2
                                                    ? 'Poor'
                                                    : form.likes === 3
                                                        ? 'Average'
                                                        : form.likes === 4
                                                            ? 'Good'
                                                            : 'Excellent'}
                                        </p>
                                    )}
                                </div>


                                <div className="text-right pt-2">
                                    <button
                                        type="button"
                                        onClick={saveFeedback}
                                        disabled={isSubmitting}
                                        className={`px-6 py-2 rounded-lg transition-colors cursor-pointer text-sm font-medium flex items-center justify-center gap-2 min-w-[140px] float-right mb-4
                                            ${isSubmitting 
                                                ? 'bg-blue-400 cursor-not-allowed' 
                                                : 'bg-blue-600 hover:bg-blue-700'} 
                                            text-white`}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                                                Submitting...
                                            </>
                                        ) : (
                                            'Submit Feedback'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>


                {/* Floating Feedback Button - Bouncing with Sparkles */}
                <div className="fixed bottom-6 right-4 z-50 animate-bounce">
                    <button
                        onClick={handleOpenModal}
                        className="group relative w-14 h-14 bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center cursor-pointer hover:scale-110 hover:animate-none"
                    >
                        {/* Rainbow glow */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 rounded-full opacity-60 blur animate-pulse"></div>

                        {/* Sparkles */}
                        <div className="absolute -top-2 -right-2">
                            <FontAwesomeIcon icon={faStar} className="text-yellow-400 text-xs animate-spin" />
                        </div>

                        <div className="relative z-10">
                            <FontAwesomeIcon
                                icon={faMessage}
                                className="text-xl"
                            />
                        </div>

                        {/* Pulse ring */}
                        <div className="absolute inset-0 border-2 border-white/40 rounded-full animate-ping-slow"></div>
                    </button>
                </div>

                <style jsx>{`
  @keyframes ping-slow {
    75%, 100% {
      transform: scale(2);
      opacity: 0;
    }
  }
  .animate-ping-slow {
    animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
  }
`}</style>
            </section>
        )
    } else {
        return (
            <>
                <h1 className={theme === 'dark' ? 'text-white' : 'text-black'}>Data not found</h1>
            </>
        )
    }
}