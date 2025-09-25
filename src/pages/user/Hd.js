import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../../Context/UserContext";
import { Link, Navigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faHome,
    faUpload,
    faSearch,
    faChartBar,
    faFileAlt
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from "react-router-dom";

export default function Hd() {
    const navigate = useNavigate();
    const { user } = useContext(UserContext);
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [activePage, setActivePage] = useState("index");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

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
        const pathname = window.location.pathname;
        if (pathname.includes("new_request")) setActivePage("new_request");
        else if (pathname.includes("multisearch")) setActivePage("multisearch");
        else if (pathname.includes("reports")) setActivePage("reports");
        else setActivePage("index");
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownOpen && !event.target.closest('.dropdown-container')) {
                setDropdownOpen(false);
            }
            if (isOpen && !event.target.closest('.mobile-menu-container')) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [dropdownOpen, isOpen]);

    const navItems = [
        { href: "/user/home", label: "Home", key: "index", icon: faHome },
        { href: "/user/new_request", label: "File Upload", key: "new_request", icon: faUpload },
        { href: "/user/multisearch", label: "Advance Search", key: "multisearch", icon: faSearch },
        { href: "/user/reports", label: "Reports", key: "reports", icon: faChartBar }
    ];

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
                navigate('/', { replace: true });
            } else {
                console.error('Logout failed:', data.message);
            }
        } catch (err) {
            console.error('Logout error:', err);
        }
    }

    return (
        <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? "bg-gray-900 shadow-lg" : "bg-gray-900"}`}>
            <div className="w-full mx-auto px-3 sm:px-4 lg:px-6">
                <div className="flex items-center justify-between h-16 sm:h-18">
                    {/* Logo - Left Side */}
                    <div className="flex-shrink-0 flex items-center">
                        <img
                            src="/img/logo.png"
                            alt="Logo"
                            className="h-10 w-auto sm:h-12"
                        />
                    </div>

                    {/* Center Menu - Desktop */}
                    <div className="hidden lg:flex lg:items-center lg:flex-1 lg:justify-center">
                        <div className="flex items-center space-x-1 bg-gray-800/50 rounded-lg p-1 mx-2 xl:mx-4 text-sm xl:text-base">
                            {navItems.map((item) => (
                                <Link
                                    to={item.href}
                                    key={item.key}
                                    className={`px-3 py-2 xl:px-4 xl:py-2 rounded-md font-medium transition-all duration-200 flex items-center space-x-2 ${activePage === item.key
                                        ? "bg-orange-500 text-white shadow-md"
                                        : "text-gray-300 hover:bg-gray-700 hover:text-white"
                                        }`}
                                >
                                    <FontAwesomeIcon icon={item.icon} className="w-3 h-3 xl:w-4 xl:h-4" />
                                    <span className="whitespace-nowrap">{item.label}</span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Right Side - Search & Profile */}
                    <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 flex-shrink-0">
                        {/* Search Form - Desktop */}
                        <div className="hidden md:block">
                            <form className="flex items-center space-x-2" method="post" action="search.php">
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="orderid"
                                        placeholder="Search Orders..."
                                        className="pl-3 pr-8 py-1.5 w-40 lg:w-56 xl:w-72 bg-gray-800 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-gray-700 transition-all duration-200 border border-gray-600 text-sm"
                                    />
                                    <button
                                        type="submit"
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-orange-400"
                                    >
                                        <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Mobile Search Button */}
                        <div className="md:hidden flex items-center">
                            <button
                                onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                                className="text-white hover:text-orange-300 transition-colors duration-200 p-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </button>
                        </div>

                        {/* Profile Dropdown */}
                        <div className="relative dropdown-container">
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="flex items-center space-x-2 text-white hover:text-orange-300 transition-colors duration-200 p-1 rounded-lg hover:bg-gray-800 cursor-pointer"
                            >
                                <div className="text-right hidden sm:block">
                                    <div className="text-xs lg:text-sm font-medium truncate max-w-24 xl:max-w-full">
                                        {user?.name || 'User'}
                                    </div>
                                </div>
                                <div className="relative">
                                    <img
                                        src={user?.pic === '' ? '/img/user.webp' : user?.pic || '/img/user.webp'}
                                        alt="User"
                                        className="h-8 w-8 sm:h-10 sm:w-10 rounded-full border-2 border-orange-500 object-cover"
                                    />
                                    <div className="absolute bottom-0 right-0 h-2 w-2 sm:h-3 sm:w-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
                                </div>
                            </button>

                            {/* Dropdown Menu */}
                            {dropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl py-2 border border-gray-700 animate-dropdown z-50">
                                    <Link
                                        to="/user/profile"
                                        className="block px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200 flex items-center text-sm"
                                        onClick={() => setDropdownOpen(false)}
                                    >
                                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        Profile
                                    </Link>
                                    <Link
                                        to="/user/password"
                                        className="block px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200 flex items-center text-sm"
                                        onClick={() => setDropdownOpen(false)}
                                    >
                                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                        Password
                                    </Link>
                                    <Link
                                        to="/user/settings"
                                        className="block px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200 flex items-center text-sm"
                                        onClick={() => setDropdownOpen(false)}
                                    >
                                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        </svg>
                                        Settings
                                    </Link>
                                    <div className="border-t border-gray-600 my-1"></div>
                                    <button
                                        onClick={logout}
                                        className="block w-full text-left px-4 py-3 text-red-400 hover:bg-red-600 hover:text-white transition-colors duration-200 flex items-center text-sm"
                                    >
                                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="lg:hidden flex items-center mobile-menu-container">
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="text-white hover:text-orange-300 focus:outline-none transition-colors duration-200 p-2"
                            >
                                <div className="w-5 h-5 flex flex-col justify-center space-y-1">
                                    <span className={`block h-0.5 w-5 bg-current transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
                                    <span className={`block h-0.5 w-5 bg-current transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`}></span>
                                    <span className={`block h-0.5 w-5 bg-current transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Search Bar */}
                {mobileSearchOpen && (
                    <div className="md:hidden bg-gray-800 px-3 py-2 animate-slideDown">
                        <form method="post" action="search.php" className="flex space-x-2">
                            <input
                                type="text"
                                name="orderid"
                                placeholder="Search Orders..."
                                className="flex-1 px-3 py-2 bg-gray-700 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 border border-gray-600 text-sm"
                            />
                            <button
                                type="submit"
                                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors duration-200 text-sm font-medium"
                                onClick={() => setMobileSearchOpen(false)}
                            >
                                Search
                            </button>
                        </form>
                    </div>
                )}

                {/* Mobile Menu */}
                {isOpen && (
                    <div className="lg:hidden bg-gray-800 rounded-lg mt-2 mx-3 shadow-xl animate-slideDown">
                        <div className="px-3 py-3 space-y-1">
                            {/* Mobile Navigation Links with Icons */}
                            {navItems.map((item) => (
                                <Link
                                    to={item.href}
                                    key={item.key}
                                    className={`block px-3 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-3 text-sm ${activePage === item.key
                                        ? "bg-orange-500 text-white"
                                        : "text-gray-300 hover:bg-gray-700 hover:text-white"
                                        }`}
                                    onClick={() => setIsOpen(false)}
                                >
                                    <FontAwesomeIcon icon={item.icon} className="w-4 h-4" />
                                    <span>{item.label}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                .animate-slideDown {
                    animation: slideDown 0.3s ease-out;
                }
                .animate-dropdown {
                    animation: dropdown 0.2s ease-out;
                }
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
                @keyframes dropdown {
                    from {
                        opacity: 0;
                        transform: translateY(-5px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
            `}</style>
        </nav>
    );
}