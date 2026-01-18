import React, { useState, useMemo, useEffect, useContext, useRef, useCallback } from "react";
import Loder from "../../Components/Loder";
import Chatbox from "../../Components/Chatbox";
import { ThemeContext } from "../../Context/ThemeContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { fetchWithAuth } from '../../utils/userapi';
import { faFolderOpen } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { UserContext } from "../../Context/UserContext";

const parseDateForFilter = (value) => {
    if (!value) return null;

    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
        const [y, m, d] = value.split("-").map(Number);
        return new Date(y, m - 1, d).getTime();
    }

    if (typeof value !== "string") return null;

    const str = value.trim();

    const match = str.match(
        /^(\d{1,2})-([A-Za-z]{3})-(\d{4})(?:\s+\d{1,2}:\d{2}:\d{2}(?:am|pm))?$/
    );

    if (!match) return null;

    const [, day, mon, year] = match;

    const months = {
        jan: 0, feb: 1, mar: 2, apr: 3,
        may: 4, jun: 5, jul: 6, aug: 7,
        sep: 8, oct: 9, nov: 10, dec: 11
    };

    const monthIndex = months[mon.toLowerCase()];
    if (monthIndex === undefined) return null;

    return new Date(
        Number(year),
        monthIndex,
        Number(day)
    ).getTime();
};

