import { useState, useMemo, useEffect, useContext, useRef, useCallback } from "react";
import Loder from "../../Components/Loder";
import Chatbox from "../../Components/Chatbox";
import { ThemeContext } from "../../Context/ThemeContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import { fetchWithAuth } from '../../utils/userapi';
import {
    faRepeat,
    faFolderOpen,
    faArrowsRotate,
    faSearch,
    faSort,
    faSortUp,
    faSortDown,
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
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`rounded-xl shadow-2xl w-full max-w-md ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
                {/* Header */}
                <div className={`flex justify-between items-center p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                    <h2 className="text-lg font-bold">
                        Send for Redesign
                    </h2>
                    <button
                        onClick={handleClosePopup}
                        disabled={isSubmitting}
                        className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-4">
                    <div className="mb-4">
                        <p className="mb-2">
                            Order{pendingRedesignOrders.length > 1 ? 's' : ''} to send for redesign:
                        </p>
                        <div className="flex flex-wrap gap-1">
                            {pendingRedesignOrders.map((id) => (
                                <span 
                                    key={id} 
                                    className={`px-2 py-1 rounded text-xs ${theme === 'dark' ? 'bg-gray-700' : 'bg-blue-100'}`}
                                >
                                    Order #{id}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block mb-1">
                            Message for Design Team <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            ref={textareaRef}
                            value={redesignMessage}
                            onChange={(e) => setRedesignMessage(e.target.value)}
                            placeholder="Enter reason for redesign or instructions..."
                            className={`w-full p-3 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500'}`}
                            rows="4"
                            disabled={isSubmitting}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className={`p-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex justify-end gap-2`}>
                    <button
                        onClick={handleClosePopup}
                        disabled={isSubmitting}
                        className={`px-4 py-2 rounded font-medium ${theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleRedesignSubmit}
                        disabled={isSubmitting || !redesignMessage.trim()}
                        className={`px-4 py-2 rounded font-medium flex items-center gap-2 ${isSubmitting || !redesignMessage.trim()
                            ? theme === 'dark' ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700'
                            }`}
                    >
                        {isSubmitting ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Processing...
                            </>
                        ) : (
                            <>
                                <FontAwesomeIcon icon={faRepeat} />
                                Send{pendingRedesignOrders.length > 1 ? ` (${pendingRedesignOrders.length})` : ''}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function Datatable({
    columns = [],
    data = [],
    rowsPerPageOptions = [50, 100, 200, 500],
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
    const [fileType, setFileType] = useState("stl"); // Changed default to "stl"

    // ✅ NEW STATES for redesign popup
    const [showRedesignPopup, setShowRedesignPopup] = useState(false);
    const [redesignMessage, setRedesignMessage] = useState("");
    const [pendingRedesignOrders, setPendingRedesignOrders] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    // ✅ Spinner control: hide loader once data is ready
    useEffect(() => {
        if (data && data.length > 0) {
            setStatus("hide");
        }

        setTimeout(() => {
            setStatus('hide');
        }, 1000)

    }, [data]);

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

    // ✅ Updated sendRedesign function
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

    const handleBulkDownload = () => {
        if (!selectedRows.length) {
            alert("Please select at least one record to proceed with the download.");
            return;
        }

        let missingFiles = [];
        let downloadedCount = 0;

        selectedRows.forEach((id) => {
            const row = data.find((r) => r.orderid === id);
            if (!row) return;

            let path = null;

            if (fileType === "initial") path = row.file_path;
            else if (fileType === "stl") path = row.stl_file_path;
            else if (fileType === "finish") path = row.finish_file_path;

            if (path && path.trim() !== "") {
                try {
                    const encodedPath = encodeURIComponent(path);

                    // Backend handles download safely
                    const finalUrl = `${base_url}/download?path=` + encodedPath;

                    const link = document.createElement("a");
                    link.href = finalUrl;
                    link.target = "_blank";
                    link.download = `${fileType}_${id}`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);

                    downloadedCount++;
                } catch (err) {
                    console.error("Download error:", err);
                    missingFiles.push(id);
                }
            } else {
                missingFiles.push(id);
            }
        });

        if (missingFiles.length > 0) {
            alert(
                `File Not found`
            );
        }
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
                            <div
                                style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}
                            >
                                <div className="flex justify-around items-center gap-4">
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
                                    </label>

                                    {/* Bulk Actions Toolbar - Moved to top */}
                                    <div className={`flex items-center gap-3 px-4 py-2`}>
                                        {/* ✅ FUNCTIONALITY IMPROVEMENT: Updated file type options */}
                                        <select
                                            value={fileType}
                                            onChange={(e) => setFileType(e.target.value)}
                                            className={`px-3 py-2 rounded-lg border text-sm focus:outline-none transition-all ${getSelectClass()}`}
                                        >
                                            {/* <option value="initial">Initial Files</option> */}
                                            <option value="stl">STL Files</option>
                                            <option value="finish">Finished Files</option>
                                        </select>

                                        <button
                                            onClick={handleBulkDownload}
                                            className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg shadow-lg flex items-center gap-2 transition-all duration-200 font-medium text-sm cursor-pointer"
                                        >
                                            <FontAwesomeIcon icon={faDownload} /> Download All
                                        </button>

                                        <button
                                            onClick={openRedesignPopup}
                                            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg shadow-lg flex items-center gap-2 transition-all duration-200 font-medium text-sm cursor-pointer"
                                        >
                                            <FontAwesomeIcon icon={faRepeat} /> Send for Redesign
                                        </button>
                                    </div>

                                </div>

                                {/* Search bar */}
                                <div>
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={search}
                                        onChange={handleSearch}
                                        className={`p-2 w-64 rounded border text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${getInputClass()}`}
                                    />
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
                                                                        <img
                                                                            src="/img/messages.png"
                                                                            alt="Message"
                                                                            className="w-9 h-9 cursor-pointer transition-all duration-200 group-hover:scale-110 group-hover:rotate-12"
                                                                            onClick={() => openPopup(`${row.orderid}`)}
                                                                        />
                                                                        <span className=" absolute -top-2 -right-2  bg-gradient-to-br from-red-500 via-red-600 to-red-700  text-white text-[12px] font-semibold  rounded-full min-w-[18px] h-[18px]  flex items-center justify-center  shadow-[0_0_8px_rgba(255,0,0,0.6)]ring-2 ring-white/60 backdrop-blur-sm">
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
                                                                row[col.accessor] ?? "-"
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
                                    <div className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                                        Showing {paginatedData.length} of {filteredData.length} entries
                                    </div>

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