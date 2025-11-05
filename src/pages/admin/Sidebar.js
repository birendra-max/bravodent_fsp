import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faGaugeHigh,
    faServer,
    faGear,
    faRightFromBracket,
    faCircleInfo,
    faBars,
    faXmark,
    faChevronDown,
    faChevronUp,
    faFolderOpen,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

export default function Sidebar() {
    const [active, setActive] = useState("dashboard");
    const [collapsed, setCollapsed] = useState(false); // open by default
    const [openMenu, setOpenMenu] = useState(null); // track which dropdown is open

    const navItems = [
        { name: "Dashboard", icon: faGaugeHigh, id: "dashboard", link: "/admin/dashboard", type: "single" },
        {
            name: "Clients",
            icon: faServer,
            id: "client",
            type: "dropdown",
            submenus: [
                { name: "All Clients", link: "/admin/clients/all" },
                { name: "Add New", link: "/admin/clients/add" },
                { name: "Client Reports", link: "/admin/clients/reports" },
            ],
        },
        {
            name: "Designers",
            icon: faGear,
            id: "design",
            type: "dropdown",
            submenus: [
                { name: "All Designers", link: "/admin/designers/all" },
                { name: "Add Designer", link: "/admin/designers/add" },
            ],
        },
        {
            name: "Cases",
            icon: faCircleInfo,
            id: "cases",
            type: "dropdown",
            submenus: [
                { name: "All Cases", link: "/admin/cases/all" },
                { name: "Open Cases", link: "/admin/cases/open" },
                { name: "Closed Cases", link: "/admin/cases/closed" },
            ],
        },
        {
            name: "Files",
            icon: faFolderOpen,
            id: "files",
            type: "dropdown",
            submenus: [
                { name: "Initial Files", link: "/admin/initial-files" },
                { name: "STL File", link: "/admin/stl-files" },
                { name: "Finished File", link: "/admin/finished-files" },
            ],
        },
    ];

    const toggleDropdown = (id) => {
        setOpenMenu(openMenu === id ? null : id);
    };

    return (
        <aside
            className={`${collapsed ? "w-20" : "w-64"
                } bg-gray-900 text-gray-200 flex flex-col transition-all duration-300 relative shadow-lg`}
        >
            {/* Header / Logo */}
            <div className="flex items-center justify-between p-5 border-b border-gray-800">
                <div className="flex items-center gap-2">
                    <img
                        src="/img/logo.png"
                        alt="Bravodent Logo"
                        className={`object-contain transition-all duration-300 ${collapsed ? "hidden" : "w-40"
                            }`}
                    />
                </div>

                {/* Toggle Button */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="text-gray-400 hover:text-white transition text-xl"
                >
                    <FontAwesomeIcon icon={collapsed ? faBars : faXmark} />
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4 px-3">
                <ul className="space-y-2">
                    {navItems.map((item) => (
                        <li key={item.id}>
                            {/* ✅ SINGLE MENU ITEM (Dashboard) */}
                            {item.type === "single" ? (
                                <Link
                                    to={item.link}
                                    onClick={() => setActive(item.id)}
                                    className={`flex items-center w-full gap-3 px-4 py-2 rounded-xl transition-all duration-200
                    ${active === item.id
                                            ? "bg-blue-600 text-white shadow-md"
                                            : "text-gray-400 hover:bg-gray-800 hover:text-white"
                                        }`}
                                >
                                    <FontAwesomeIcon icon={item.icon} className="text-lg" />
                                    {!collapsed && <span>{item.name}</span>}
                                </Link>
                            ) : (
                                <>
                                    {/* ✅ DROPDOWN MENU HEADER */}
                                    <button
                                        onClick={() => toggleDropdown(item.id)}
                                        className={`flex items-center justify-between w-full px-4 py-2 rounded-xl transition-all duration-200
                      ${openMenu === item.id
                                                ? "bg-blue-600 text-white shadow-md"
                                                : "text-gray-400 hover:bg-gray-800 hover:text-white"
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <FontAwesomeIcon icon={item.icon} className="text-lg" />
                                            {!collapsed && <span>{item.name}</span>}
                                        </div>
                                        {!collapsed && (
                                            <FontAwesomeIcon icon={openMenu === item.id ? faChevronUp : faChevronDown} />
                                        )}
                                    </button>

                                    {/* ✅ SUBMENU ITEMS */}
                                    {openMenu === item.id && !collapsed && (
                                        <ul className="ml-8 mt-2 space-y-1 border-l border-gray-700 pl-3">
                                            {item.submenus.map((sub, index) => (
                                                <li key={index}>
                                                    <Link
                                                        to={sub.link}
                                                        className="block px-3 py-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md text-sm"
                                                    >
                                                        {sub.name}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </>
                            )}
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Footer */}
            <div className="border-t border-gray-800 p-4 text-xs text-gray-500">
                {!collapsed && <p>© 2025 Server Monitor</p>}
                <button
                    className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition mt-2"
                    onClick={() => alert("Logging out...")}
                >
                    <FontAwesomeIcon icon={faRightFromBracket} />
                    {!collapsed && <span>Logout</span>}
                </button>
            </div>
        </aside>
    );
}
