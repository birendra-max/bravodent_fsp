import { useState, useContext, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faGaugeHigh,
    faCircleInfo,
    faBars,
    faXmark,
    faChevronDown,
    faChevronUp,
    faFolderOpen,
    faUsers,
    faPalette,
} from "@fortawesome/free-solid-svg-icons";
import { Link, useLocation } from "react-router-dom";
import { ThemeContext } from "../../Context/ThemeContext";

export default function Sidebar() {
    const { theme } = useContext(ThemeContext);
    const [collapsed, setCollapsed] = useState(false);
    const [openMenu, setOpenMenu] = useState(null);
    const location = useLocation(); // ✅ get current URL path
    const currentPath = location.pathname;

    const navItems = [
        {
            name: "Dashboard",
            icon: faGaugeHigh,
            id: "dashboard",
            link: "/admin/dashboard",
            type: "single",
        },
        {
            name: "Clients",
            icon: faUsers,
            id: "client",
            type: "dropdown",
            submenus: [
                { name: "All Clients", link: "/admin/all-clients" },
                { name: "Add New", link: "/admin/add-client" },
                { name: "Client Reports", link: "/admin/clients/reports" },
            ],
        },
        {
            name: "Designers",
            icon: faPalette,
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

    // ✅ Automatically open dropdown if current path matches submenu
    useEffect(() => {
        const foundMenu = navItems.find(
            (item) =>
                item.submenus &&
                item.submenus.some((sub) => currentPath.includes(sub.link))
        );
        if (foundMenu) {
            setOpenMenu(foundMenu.id);
        }
    }, [currentPath]);

    const sidebarClasses = `
    ${collapsed ? "w-20" : "w-64"} 
    ${theme === "dark" ? "bg-gray-900 text-gray-200" : "bg-gray-100 text-gray-800"} 
    mt-16 min-h-screen flex flex-col transition-all duration-300 relative shadow-lg border-r 
    ${theme === "dark" ? "border-gray-800" : "border-gray-200"}
  `;

    const navLinkClasses = (isActive) =>
        `flex items-center w-full gap-3 px-4 py-2 rounded-xl transition-all duration-200
    ${isActive
            ? "bg-blue-600 text-white shadow-md"
            : theme === "dark"
                ? "text-gray-400 hover:bg-gray-800 hover:text-white"
                : "text-gray-600 hover:bg-gray-200 hover:text-gray-900"
        }`;

    const dropdownHeaderClasses = (isOpen) =>
        `flex items-center justify-between w-full px-4 py-2 rounded-xl transition-all duration-200
    ${isOpen
            ? "bg-blue-600 text-white shadow-md"
            : theme === "dark"
                ? "text-gray-400 hover:bg-gray-800 hover:text-white"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        }`;

    const submenuClasses = `
    ml-8 mt-2 space-y-1 border-l pl-3 
    ${theme === "dark" ? "border-gray-700" : "border-gray-300"}
  `;

    return (
        <aside className={sidebarClasses}>
            {/* Header / Logo */}
            <div
                className={`flex items-center justify-between p-5 border-b ${theme === "dark" ? "border-gray-800" : "border-gray-200"
                    }`}
            >
                <div className={`flex items-center gap-2 ${collapsed ? "hidden" : "w-40"}`}>
                    <span className="font-semibold">Admin Dashboard</span>
                </div>

                {/* Toggle Button */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className={`text-2xl ml-2 cursor-pointer ${theme === "dark"
                            ? "text-gray-400 hover:text-white"
                            : "text-gray-500 hover:text-gray-800"
                        } transition`}
                >
                    <FontAwesomeIcon icon={collapsed ? faBars : faXmark} />
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4 px-3">
                <ul className="space-y-2">
                    {navItems.map((item) => {
                        if (item.type === "single") {
                            return (
                                <li key={item.id}>
                                    <Link
                                        to={item.link}
                                        className={navLinkClasses(currentPath === item.link)}
                                    >
                                        <FontAwesomeIcon icon={item.icon} className="text-lg" />
                                        {!collapsed && <span>{item.name}</span>}
                                    </Link>
                                </li>
                            );
                        }

                        const isMenuOpen = openMenu === item.id;
                        const isSubmenuActive = item.submenus?.some(
                            (sub) => currentPath === sub.link
                        );

                        return (
                            <li key={item.id}>
                                <button
                                    onClick={() => toggleDropdown(item.id)}
                                    className={dropdownHeaderClasses(isMenuOpen || isSubmenuActive)}
                                >
                                    <div className="flex items-center gap-3">
                                        <FontAwesomeIcon icon={item.icon} className="text-lg" />
                                        {!collapsed && <span>{item.name}</span>}
                                    </div>
                                    {!collapsed && (
                                        <FontAwesomeIcon
                                            icon={isMenuOpen ? faChevronUp : faChevronDown}
                                        />
                                    )}
                                </button>

                                {isMenuOpen && !collapsed && (
                                    <ul className={submenuClasses}>
                                        {item.submenus.map((sub, index) => (
                                            <li key={index}>
                                                <Link
                                                    to={sub.link}
                                                    className={`block px-3 py-1.5 rounded-md text-sm transition-all ${currentPath === sub.link
                                                            ? "bg-blue-600 text-white"
                                                            : theme === "dark"
                                                                ? "text-gray-400 hover:text-white hover:bg-gray-800"
                                                                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                                                        }`}
                                                >
                                                    {sub.name}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </aside>
    );
}