// Floating Chatbox Wrapper Component
const FloatingChatboxWrapper = React.memo(({
    orderid,
    position,
    onClose,
    theme
}) => {
    const chatboxRef = useRef(null);

    // Handle click outside to close
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (chatboxRef.current && !chatboxRef.current.contains(event.target)) {
                // Check if the click is on a message icon
                const messageIcon = event.target.closest('.message-icon-container');
                if (!messageIcon) {
                    onClose();
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    if (!orderid || !position) return null;

    return (
        <div
            ref={chatboxRef}
            style={{
                position: 'fixed',
                top: `${position.top}px`,
                left: `${position.left}px`,
                zIndex: 9999
            }}
            className="chatbox-container"
        >
            <Chatbox
                orderid={orderid}
                isFloating={true}
                onClose={onClose}
                position={position}
                theme={theme}
            />
        </div>
    );
});

// Use React.memo to prevent unnecessary re-renders
const RedesignPopup = React.memo(({
    theme,
    showRedesignPopup,
    pendingRedesignOrders,
    redesignMessage,
    setRedesignMessage,
    isSubmitting,
    handleRedesignSubmit,
    setShowRedesignPopup
}) => {
    const textareaRef = useRef(null);

    // Use local state only, no duplication with parent state
    const [localMessage, setLocalMessage] = useState(redesignMessage || "");

    // Update local state only when redesignMessage prop changes and popup opens
    useEffect(() => {
        if (showRedesignPopup) {
            setLocalMessage(redesignMessage || "");
        }
    }, [showRedesignPopup, redesignMessage]);

    useEffect(() => {
        if (showRedesignPopup && textareaRef.current) {
            const timer = setTimeout(() => {
                if (textareaRef.current) {
                    textareaRef.current.focus();
                    // Move cursor to end
                    textareaRef.current.selectionStart = textareaRef.current.selectionEnd = textareaRef.current.value.length;
                }
            }, 10);
            return () => clearTimeout(timer);
        }
    }, [showRedesignPopup]);

    // Debounced update to parent state to prevent frequent re-renders
    const updateParentMessage = useCallback(
        debounce((message) => {
            setRedesignMessage(message);
        }, 300),
        [setRedesignMessage]
    );

    const handleMessageChange = useCallback((e) => {
        const value = e.target.value;
        setLocalMessage(value);
        updateParentMessage(value);
    }, [updateParentMessage]);

    const handleClosePopup = useCallback(() => {
        if (!isSubmitting) {
            setShowRedesignPopup(false);
            // Don't clear parent state here, let parent handle it
        }
    }, [isSubmitting, setShowRedesignPopup]);

    if (!showRedesignPopup) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div
                className={`rounded-2xl shadow-2xl w-full max-w-lg ${theme === 'dark'
                    ? 'bg-gradient-to-br from-gray-900 to-gray-800 text-white border border-gray-700/50'
                    : 'bg-gradient-to-br from-white to-gray-50 text-gray-800 border border-gray-200/50'}`}
            >
                <div className={`rounded-t-2xl p-5 ${theme === 'dark'
                    ? 'bg-gradient-to-r from-orange-900/20 to-red-900/20 border-b border-orange-800/30'
                    : 'bg-gradient-to-r from-orange-50 to-red-50 border-b border-orange-200'}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl ${theme === 'dark'
                                ? 'bg-gradient-to-br from-orange-600 to-red-600'
                                : 'bg-gradient-to-br from-orange-500 to-red-500'}`}>
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">
                                    Send for Redesign
                                </h2>
                                <p className={`text-sm ${theme === 'dark' ? 'text-orange-300' : 'text-orange-600'}`}>
                                    Provide feedback for the design team
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleClosePopup}
                            disabled={isSubmitting}
                            className={`p-2 rounded-xl hover:bg-gray-800/50 text-gray-400 hover:text-white ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    <div className={`mb-6 p-4 rounded-xl ${theme === 'dark'
                        ? 'bg-gradient-to-r from-gray-800 to-gray-900/80 border border-gray-700/50'
                        : 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200'}`}>
                        <div className="flex items-center gap-2 mb-3">
                            <div className={`p-1.5 rounded-lg ${theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
                                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <span className={`font-semibold ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>
                                {pendingRedesignOrders.length} Order{pendingRedesignOrders.length > 1 ? 's' : ''} Selected
                            </span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {pendingRedesignOrders.map((id, index) => (
                                <div
                                    key={id}
                                    className={`px-3 py-2 rounded-lg flex items-center gap-2 ${theme === 'dark'
                                        ? 'bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border border-blue-800/30'
                                        : 'bg-gradient-to-r from-blue-100 to-indigo-100 border border-blue-200'}`}
                                >
                                    <div className={`w-2 h-2 rounded-full ${index % 3 === 0 ? 'bg-green-500' : index % 3 === 1 ? 'bg-blue-500' : 'bg-purple-500'}`}></div>
                                    <span className="font-medium text-sm">#{id}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mb-6">
                        <div className="flex items-center mb-3">
                            <label className={`font-semibold flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                                <div className={`p-1.5 rounded-lg ${theme === 'dark' ? 'bg-orange-900/30' : 'bg-orange-100'}`}>
                                    <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                Design Feedback
                                <span className="text-red-500 ml-1">*</span>
                            </label>
                        </div>

                        <div className="relative">
                            <textarea
                                ref={textareaRef}
                                value={localMessage}
                                onChange={handleMessageChange}
                                placeholder="Describe what needs to be changed or improved..."
                                className={`w-full p-4 rounded-xl border-2 focus:outline-none focus:ring-2 resize-none
              ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}
              ${theme === 'dark'
                                        ? 'bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-orange-500 focus:ring-orange-500/20'
                                        : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400 focus:border-orange-500 focus:ring-orange-500/20'}`}
                                rows="5"
                                disabled={isSubmitting}
                            />
                            <div className="absolute bottom-3 right-3">
                                <div className={`p-1 rounded-lg ${theme === 'dark' ? 'bg-gray-800/80' : 'bg-gray-100/80'}`}>
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={`rounded-b-2xl p-5 ${theme === 'dark'
                    ? 'bg-gradient-to-r from-gray-900/80 to-gray-800/80 border-t border-gray-700/50'
                    : 'bg-gradient-to-r from-gray-50 to-gray-100/80 border-t border-gray-200'}`}>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={handleClosePopup}
                            disabled={isSubmitting}
                            className={`px-5 py-3 rounded-xl font-medium flex-1 flex items-center justify-center gap-2 ${isSubmitting
                                ? 'opacity-50 cursor-not-allowed'
                                : theme === 'dark'
                                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white border border-gray-700'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:text-gray-900 border border-gray-300'}`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Cancel
                        </button>
                        <button
                            onClick={handleRedesignSubmit}
                            disabled={isSubmitting || !localMessage.trim()}
                            className={`px-5 py-3 rounded-xl font-medium flex-1 flex items-center justify-center gap-2 ${isSubmitting || !localMessage.trim()
                                ? theme === 'dark'
                                    ? 'bg-gradient-to-r from-gray-700 to-gray-800 text-gray-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-500 cursor-not-allowed'
                                : 'bg-gradient-to-r from-orange-500 via-orange-600 to-red-600 hover:from-orange-600 hover:via-orange-700 hover:to-red-700 text-white shadow-lg hover:shadow-xl shadow-orange-500/25'
                                }`}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    <span>Sending...</span>
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    <span>
                                        Send{pendingRedesignOrders.length > 1 ? ` ${pendingRedesignOrders.length} Orders` : ' for Redesign'}
                                    </span>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </div>

                    {isSubmitting && (
                        <div className="mt-4">
                            <div className={`h-1 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                                <div className="h-full bg-gradient-to-r from-orange-500 to-red-500 animate-pulse"></div>
                            </div>
                            <p className={`text-center text-xs mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                Processing your redesign request...
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

// Simple debounce utility function
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

export default function Datatable({
    columns = [],
    data = [],
    rowsPerPageOptions = [50, 100, 200, 500],
    loading = false,
    error = null
}) {
    const { theme } = useContext(ThemeContext);
    const [status, setStatus] = useState("show");
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[0]);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
    const [selectedRows, setSelectedRows] = useState([]);
    const [fileType, setFileType] = useState("stl");
    const [showRedesignPopup, setShowRedesignPopup] = useState(false);
    const [redesignMessage, setRedesignMessage] = useState("");
    const [pendingRedesignOrders, setPendingRedesignOrders] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const { user } = useContext(UserContext);

    // State for floating chatbox
    const [chatboxState, setChatboxState] = useState({
        isOpen: false,
        orderid: null,
        position: null
    });

    // Memoize the data to prevent unnecessary re-renders
    const memoizedData = useMemo(() => data || [], [data]);

    useEffect(() => {
        if (!loading) {
            setStatus("hide");
        } else {
            setStatus("show");
        }
    }, [loading]);

    // Optimize filteredData calculation with useMemo
    const filteredData = useMemo(() => {
        let filtered = memoizedData;

        if (dateFrom || dateTo) {
            filtered = filtered.filter((row) => {
                const rawDate = row.order_date;
                const rowTime = parseDateForFilter(rawDate);
                if (!rowTime) return false;

                const fromTime = dateFrom ? parseDateForFilter(dateFrom) : null;
                const toTime = dateTo ? parseDateForFilter(dateTo) : null;

                if (fromTime && rowTime < fromTime) return false;
                if (toTime && rowTime > toTime) return false;

                return true;
            });
        }

        if (search) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter((row) =>
                columns.some((col) => {
                    const value = row[col.accessor];
                    return value != null &&
                        String(value).toLowerCase().includes(searchLower);
                })
            );
        }

        if (sortConfig.key) {
            filtered = [...filtered].sort((a, b) => {
                const aVal = a[sortConfig.key];
                const bVal = b[sortConfig.key];

                if (aVal == null) return 1;
                if (bVal == null) return -1;

                const isNumeric = !isNaN(aVal) && !isNaN(bVal);

                if (isNumeric) {
                    return sortConfig.direction === "asc"
                        ? Number(aVal) - Number(bVal)
                        : Number(bVal) - Number(aVal);
                } else {
                    return sortConfig.direction === "asc"
                        ? String(aVal).localeCompare(String(bVal))
                        : String(bVal).localeCompare(String(aVal));
                }
            });
        }

        return filtered;
    }, [search, memoizedData, columns, sortConfig, dateFrom, dateTo]);

    const totalPages = Math.max(1, Math.ceil(filteredData.length / rowsPerPage));

    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * rowsPerPage;
        return filteredData.slice(start, start + rowsPerPage);
    }, [currentPage, filteredData, rowsPerPage]);

    // Memoize all callbacks
    const handleSearch = useCallback((e) => {
        setSearch(e.target.value);
        setCurrentPage(1);
    }, []);

    const handlePageChange = useCallback((page) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    }, [totalPages]);

    const handleSort = useCallback((key) => {
        setSortConfig(prev => {
            if (prev.key === key && prev.direction === "asc") {
                return { key, direction: "desc" };
            } else if (prev.key === key && prev.direction === "desc") {
                return { key: null, direction: "asc" };
            }
            return { key, direction: "asc" };
        });
    }, []);

    const handleRowsPerPageChange = useCallback((e) => {
        setRowsPerPage(parseInt(e.target.value));
        setCurrentPage(1);
    }, []);

    const getPageNumbers = useCallback((totalPages, currentPage) => {
        const maxButtons = 5;
        const pages = [];

        if (totalPages <= maxButtons) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, currentPage + 2);

        if (startPage > 1) pages.push(1, "...");
        for (let i = startPage; i <= endPage; i++) pages.push(i);
        if (endPage < totalPages) pages.push("...", totalPages);

        return pages;
    }, []);

    const openChatbox = useCallback((orderid, event) => {
        const iconElement = event.currentTarget;
        const rect = iconElement.getBoundingClientRect();

        const chatboxWidth = 350;
        const chatboxHeight = 450;

        let left = rect.left - chatboxWidth - 10;

        if (left < 10) {
            left = rect.right + 10;
        }
        let top = rect.top;
        if (top + chatboxHeight > window.innerHeight) {
            top = window.innerHeight - chatboxHeight - 10;
        }
        if (top < 10) {
            top = 10;
        }

        const position = {
            top: top,
            left: left
        };

        setChatboxState({
            isOpen: true,
            orderid,
            position
        });
    }, []);

    const closeChatbox = useCallback(() => {
        setChatboxState({
            isOpen: false,
            orderid: null,
            position: null
        });
    }, []);

    const sendRedesign = useCallback(async (orderIds, message) => {
        try {
            const response = await fetchWithAuth("send-for-redesign", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    orders: orderIds,
                    message: message,
                    labname: user.labname
                }),
            });

            return response;
        } catch (error) {
            return {
                status: "error",
                message: "Server error. Please try again later."
            };
        }
    }, []);

    const toggleSelectRow = useCallback((id) =>
        setSelectedRows((prev) =>
            prev.includes(id)
                ? prev.filter((x) => x !== id)
                : [...prev, id]
        ), []);

    const toggleSelectAll = useCallback(() => {
        const visibleIds = paginatedData.map((r) => r.orderid);
        if (paginatedData.every((r) => selectedRows.includes(r.orderid))) {
            setSelectedRows(selectedRows.filter((id) => !visibleIds.includes(id)));
        } else {
            setSelectedRows([...new Set([...selectedRows, ...visibleIds])]);
        }
    }, [paginatedData, selectedRows]);

    const openRedesignPopup = useCallback(() => {
        if (!selectedRows.length) {
            alert("Please select at least one case to proceed with the redesign request.");
            return;
        }

        const validOrders = selectedRows.filter(id => {
            const row = memoizedData.find((x) => x.orderid === id);
            return row && row.status !== "New" && row.status !== "Redesign";
        });

        if (validOrders.length === 0) {
            alert("Orders with 'New' status or already in 'Redesign' cannot be sent for redesign.");
            return;
        }

        setPendingRedesignOrders(validOrders);
        setRedesignMessage("");
        setShowRedesignPopup(true);
    }, [selectedRows, memoizedData]);

    const handleRedesignSubmit = useCallback(async () => {
        if (!redesignMessage.trim()) {
            alert("Please enter a message for the redesign request.");
            return;
        }

        setIsSubmitting(true);

        const newOrderIds = [];
        const redesignIds = [];
        const validOrders = [];

        for (let id of pendingRedesignOrders) {
            const r = memoizedData.find((x) => x.orderid === id);

            if (!r) continue;

            if (r.status === "New") {
                newOrderIds.push(id);
                continue;
            }

            if (r.status === "Redesign") {
                redesignIds.push(id);
                continue;
            }

            validOrders.push(id);
        }

        if (newOrderIds.length === pendingRedesignOrders.length) {
            setIsSubmitting(false);
            const msg = newOrderIds.length === 1
                ? `Order ${newOrderIds[0]} cannot be sent for redesign because it is a new order.`
                : `All selected orders cannot be sent for redesign because they are new orders.`;
            alert(msg);
            return;
        }

        if (validOrders.length === 0) {
            setIsSubmitting(false);
            const msg = redesignIds.length === 1
                ? `Order ${redesignIds[0]} is already in redesign process.`
                : `All selected orders are already in redesign process.`;
            alert(msg);
            return;
        }

        const res = await sendRedesign(validOrders, redesignMessage);

        setIsSubmitting(false);
        setShowRedesignPopup(false);
        setRedesignMessage("");
        setSelectedRows([]);

        if (res.status === "success") {
            let successMsg = res.message || "Orders sent for redesign successfully.";

            if (newOrderIds.length > 0) {
                successMsg += "\n\nNote: " + (newOrderIds.length === 1
                    ? `Order ${newOrderIds[0]} was skipped as it's a new order.`
                    : `Orders ${newOrderIds.join(', ')} were skipped as they are new orders.`);
            }

            if (redesignIds.length > 0) {
                successMsg += "\n\nNote: " + (redesignIds.length === 1
                    ? `Order ${redesignIds[0]} was skipped as it's already in redesign.`
                    : `Orders ${redesignIds.join(', ')} were skipped as they are already in redesign.`);
            }

            alert(successMsg);
            window.location.reload();
        } else {
            alert(res.message || "Failed to send orders for redesign.");
        }
    }, [redesignMessage, pendingRedesignOrders, memoizedData, sendRedesign]);

    const base_url = localStorage.getItem('bravo_user_base_url');

    const handleBulkDownload = useCallback(async () => {
        if (!selectedRows.length) {
            alert("Please select at least one record to proceed with the download.");
            return;
        }

        let missingFiles = [];

        for (const id of selectedRows) {
            const row = memoizedData.find((r) => r.orderid === id);
            if (!row) continue;

            try {
                if (fileType === "stl") {
                    const res = await fetch(`${base_url}/download-all?orderid=${id}`, {
                        headers: { 'X-Tenant': 'bravodent' }
                    });
                    const files = await res.json();

                    if (!Array.isArray(files) || files.length === 0) {
                        missingFiles.push(id);
                        continue;
                    }

                    for (const filePath of files) {
                        if (!filePath) continue;

                        const encodedPath = encodeURIComponent(filePath);
                        const finalUrl = `${base_url}/download?path=${encodedPath}`;
                        const filename = filePath.split('/').pop();

                        const link = document.createElement("a");
                        link.href = finalUrl;
                        link.target = "_blank";
                        link.download = filename || "download";
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);

                        await new Promise(r => setTimeout(r, 500));
                    }

                } else if (fileType === "initial" || fileType === "finish") {
                    let path = fileType === "initial" ? row.file_path : row.finish_file_path;

                    if (!path || path.trim() === "") {
                        missingFiles.push(id);
                        continue;
                    }

                    const encodedPath = encodeURIComponent(path);
                    const finalUrl = `${base_url}/download?path=${encodedPath}`;
                    const filename = `${fileType}_${id}`;

                    const link = document.createElement("a");
                    link.href = finalUrl;
                    link.target = "_blank";
                    link.download = filename;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
            } catch (err) {
                missingFiles.push(id);
            }
        }

        if (missingFiles.length > 0) {
            alert(`Files not found for order IDs: ${missingFiles.join(", ")}`);
        }
    }, [selectedRows, memoizedData, fileType, base_url]);

    const clearDateFilters = useCallback(() => {
        setDateFrom("");
        setDateTo("");
    }, []);

    // Memoize style getters
    const getBackgroundClass = useMemo(() => {
        return theme === 'dark'
            ? 'bg-gray-900 text-white'
            : 'bg-gray-200 text-gray-800';
    }, [theme]);

    const getTableHeaderClass = useMemo(() => {
        return theme === 'dark'
            ? 'bg-gray-700 text-white'
            : 'bg-blue-600 text-white';
    }, [theme]);

    const getTableRowClass = useCallback((idx) => {
        if (theme === 'dark') {
            return idx % 2 === 0 ? 'bg-gray-800 text-white' : 'bg-gray-700 text-white';
        } else {
            return idx % 2 === 0 ? 'bg-gray-100 text-gray-800' : 'bg-white text-gray-800';
        }
    }, [theme]);

    const getInputClass = useMemo(() => {
        return theme === 'dark'
            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
            : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500';
    }, [theme]);

    const getSelectClass = useMemo(() => {
        return theme === 'dark'
            ? 'bg-gray-700 border-gray-600 text-white'
            : 'bg-white border-gray-300 text-gray-800';
    }, [theme]);

    const getPaginationButtonStyle = useCallback((isActive = false) => {
        const baseStyle = {
            padding: "8px 12px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold",
        };

        if (theme === 'dark') {
            return {
                ...baseStyle,
                background: isActive ? "#4f46e5" : "#374151",
                color: isActive ? "#fff" : "#d1d5db",
                borderColor: isActive ? "#4f46e5" : "#4b5563",
            };
        } else {
            return {
                ...baseStyle,
                background: isActive ? "#007bff" : "#fff",
                color: isActive ? "#fff" : "#000",
                borderColor: "#ccc",
            };
        }
    }, [theme]);

    const getDisabledButtonStyle = () => {
        return theme === 'dark'
            ? { ...getPaginationButtonStyle(), background: "#1f2937", color: "#6b7280", cursor: "not-allowed" }
            : { ...getPaginationButtonStyle(), background: "#f8f9fa", color: "#6c757d", cursor: "not-allowed" };
    };

    const getNoDataClass = useMemo(() => {
        return theme === 'dark'
            ? 'bg-gray-800 text-gray-300'
            : 'bg-gray-100 text-gray-600';
    }, [theme]);

    const handleFileTypeChange = useCallback((e) => {
        setFileType(e.target.value);
    }, []);

    const handleDateFromChange = useCallback((e) => {
        setDateFrom(e.target.value);
    }, []);

    const handleDateToChange = useCallback((e) => {
        setDateTo(e.target.value);
    }, []);

    // Handle popup close and clear message
    const handlePopupClose = useCallback(() => {
        setShowRedesignPopup(false);
        setRedesignMessage("");
    }, []);

    return (
        <>
            <Loder status={status} />

            {/* Floating Chatbox */}
            {chatboxState.isOpen && (
                <FloatingChatboxWrapper
                    orderid={chatboxState.orderid}
                    position={chatboxState.position}
                    onClose={closeChatbox}
                    theme={theme}
                />
            )}

            <RedesignPopup
                theme={theme}
                showRedesignPopup={showRedesignPopup}
                pendingRedesignOrders={pendingRedesignOrders}
                redesignMessage={redesignMessage}
                setRedesignMessage={setRedesignMessage}
                isSubmitting={isSubmitting}
                handleRedesignSubmit={handleRedesignSubmit}
                setShowRedesignPopup={handlePopupClose}
            />

            {status === "hide" && (
                <section
                    style={{ padding: "20px" }}
                    className={`overflow-scroll md:overflow-hidden rounded-xl mt-4 ${getBackgroundClass}`}
                >
                    {(!Array.isArray(columns) || columns.length === 0) && (
                        <div className={`p-5 text-center rounded-lg ${getNoDataClass}`}>
                            ⚠️ No columns provided.
                        </div>
                    )}

                    {Array.isArray(columns) && columns.length > 0 && (
                        <>
                            <div className="mb-4">
                                <div className="flex flex-col lg:flex-row items-stretch gap-2">
                                    <div className={`flex-1 rounded-lg border ${theme === 'light' ? 'bg-white border-gray-100' : 'bg-gray-900 border-gray-800'}`}>
                                        <div className="flex flex-col md:flex-row items-center p-4 gap-4">
                                            <div className="w-full md:w-auto">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-sm font-medium whitespace-nowrap ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                                                        File Type:
                                                    </span>
                                                    <select
                                                        value={fileType}
                                                        onChange={handleFileTypeChange}
                                                        className={`px-3 py-2 text-sm border-b focus:outline-none w-48 ${theme === 'light'
                                                            ? 'bg-transparent text-black border-gray-300 focus:border-blue-500'
                                                            : 'bg-gray-800 text-white border-gray-600 focus:border-blue-500'}`}
                                                    >
                                                        <option value="stl">STL Files</option>
                                                        <option value="finish">Finished Files</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="flex gap-3 w-full md:w-auto">
                                                <button
                                                    onClick={handleBulkDownload}
                                                    className={`group flex-1 md:flex-none px-5 py-2.5 rounded-lg flex items-center justify-center gap-2 font-medium text-sm transition-all duration-200 ${theme === 'light'
                                                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-sm hover:shadow-md'
                                                        : 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white shadow-sm hover:shadow-md'}`}
                                                >
                                                    <svg className="w-4 h-4 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                    </svg>
                                                    Download All
                                                </button>

                                                <button
                                                    onClick={openRedesignPopup}
                                                    className={`group flex-1 md:flex-none px-5 py-2.5 rounded-lg flex items-center justify-center gap-2 font-medium text-sm transition-all duration-200 ${theme === 'light'
                                                        ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-sm hover:shadow-md'
                                                        : 'bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-700 hover:to-orange-800 text-white shadow-sm hover:shadow-md'}`}
                                                >
                                                    <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                    </svg>
                                                    Send for Redesign
                                                </button>
                                            </div>

                                            <div className="flex-1 flex flex-wrap items-center gap-3">
                                                <div className="flex items-center gap-2">
                                                    <label className={`text-sm font-medium whitespace-nowrap ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                                                        From:
                                                    </label>
                                                    <input
                                                        type="date"
                                                        value={dateFrom}
                                                        onChange={handleDateFromChange}
                                                        className={`px-3 py-2 text-sm border rounded focus:outline-none w-36 ${theme === 'light'
                                                            ? 'bg-white text-black border-gray-300 focus:border-blue-500'
                                                            : 'bg-gray-800 text-white border-gray-600 focus:border-blue-500'}`}
                                                    />
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <label className={`text-sm font-medium whitespace-nowrap ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                                                        To:
                                                    </label>
                                                    <input
                                                        type="date"
                                                        value={dateTo}
                                                        onChange={handleDateToChange}
                                                        className={`px-3 py-2 text-sm border rounded focus:outline-none w-36 ${theme === 'light'
                                                            ? 'bg-white text-black border-gray-300 focus:border-blue-500'
                                                            : 'bg-gray-800 text-white border-gray-600 focus:border-blue-500'}`}
                                                    />
                                                </div>

                                                {(dateFrom || dateTo) && (
                                                    <button
                                                        onClick={clearDateFilters}
                                                        title="Clear filters"
                                                        className={`flex items-center gap-2 px-1 py-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-sm font-medium rounded-lg border border-red-600 transition-all duration-200 shadow-lg hover:shadow-xl cursor-pointer`}
                                                    >
                                                        <svg
                                                            className="w-6 h-6"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M6 18L18 6M6 6l12 12"
                                                            />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className={`rounded-lg border p-4 ${theme === 'light' ? 'bg-white border-gray-100' : 'bg-gray-900 border-gray-800'}`}>
                                        <div className="relative group">
                                            <input
                                                type="text"
                                                placeholder="Search files..."
                                                value={search}
                                                onChange={handleSearch}
                                                className={`pl-10 pr-4 py-2.5 w-full lg:w-72 rounded-lg text-sm focus:outline-none transition-all duration-200 ${theme === 'light'
                                                    ? 'bg-gray-50 border border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 group-hover:border-blue-400'
                                                    : 'bg-gray-800 border border-gray-700 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 group-hover:border-blue-600'}`}
                                            />
                                            <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${theme === 'light'
                                                ? 'text-gray-400 group-focus-within:text-blue-500'
                                                : 'text-gray-500 group-focus-within:text-blue-400'}`}>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <table id="datatable" style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                    <tr className={getTableHeaderClass}>
                                        <th style={{
                                            border: "1px solid #ddd",
                                            width: "10vh",
                                            minWidth: "10vh",
                                            maxWidth: "10vh",
                                            textAlign: "center",
                                            padding: "8px"
                                        }}>
                                            <input
                                                type="checkbox"
                                                checked={paginatedData.length > 0 && paginatedData.every((r) => selectedRows.includes(r.orderid))}
                                                onChange={toggleSelectAll}
                                                style={{ transform: "scale(1.3)", cursor: "pointer" }}
                                            />
                                        </th>

                                        {columns.map((col) => (
                                            <th
                                                key={col.accessor}
                                                onClick={() => handleSort(col.accessor)}
                                                style={{ border: "1px solid #ddd", padding: "12px", cursor: "pointer" }}
                                            >
                                                {col.header}
                                                {sortConfig.key === col.accessor && (
                                                    <span style={{ marginLeft: "5px" }}>
                                                        {sortConfig.direction === "asc" ? "▲" : "▼"}
                                                    </span>
                                                )}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedData.length > 0 ? (
                                        paginatedData.map((row, idx) => (
                                            <tr key={idx} className={getTableRowClass(idx)}>
                                                <td style={{
                                                    border: "1px solid #ddd",
                                                    textAlign: "center",
                                                    padding: "8px",
                                                    width: "40px",
                                                    minWidth: "40px",
                                                    maxWidth: "40px"
                                                }} className="border border-gray-300">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedRows.includes(row.orderid)}
                                                        onChange={() => toggleSelectRow(row.orderid)}
                                                        style={{ transform: "scale(1.3)", cursor: "pointer" }}
                                                    />
                                                </td>

                                                {columns.map((col) => (
                                                    <td
                                                        key={col.accessor}
                                                        style={{
                                                            border: "1px solid #ddd",
                                                            padding: "10px",
                                                            wordBreak: "break-word",
                                                            maxWidth: "200px",
                                                            overflowWrap: "break-word",
                                                            whiteSpace: "normal",
                                                            fontSize: "12px",
                                                            textAlign: "center",
                                                        }}
                                                        className="border border-gray-300" >
                                                        {
                                                            col.header === 'Order Id' ? (
                                                                <div>
                                                                    <Link to={`/user/orderDeatails/${row.orderid}`} className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-bold" > {row.orderid} </Link>
                                                                </div>
                                                            ) : col.header === 'Message' ? (
                                                                <div className="flex justify-center items-center relative">
                                                                    <div className="relative group">
                                                                        <div
                                                                            className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(34,211,238,0.5)] shadow-lg message-icon-container"
                                                                            onClick={(e) => openChatbox(`${row.orderid}`, e)}
                                                                        >
                                                                            <svg
                                                                                className="w-6 h-6 text-slate-200"
                                                                                fill="currentColor"
                                                                                viewBox="0 0 24 24"
                                                                            >
                                                                                <path d="M4 4h16v11H8l-4 4V4z" />
                                                                            </svg>
                                                                        </div>
                                                                        <span className="absolute -top-2 -right-2 bg-gradient-to-br from-green-500 to-green-600 text-white text-xs font-bold rounded-full min-w-[20px] h-[20px] flex items-center justify-center shadow-lg ring-2 ring-white/80">
                                                                            {row.totalMessages > 99 ? '99+' : row.totalMessages}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            ) : col.header === 'Status' ? (
                                                                <div className="flex justify-center items-center">
                                                                    {(() => {
                                                                        let statusColor = '';
                                                                        let textColor = 'text-white';

                                                                        switch (row.status?.toLowerCase()) {
                                                                            case 'completed':
                                                                                statusColor = 'bg-green-600';
                                                                                break;
                                                                            case 'pending':
                                                                                statusColor = 'bg-yellow-500';
                                                                                textColor = 'text-black';
                                                                                break;
                                                                            case 'new':
                                                                                statusColor = 'bg-blue-500';
                                                                                break;
                                                                            case 'cancelled':
                                                                                statusColor = 'bg-red-600';
                                                                                break;
                                                                            case 'qc':
                                                                                statusColor = 'bg-purple-600';
                                                                                break;
                                                                            case 'redesign':
                                                                                statusColor = 'bg-orange-500'
                                                                                break;
                                                                            default:
                                                                                statusColor = 'bg-gray-400';
                                                                                break;
                                                                        }

                                                                        return (
                                                                            <span
                                                                                className={`px-3 py-1 text-xs font-bold rounded-full shadow-md ${statusColor} ${textColor}`}
                                                                            >
                                                                                {row.status ? row.status : 'Unknown'}
                                                                            </span>
                                                                        );
                                                                    })()}
                                                                </div>
                                                            ) : (
                                                                <div style={{
                                                                    wordBreak: "break-word",
                                                                    whiteSpace: "normal",
                                                                    overflowWrap: "break-word"
                                                                }}>
                                                                    {row[col.accessor] ?? "-"}
                                                                </div>
                                                            )
                                                        }
                                                    </td>
                                                ))}
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={columns.length}
                                                className={`pl-50 p-5 text-center`}
                                            >
                                                <FontAwesomeIcon icon={faFolderOpen} size="lg" className="me-2 text-blue-500" />
                                                {dateFrom || dateTo ? "No records found for the selected date range." : "No records found."}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                            {paginatedData.length > 0 && (
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "15px" }}>
                                    <label className={theme === "dark" ? "text-white" : "text-gray-800"}>
                                        Rows per page:{" "}
                                        <select
                                            value={rowsPerPage}
                                            onChange={handleRowsPerPageChange}
                                            className={`p-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-400 ${getSelectClass}`}
                                        >
                                            {rowsPerPageOptions.map((option) => (
                                                <option key={option} value={option}>
                                                    {option}
                                                </option>
                                            ))}
                                        </select>

                                        <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600 pl-4 '}>
                                            Showing {paginatedData.length} of {filteredData.length} entries
                                            {(dateFrom || dateTo) && " (filtered by date)"}
                                        </span>
                                    </label>

                                    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                        <button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            style={currentPage === 1 ? getDisabledButtonStyle() : getPaginationButtonStyle()}
                                        >
                                            Prev
                                        </button>

                                        {getPageNumbers(totalPages, currentPage).map((page, i) => (
                                            <button
                                                key={i}
                                                style={
                                                    typeof page === "number" && currentPage === page
                                                        ? getPaginationButtonStyle(true)
                                                        : getPaginationButtonStyle()
                                                }
                                                onClick={() => typeof page === "number" && handlePageChange(page)}
                                                disabled={page === "..."}
                                            >
                                                {page}
                                            </button>
                                        ))}

                                        <button
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            style={currentPage === totalPages ? getDisabledButtonStyle() : getPaginationButtonStyle()}
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </section>
            )}
        </>
    );
}