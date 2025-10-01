import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../../Context/UserContext";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faHome,
    faUpload,
    faSearch,
    faChartBar,
    faUser,
    faSignOutAlt,
    faMoon,
    faSun
} from '@fortawesome/free-solid-svg-icons';

export default function Hd() {
    const [mode, setMode] = useState('light');
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useContext(UserContext);
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [activePage, setActivePage] = useState("index");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

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
        { href: "/user/home", label: "Home", key: "index", icon: faHome },
        { href: "/user/new_request", label: "File Upload", key: "new_request", icon: faUpload },
        { href: "/user/multisearch", label: "Advance Search", key: "multisearch", icon: faSearch },
        { href: "/user/reports", label: "Reports", key: "reports", icon: faChartBar }
    ];

    const applyTheme = (theme) => {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    };

    const changeIcon = () => {
        const newMode = mode === 'light' ? 'dark' : 'light';
        setMode(newMode);
        applyTheme(newMode);
    };

    async function logout() {
        try {
            const res = await fetch('http://localhost/bravodent_ci/logout', {
                method: "GET",
                credentials: "include",
            });

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const data = await res.json();

            if (data.status === 'success' && data.message === 'successfully logout') {
                localStorage.removeItem('user');
                navigate('/', { replace: true });
            } else {
                console.error('Logout failed:', data.message);
            }
        } catch (err) {
            console.error('Logout error:', err);
        }
    }

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const orderId = formData.get('orderid');
        if (orderId && orderId.trim()) {
            console.log('Searching for:', orderId);
            setMobileSearchOpen(false);
        }
    };

    return (
        <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? "bg-gray-900 shadow-lg" : "bg-gray-900"}`}>
            <div className="w-full mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between h-16">
                    {/* Logo - Left Side */}
                    <div className="flex-shrink-0">
                        <Link to="/user/home" className="flex items-center">
                            <img
                                src="/img/logo.png"
                                alt="Logo"
                                className="h-8 w-auto sm:h-10 lg:h-12"
                                onError={(e) => {
                                    e.target.src = '/img/placeholder-logo.png';
                                }}
                            />
                        </Link>
                    </div>

                    {/* Center Menu - Desktop */}
                    <div className="hidden lg:flex lg:items-center lg:flex-1 lg:justify-center">
                        <div className="flex items-center space-x-1 bg-gray-800/50 rounded-lg p-1">
                            {navItems.map((item) => (
                                <Link
                                    to={item.href}
                                    key={item.key}
                                    className={`text-sm px-4 py-2 rounded-md font-medium transition-all duration-200 flex items-center space-x-2 ${
                                        activePage === item.key
                                            ? "bg-orange-500 text-white shadow-md"
                                            : "text-gray-300 hover:bg-gray-700 hover:text-white"
                                    }`}
                                >
                                    <FontAwesomeIcon 
                                        icon={item.icon} 
                                        className="w-4 h-4" 
                                    />
                                    <span className="whitespace-nowrap">{item.label}</span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Right Side - Search & Profile */}
                    <div className="flex items-center space-x-4 sm:space-x-6">
                        {/* Search Form - Desktop */}
                        <div className="hidden md:block search-container">
                            <form className="flex items-center" onSubmit={handleSearchSubmit}>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="orderid"
                                        placeholder="Search Orders..."
                                        className="pl-4 pr-10 py-2 w-48 lg:w-64 bg-gray-800 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-gray-700 transition-all duration-200 border border-gray-600"
                                    />
                                    <button
                                        type="submit"
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-orange-400"
                                    >
                                        <FontAwesomeIcon icon={faSearch} className="w-4 h-4" />
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Mobile Search Button */}
                        <button
                            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                            className="md:hidden text-white hover:text-orange-300 p-2"
                        >
                            <FontAwesomeIcon icon={faSearch} className="w-10 h-10" />
                        </button>

                        {/* Theme Toggle */}
                        <button 
                            onClick={changeIcon}
                            className="cursor-pointer text-white hover:text-orange-300 p-2 transition-colors duration-200 "
                        >
                            {mode === 'light' ? (
                                <FontAwesomeIcon icon={faMoon} className="w-12 h-12" />
                            ) : (
                                <FontAwesomeIcon icon={faSun} className="w-12 h-12 text-yellow-400" />
                            )}
                        </button>

                        {/* Profile Dropdown */}
                        <div className="relative dropdown-container">
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="flex items-center text-white hover:text-orange-300 transition-colors duration-200 p-1 cursor-pointer"
                            >
                                <div className="relative">
                                    <img
                                        src={user?.pic && user.pic !== '' ? user.pic : '/img/user.webp'}
                                        alt="User profile"
                                        className="h-8 w-8 sm:h-10 sm:w-10 rounded-full border-2 border-orange-500 object-cover"
                                        onError={(e) => {
                                            e.target.src = '/img/user.webp';
                                        }}
                                    />
                                    <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
                                </div>
                            </button>

                            {dropdownOpen && (
                                <div className="absolute right-0 mt-2 w-64 bg-gray-800 rounded-lg shadow-xl py-2 border border-gray-700 z-50 cursor-pointer">
                                    <div className="px-4 py-3 border-b border-gray-700">
                                        <div className="text-white font-medium truncate">
                                            {user?.name || 'User'}
                                        </div>
                                        <div className="text-gray-400 text-sm truncate">
                                            {user?.email || ''}
                                        </div>
                                    </div>
                                    <div className="py-1">
                                        <Link
                                            to="/user/profile"
                                            className="block px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200 flex items-center"
                                            onClick={() => setDropdownOpen(false)}
                                        >
                                            <FontAwesomeIcon icon={faUser} className="w-4 h-4 mr-3" />
                                            Profile
                                        </Link>
                                        <button
                                            onClick={logout}
                                            className="block w-full text-left px-4 py-3 text-red-400 hover:bg-red-600 hover:text-white transition-colors duration-200 flex items-center"
                                        >
                                            <FontAwesomeIcon icon={faSignOutAlt} className="w-4 h-4 mr-3" />
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="lg:hidden text-white hover:text-orange-300 p-2"
                        >
                            <div className="w-6 h-6 flex flex-col justify-center space-y-1">
                                <span className={`block h-0.5 w-6 bg-current transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                                <span className={`block h-0.5 w-6 bg-current transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`}></span>
                                <span className={`block h-0.5 w-6 bg-current transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Mobile Search Bar */}
                {mobileSearchOpen && (
                    <div className="md:hidden bg-gray-800 px-4 py-3 border-t border-gray-700">
                        <form onSubmit={handleSearchSubmit} className="flex space-x-2">
                            <input
                                type="text"
                                name="orderid"
                                placeholder="Search Orders..."
                                className="flex-1 px-4 py-2 bg-gray-700 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 border border-gray-600"
                            />
                            <button
                                type="submit"
                                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors duration-200"
                            >
                                <FontAwesomeIcon icon={faSearch} className="w-4 h-4" />
                            </button>
                        </form>
                    </div>
                )}

                {/* Mobile Menu */}
                {isOpen && (
                    <div className="lg:hidden bg-gray-800 border-t border-gray-700">
                        <div className="px-2 py-3 space-y-1">
                            {navItems.map((item) => (
                                <Link
                                    to={item.href}
                                    key={item.key}
                                    className={`block px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-3 ${
                                        activePage === item.key
                                            ? "bg-orange-500 text-white"
                                            : "text-gray-300 hover:bg-gray-700 hover:text-white"
                                    }`}
                                    onClick={() => setIsOpen(false)}
                                >
                                    <FontAwesomeIcon icon={item.icon} className="w-5 h-5" />
                                    <span className="text-lg">{item.label}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}