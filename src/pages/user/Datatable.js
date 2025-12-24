import { useState, useMemo, useEffect, useContext, useRef, useCallback } from "react";
import Loder from "../../Components/Loder";
import Chatbox from "../../Components/Chatbox";
import { ThemeContext } from "../../Context/ThemeContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { fetchWithAuth } from '../../utils/userapi';
import {
    faRepeat,
    faFolderOpen,
    faTimes
} from '@fortawesome/free-solid-svg-icons';

// ✅ Create a separate component for the popup
const RedesignPopup = ({
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

    // Auto-focus when popup opens
    useEffect(() => {
        if (showRedesignPopup && textareaRef.current) {
            const timer = setTimeout(() => {
                if (textareaRef.current) {
                    textareaRef.current.focus();
                }
            }, 10);
            return () => clearTimeout(timer);
        }
    }, [showRedesignPopup]);

    const handleClosePopup = useCallback(() => {
        if (!isSubmitting) {
            setShowRedesignPopup(false);
            setRedesignMessage("");
        }
    }, [isSubmitting, setShowRedesignPopup, setRedesignMessage]);

    if (!showRedesignPopup) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div
                className={`rounded-2xl shadow-2xl w-full max-w-lg ${theme === 'dark'
                    ? 'bg-gradient-to-br from-gray-900 to-gray-800 text-white border border-gray-700/50'
                    : 'bg-gradient-to-br from-white to-gray-50 text-gray-800 border border-gray-200/50'}`}
            >
                {/* Header with gradient */}
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

                {/* Body */}
                <div className="p-6">
                    {/* Selected Orders */}
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

                    {/* Message Input */}
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
                                value={redesignMessage}
                                onChange={(e) => setRedesignMessage(e.target.value)}
                                placeholder="Describe what needs to be changed or improved... ✍️"
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

                {/* Footer with gradient */}
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
                            disabled={isSubmitting || !redesignMessage.trim()}
                            className={`px-5 py-3 rounded-xl font-medium flex-1 flex items-center justify-center gap-2 ${isSubmitting || !redesignMessage.trim()
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

                    {/* Progress indicator (shown only when submitting) */}
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
    const [orderid, setOrderid] = useState(null);
    const [deliveryType, setDeliveryType] = useState("Rush");

    // ✅ NEW STATES for multi-select & dropdown
    const [selectedRows, setSelectedRows] = useState([]);
    const [fileType, setFileType] = useState("stl");

    // ✅ NEW STATES for redesign popup
    const [showRedesignPopup, setShowRedesignPopup] = useState(false);
    const [redesignMessage, setRedesignMessage] = useState("");
    const [pendingRedesignOrders, setPendingRedesignOrders] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ✅ Control loader based on parent's loading prop
    useEffect(() => {
        if (!loading) {
            setStatus("hide");
        } else {
            setStatus("show");
        }
    }, [loading]);

    // Filter & Sort
    const filteredData = useMemo(() => {
        let filtered = data || [];

        if (search) {
            filtered = filtered.filter((row) =>
                columns.some((col) =>
                    String(row[col.accessor] ?? "")
                        .toLowerCase()
                        .includes(search.toLowerCase())
                )
            );
        }

        if (sortConfig.key) {
            filtered = [...filtered].sort((a, b) => {
                const aVal = a[sortConfig.key];
                const bVal = b[sortConfig.key];

                if (aVal === null || aVal === undefined) return 1;
                if (bVal === null || bVal === undefined) return -1;

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
    }, [search, data, columns, sortConfig]);

    const totalPages = Math.max(1, Math.ceil(filteredData.length / rowsPerPage));

    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * rowsPerPage;
        return filteredData.slice(start, start + rowsPerPage);
    }, [currentPage, filteredData, rowsPerPage]);

    const handleSearch = (e) => {
        setSearch(e.target.value);
        setCurrentPage(1);
    };

    const handlePageChange = (page) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    };

    const handleSort = (key) => {
        let direction = "asc";
        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        } else if (sortConfig.key === key && sortConfig.direction === "desc") {
            setSortConfig({ key: null, direction: "asc" });
            return;
        }
        setSortConfig({ key, direction });
    };

    const handleRowsPerPageChange = (e) => {
        setRowsPerPage(parseInt(e.target.value));
        setCurrentPage(1);
    };

    const getPageNumbers = (totalPages, currentPage) => {
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
    };

    function openPopup(id) {
        setOrderid(id);
        document.getElementById('chatbox').style.display = "block"
    }

    const sendRedesign = async (orderId, message = "") => {
        try {
            const res = await fetchWithAuth(`send-for-redesign/${orderId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ message }),
            });

            // Backend returns JSON → res contains {status, message}
            return res;

        } catch (error) {
            return {
                status: "error",
                message: "Server error. Please try again later."
            };
        }
    };

    // ✅ Multi-select logic
    const toggleSelectRow = (id) =>
        setSelectedRows((prev) =>
            prev.includes(id)
                ? prev.filter((x) => x !== id)
                : [...prev, id]
        );

    const toggleSelectAll = () => {
        const visibleIds = paginatedData.map((r) => r.orderid);
        if (paginatedData.every((r) => selectedRows.includes(r.orderid))) {
            setSelectedRows(selectedRows.filter((id) => !visibleIds.includes(id)));
        } else {
            setSelectedRows([...new Set([...selectedRows, ...visibleIds])]);
        }
    };

    // ✅ Open redesign popup
    const openRedesignPopup = () => {
        if (!selectedRows.length) {
            alert("Please select at least one case to proceed with the redesign request.");
            return;
        }

        // Filter valid orders
        const validOrders = selectedRows.filter(id => {
            const row = data.find((x) => x.orderid === id);
            return row && row.status !== "New" && row.status !== "Redesign";
        });

        if (validOrders.length === 0) {
            alert("Orders with 'New' status or already in 'Redesign' cannot be sent for redesign.");
            return;
        }

        setPendingRedesignOrders(validOrders);
        setRedesignMessage("");
        setShowRedesignPopup(true);
    };

    // ✅ Submit redesign with message
    const handleRedesignSubmit = async () => {
        if (!redesignMessage.trim()) {
            alert("Please enter a message for the redesign request.");
            return;
        }

        setIsSubmitting(true);

        let redesignIds = [];
        let newOrderIds = [];
        let successIds = [];
        let failMessages = [];

        for (let id of pendingRedesignOrders) {
            const r = data.find((x) => x.orderid === id);

            if (!r) {
                failMessages.push(`Order ${id}: Record not found`);
                continue;
            }

            if (r.status === "New") {
                newOrderIds.push(id);
                continue;
            }

            if (r.status === "Redesign") {
                redesignIds.push(id);
                continue;
            }

            // 🚀 Call backend
            const res = await sendRedesign(id, redesignMessage);

            if (res.status === "success") {
                successIds.push(id);
            } else {
                failMessages.push(`Order ${id}: ${res.message}`);
            }
        }

        setIsSubmitting(false);
        setShowRedesignPopup(false);
        setRedesignMessage("");
        setSelectedRows([]);

        let finalMsg = "";

        if (newOrderIds.length === pendingRedesignOrders.length) {
            finalMsg = newOrderIds.length === 1
                ? `Order ${newOrderIds[0]} cannot be sent for redesign because it is a new order.`
                : `All selected orders cannot be sent for redesign because they are new orders.`;
            alert(finalMsg);
            return;
        }

        if (newOrderIds.length) {
            finalMsg += newOrderIds.map(id =>
                `Order ${id} cannot be sent for redesign because it is a new order.`
            ).join("\n") + "\n\n";
        }

        if (redesignIds.length === pendingRedesignOrders.length - newOrderIds.length) {
            finalMsg += redesignIds.length === 1
                ? `Order ${redesignIds[0]} is already in redesign process.`
                : `All selected orders are already in redesign process.`;
            alert(finalMsg);
            return;
        }

        if (redesignIds.length) {
            finalMsg += redesignIds.map(id =>
                `Order ${id} is already in redesign process.`
            ).join("\n") + "\n\n";
        }

        if (successIds.length) {
            finalMsg += successIds.length === 1
                ? `Order ${successIds[0]} has been forwarded to the design team for redesign.\n\n`
                : `All selected orders have been forwarded to the design team for redesign.\n\n`;
        }

        if (failMessages.length) {
            finalMsg += "Failed Requests:\n" + failMessages.join("\n");
        }

        alert(finalMsg.trim());
        window.location.reload();
    };


    const base_url = localStorage.getItem('base_url');

    const handleBulkDownload = async () => {
        if (!selectedRows.length) {
            alert("Please select at least one record to proceed with the download.");
            return;
        }

        let missingFiles = [];

        for (const id of selectedRows) {
            const row = data.find((r) => r.orderid === id);
            if (!row) continue;

            try {
                if (fileType === "stl") {
                    // Step 1: get all STL file paths from backend
                    const res = await fetch(`${base_url}/download-all?orderid=${id}`, {
                        headers: { 'X-Tenant': 'bravodent' }
                    });
                    const files = await res.json();

                    if (!Array.isArray(files) || files.length === 0) {
                        missingFiles.push(id);
                        continue;
                    }

                    // Step 2: download each STL file via backend
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

                        await new Promise(r => setTimeout(r, 500)); // optional delay
                    }

                } else if (fileType === "initial" || fileType === "finish") {
                    // Get the correct file path
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
                console.error("Download error:", err);
                missingFiles.push(id);
            }
        }

        if (missingFiles.length > 0) {
            alert(`Files not found for order IDs: ${missingFiles.join(", ")}`);
        }
    };


    // Theme-based styling functions
    const getBackgroundClass = () => {
        return theme === 'dark'
            ? 'bg-gray-900 text-white'
            : 'bg-gray-200 text-gray-800';
    };

    const getTableHeaderClass = () => {
        return theme === 'dark'
            ? 'bg-gray-700 text-white'
            : 'bg-blue-600 text-white';
    };

    const getTableRowClass = (idx) => {
        if (theme === 'dark') {
            return idx % 2 === 0 ? 'bg-gray-800 text-white' : 'bg-gray-700 text-white';
        } else {
            return idx % 2 === 0 ? 'bg-gray-100 text-gray-800' : 'bg-white text-gray-800';
        }
    };

    const getInputClass = () => {
        return theme === 'dark'
            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
            : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500';
    };

    const getSelectClass = () => {
        return theme === 'dark'
            ? 'bg-gray-700 border-gray-600 text-white'
            : 'bg-white border-gray-300 text-gray-800';
    };

    const getPaginationButtonStyle = (isActive = false) => {
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
    };

    const getDisabledButtonStyle = () => {
        return theme === 'dark'
            ? { ...getPaginationButtonStyle(), background: "#1f2937", color: "#6b7280", cursor: "not-allowed" }
            : { ...getPaginationButtonStyle(), background: "#f8f9fa", color: "#6c757d", cursor: "not-allowed" };
    };

    const getNoDataClass = () => {
        return theme === 'dark'
            ? 'bg-gray-800 text-gray-300'
            : 'bg-gray-100 text-gray-600';
    };

    return (
        <>
            <Loder status={status} />
            <Chatbox orderid={orderid} />

            {/* ✅ Use the separate popup component */}
            <RedesignPopup
                theme={theme}
                showRedesignPopup={showRedesignPopup}
                pendingRedesignOrders={pendingRedesignOrders}
                redesignMessage={redesignMessage}
                setRedesignMessage={setRedesignMessage}
                isSubmitting={isSubmitting}
                handleRedesignSubmit={handleRedesignSubmit}
                setShowRedesignPopup={setShowRedesignPopup}
            />

            {/* Table is only shown after loader is hidden */}
            {status === "hide" && (
                <section
                    style={{ padding: "20px" }}
                    className={`overflow-scroll md:overflow-hidden rounded-xl mt-4 ${getBackgroundClass()}`}
                >
                    {(!Array.isArray(columns) || columns.length === 0) && (
                        <div className={`p-5 text-center rounded-lg ${getNoDataClass()}`}>
                            ⚠️ No columns provided.
                        </div>
                    )}

                    {Array.isArray(columns) && columns.length > 0 && (
                        <>
                            {/* Search + Rows per page */}
                            <div className="mb-4">
                                <div className="flex flex-col lg:flex-row items-stretch gap-8">
                                    {/* Left panel - Clean minimal with colorful buttons */}
                                    <div className={`flex-1 rounded-lg border ${theme === 'light' ? 'bg-white border-gray-100' : 'bg-gray-900 border-gray-800'}`}>
                                        <div className="flex flex-col md:flex-row items-center p-4 gap-4">
                                            {/* File type selector - Clean */}
                                            <div className="flex-1 w-full">
                                                <div className="flex items-center gap-4">
                                                    <span className={`text-sm font-medium whitespace-nowrap ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                                                        File Type:
                                                    </span>
                                                    <div className="flex-1">
                                                        <select
                                                            value={fileType}
                                                            onChange={(e) => setFileType(e.target.value)}
                                                            className={`w-full px-3 py-2 text-sm border-b focus:outline-none ${theme === 'light'
                                                                ? 'bg-transparent text-black border-gray-300 focus:border-blue-500'
                                                                : 'bg-gray-800 text-white border-gray-600 focus:border-blue-500'}`}
                                                        >
                                                            <option value="stl">STL Files</option>
                                                            <option value="finish">Finished Files</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action buttons - Colorful but clean */}
                                            <div className="flex gap-3 w-full md:w-auto">
                                                <button
                                                    onClick={handleBulkDownload}
                                                    className={`group flex-1 md:flex-none px-5 py-2.5 rounded-lg flex items-center justify-center gap-2 font-medium text-sm transition-all duration-200 
              ${theme === 'light'
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
                                                    className={`group flex-1 md:flex-none px-5 py-2.5 rounded-lg flex items-center justify-center gap-2 font-medium text-sm transition-all duration-200 
              ${theme === 'light'
                                                            ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-sm hover:shadow-md'
                                                            : 'bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-700 hover:to-orange-800 text-white shadow-sm hover:shadow-md'}`}
                                                >
                                                    <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                    </svg>
                                                    Send for Redesign
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Search bar - Clean with colorful focus */}
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

                            {/* Table */}
                            <table id="datatable" style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                    <tr className={getTableHeaderClass()}>
                                        {/* ✅ Fixed checkbox column only */}
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
                                                {/* ✅ Fixed checkbox cell only */}
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
                                                            col.header === 'Message' ? (
                                                                <div className="flex justify-center items-center relative">
                                                                    <div className="relative group">
                                                                        <div
                                                                            className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(34,211,238,0.5)] shadow-lg"
                                                                            onClick={() => openPopup(`${row.orderid}`)}
                                                                        >
                                                                            {/* Professional chat icon */}
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
                                                No records found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                            {/* Pagination */}
                            {paginatedData.length > 0 && (
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "15px" }}>
                                    {/* Rows per page dropdown */}
                                    <label className={theme === "dark" ? "text-white" : "text-gray-800"}>
                                        Rows per page:{" "}
                                        <select
                                            value={rowsPerPage}
                                            onChange={handleRowsPerPageChange}
                                            className={`p-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-400 ${getSelectClass()}`}
                                        >
                                            {rowsPerPageOptions.map((option) => (
                                                <option key={option} value={option}>
                                                    {option}
                                                </option>
                                            ))}
                                        </select>

                                        <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600 pl-4 '}>
                                            Showing {paginatedData.length} of {filteredData.length} entries
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