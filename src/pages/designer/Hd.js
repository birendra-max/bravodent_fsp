import { useState, useEffect, useContext } from "react";
import { DesignerContext } from "../../Context/DesignerContext";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ThemeContext } from "../../Context/ThemeContext";
import {
    faHome,
    faUpload,
    faSearch,
    faChartBar,
    faUser,
    faSignOutAlt,
    faMoon,
    faSun,
    faTimes,
    faBars,
    faChevronUp,
    faChevronDown
} from '@fortawesome/free-solid-svg-icons';

export default function Hd() {

    useEffect(() => {
        const data = localStorage.getItem('bravo_designer') ? localStorage.getItem('bravo_designer') : "";
        const token = localStorage.getItem('bravo_designer_token') ? localStorage.getItem('bravo_designer_token') : "";

        if (data === '' && token === '') {
            navigate('/designer');
        }
    })

    const { setTheme } = useContext(ThemeContext);
    const [mode, setMode] = useState('light');
    const navigate = useNavigate();
    const location = useLocation();
    const { designer, logout } = useContext(DesignerContext);
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [activePage, setActivePage] = useState("index");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Initialize theme from localStorage or system preference
    useEffect(() => {
        const savedMode = localStorage.getItem('theme') || 'light';
        setMode(savedMode);
        applyTheme(savedMode);
    }, []);

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Determine active page based on current route
    useEffect(() => {
        const pathname = location.pathname;
        if (pathname.includes("new_request")) setActivePage("new_request");
        else if (pathname.includes("multisearch")) setActivePage("multisearch");
        else if (pathname.includes("reports")) setActivePage("reports");
        else if (pathname.includes("profile")) setActivePage("profile");
        else setActivePage("index");
    }, [location]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownOpen && !event.target.closest('.dropdown-container')) {
                setDropdownOpen(false);
            }
            if (isOpen && !event.target.closest('.mobile-menu-container')) {
                setIsOpen(false);
            }
            if (mobileSearchOpen && !event.target.closest('.search-container')) {
                setMobileSearchOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [dropdownOpen, isOpen, mobileSearchOpen]);

    const navItems = [
        { href: "/designer/home", label: "Home", key: "index", icon: faHome },
        { href: "/designer/new_request", label: "Upload Finish & Stl Files", key: "new_request", icon: faUpload },
    ];

    const applyTheme = (newTheme) => {
        localStorage.setItem('theme', newTheme);
        setTheme(newTheme);
    };

    const changeIcon = () => {
        const newMode = mode === 'light' ? 'dark' : 'light';
        setMode(newMode);
        applyTheme(newMode);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            setMobileSearchOpen(false);
            navigate(`/designer/search-order/${searchQuery}`)
        }
    };

    const clearSearch = () => {
        setSearchQuery("");
    };

    return (
        <header className="fixed z-50 top-0 left-0 w-full h-[9vh] bg-gray-800 text-white flex items-center">
            <nav className={`w-full transition-all duration-300 ${scrolled ? "bg-gray-900 shadow-2xl" : "bg-gray-900"
                }`}>
                <div className="w-full mx-auto px-3 sm:px-4 lg:px-6">
                    {/* Main Navigation Bar */}
                    <div className="flex items-center justify-between h-14 sm:h-16 lg:h-20">
                        {/* Logo - Left Side */}
                        <div className="flex-shrink-0">
                            <Link
                                to="/designer/home"
                                className="flex justify-center items-center"
                                onClick={() => {
                                    setIsOpen(false);
                                    setMobileSearchOpen(false);
                                }}
                            >
                                <img
                                    src="/img/logo.png"
                                    alt="Logo"
                                    className="h-6 w-auto sm:h-8 lg:h-20 transition-all duration-300 hover:scale-105"
                                    onError={(e) => {
                                        e.target.src = '/img/placeholder-logo.png';
                                    }}
                                />
                            </Link>
                        </div>

                        {/* Center Menu - Desktop */}
                        <div className="hidden xl:flex xl:items-center xl:flex-1 xl:justify-center">
                            <div className="flex items-center space-x-18 bg-gray-800/70 backdrop-blur-sm rounded-xl p-1.5 border border-gray-700">
                                {navItems.map((item) => (
                                    <Link
                                        to={item.href}
                                        key={item.key}
                                        className={`text-xs lg:text-sm px-3 lg:px-4 py-2 lg:py-2.5 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${activePage === item.key
                                            ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg transform scale-105"
                                            : "text-gray-300 hover:bg-gray-700 hover:text-white hover:shadow-md"
                                            }`}
                                    >
                                        <FontAwesomeIcon
                                            icon={item.icon}
                                            className="w-3 h-3 lg:w-4 lg:h-4"
                                        />
                                        <span className="whitespace-nowrap">{item.label}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Right Side - Search & Profile */}
                        <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-8">
                            {/* Search Form - Desktop */}
                            <div className="hidden lg:block search-container">
                                <form className="flex items-center" onSubmit={handleSearchSubmit}>
                                    <div className="relative group">
                                        <div className="relative flex items-center bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 bg-size-200 bg-pos-0 hover:bg-pos-100 transition-all duration-500 rounded-lg p-0.5 shadow-lg">
                                            <div className="relative flex-grow">
                                                <input
                                                    type="text"
                                                    name="orderid"
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    placeholder="Search by Orders..."
                                                    aria-label="Search orders by ID"
                                                    className="w-82 pl-4 pr-12 py-3 bg-gray-900 text-white placeholder-gray-300 rounded-l-lg focus:outline-none focus:ring-1 focus:ring-orange-400 focus:bg-gray-800 transition-all duration-200 text-sm font-medium tracking-wide"
                                                />
                                                {searchQuery && (
                                                    <button
                                                        type="button"
                                                        onClick={clearSearch}
                                                        className="cursor-pointer absolute right-0 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1.5 hover:bg-gray-800 rounded-full"
                                                        aria-label="Clear search"
                                                    >
                                                        <FontAwesomeIcon icon={faTimes} className="w-3 h-3" />
                                                    </button>
                                                )}
                                                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                                    <div className="h-6 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
                                                </div>
                                            </div>
                                            <button
                                                type="submit"
                                                className="cursor-pointer bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white py-3 px-5 rounded-r-lg transition-all duration-300 flex items-center justify-center min-w-[60px] group-hover:shadow-inner"
                                                aria-label="Search orders"
                                            >
                                                <FontAwesomeIcon
                                                    icon={faSearch}
                                                    className="w-4 h-4 transition-transform duration-300 group-hover:scale-110"
                                                />
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>

                            {/* Mobile Search Button */}
                            <button
                                onClick={() => {
                                    setMobileSearchOpen(!mobileSearchOpen);
                                    setIsOpen(false);
                                }}
                                className="lg:hidden text-white hover:text-orange-300 p-2 transition-colors duration-200 rounded-lg hover:bg-gray-800"
                            >
                                <FontAwesomeIcon
                                    icon={mobileSearchOpen ? faTimes : faSearch}
                                    className="w-5 h-5 sm:w-6 sm:h-6"
                                />
                            </button>

                            {/* Theme Toggle - Material Design Switch */}
                            <div className="flex items-center space-x-3">
                                <FontAwesomeIcon
                                    icon={faSun}
                                    className={`w-4 h-4 transition-colors duration-300 ${mode === 'light' ? 'text-amber-500' : 'text-gray-500'
                                        }`}
                                />

                                <button
                                    onClick={changeIcon}
                                    className="cursor-pointer transition-all duration-300 h-6 w-11 p-0.5 relative focus:outline-none focus:ring-2 focus:ring-orange-500/50 rounded-full"
                                    aria-label="Toggle theme"
                                    aria-checked={mode === 'dark'}
                                    role="switch"
                                >
                                    {/* Inactive track */}
                                    <div className="w-full h-full bg-gray-700 rounded-full"></div>

                                    {/* Active track overlay */}
                                    <div className={`absolute top-0.5 left-0.5 right-0.5 bottom-0.5 rounded-full transition-all duration-300 ${mode === 'light'
                                        ? 'bg-amber-500/20 w-1/2'
                                        : 'bg-blue-500/20 w-full'
                                        }`}></div>

                                    {/* Toggle thumb */}
                                    <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-lg transform transition-all duration-300 ${mode === 'light'
                                        ? 'left-0.5 bg-gradient-to-b from-amber-200 to-amber-400'
                                        : 'left-5.5 bg-gradient-to-b from-gray-300 to-gray-500'
                                        }`}>
                                        {/* Ripple effect */}
                                        <div className={`absolute inset-0 rounded-full transition-opacity duration-300 ${mode === 'light' ? 'bg-amber-500/20' : 'bg-gray-600/20'
                                            }`}></div>
                                    </div>
                                </button>

                                <FontAwesomeIcon
                                    icon={faMoon}
                                    className={`w-4 h-4 transition-colors duration-300 ${mode === 'dark' ? 'text-blue-400' : 'text-gray-500'
                                        }`}
                                />
                            </div>

                            {/* Profile Dropdown - Compact Professional */}
                            <div className="relative dropdown-container">
                                <button
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-800/80 transition-colors duration-200 group"
                                    aria-label="User menu"
                                >
                                    <div className="relative">
                                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 p-0.5">
                                            <img
                                                src={designer?.pic && designer.pic !== '' ? designer.pic : '/img/user.webp'}
                                                alt="Designer profile"
                                                className="h-full w-full rounded-full object-cover"
                                                onError={(e) => {
                                                    e.target.src = '/img/user.webp';
                                                }}
                                            />
                                        </div>
                                        <div className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-green-500 rounded-full border-2 border-gray-900"></div>
                                    </div>
                                    <FontAwesomeIcon
                                        icon={dropdownOpen ? faChevronUp : faChevronDown}
                                        className="w-3 h-3 text-gray-400 transition-transform duration-200"
                                    />
                                </button>

                                {dropdownOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() => setDropdownOpen(false)}
                                        ></div>
                                        <div className="absolute right-0 mt-2 w-56 bg-gray-900 rounded-lg shadow-xl py-2 border border-gray-800 z-50">
                                            <div className="px-4 py-3 border-b border-gray-800">
                                                <div className="text-white font-semibold text-sm truncate">
                                                    {designer?.name || 'Designer'}
                                                </div>
                                                <div className="text-gray-400 text-xs truncate mt-0.5">
                                                    {designer?.email || ''}
                                                </div>
                                            </div>

                                            <div className="py-2">
                                                <Link
                                                    to="/designer/profile"
                                                    className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors duration-200"
                                                    onClick={() => setDropdownOpen(false)}
                                                >
                                                    <FontAwesomeIcon icon={faUser} className="w-4 h-4 mr-3" />
                                                    <span className="text-sm">Profile</span>
                                                </Link>
                                            </div>

                                            <div className="py-2">
                                                <button
                                                    onClick={() => {
                                                        logout();
                                                        setDropdownOpen(false);
                                                    }}
                                                    className="flex items-center w-full px-4 py-2 text-red-400 hover:bg-red-600/10 hover:text-red-300 transition-colors duration-200"
                                                >
                                                    <FontAwesomeIcon icon={faSignOutAlt} className="w-4 h-4 mr-3" />
                                                    <span className="text-sm">Logout</span>
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => {
                                    setIsOpen(!isOpen);
                                    setMobileSearchOpen(false);
                                }}
                                className="xl:hidden text-white hover:text-orange-300 p-2 transition-colors duration-200 rounded-lg hover:bg-gray-800"
                                aria-label="Toggle menu"
                            >
                                <FontAwesomeIcon
                                    icon={isOpen ? faTimes : faBars}
                                    className="w-5 h-5 sm:w-6 sm:h-6"
                                />
                            </button>
                        </div>
                    </div>

                    {/* Mobile Search Bar */}
                    {mobileSearchOpen && (
                        <div className="lg:hidden bg-gray-800 px-3 sm:px-4 py-3 border-t border-gray-700 animate-slideDown">
                            <form onSubmit={handleSearchSubmit} className="flex space-x-2">
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        name="orderid"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search Order ID..."
                                        className="w-full px-4 py-3 bg-gray-700 text-white placeholder-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 border border-gray-600 text-sm"
                                        autoFocus
                                    />
                                    {searchQuery && (
                                        <button
                                            type="button"
                                            onClick={clearSearch}
                                            className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-400 p-1"
                                        >
                                            <FontAwesomeIcon icon={faTimes} className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                                <button
                                    type="submit"
                                    className="px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                                >
                                    <FontAwesomeIcon icon={faSearch} className="w-4 h-4" />
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Mobile Menu */}
                    {isOpen && (
                        <div className="xl:hidden bg-gray-800 border-t border-gray-700 animate-slideDown">
                            <div className="px-2 py-3 space-y-1">
                                {navItems.map((item) => (
                                    <Link
                                        to={item.href}
                                        key={item.key}
                                        className={`block px-4 py-4 rounded-xl font-medium transition-all duration-300 flex items-center space-x-4 text-base sm:text-lg ${activePage === item.key
                                            ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg"
                                            : "text-gray-300 hover:bg-gray-700 hover:text-white"
                                            }`}
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <FontAwesomeIcon
                                            icon={item.icon}
                                            className={`w-5 h-5 ${activePage === item.key ? 'text-white' : 'text-orange-400'
                                                }`}
                                        />
                                        <span>{item.label}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <style jsx='true'>{`
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-slideDown {
                    animation: slideDown 0.3s ease-out;
                }
            `}</style>
            </nav>
        </header>
    );
}