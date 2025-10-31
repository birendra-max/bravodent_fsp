import { useState, useMemo, useEffect, useContext } from "react";
import Loder from "../../Components/Loder";
import Chatbox from "../../Components/Chatbox";
import { ThemeContext } from "../../Context/ThemeContext";
import { exportToExcel } from '../../helper/ExcelGenerate';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";

export default function Datatable({
    columns = [],
    data = [],
    rowsPerPageOptions = [10, 25, 50],
}) {
    const { theme, setTheme } = useContext(ThemeContext);
    const [status, setStatus] = useState("show");
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(
        rowsPerPageOptions.length > 0 ? rowsPerPageOptions[0] : 5
    );
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
    const [orderid, setOrderid] = useState(null);

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
        }, 3000)

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

    const downloadFile = (filename, path) => {
        const link = document.createElement('a');
        link.href = path;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link)
    }

    return (
        <>
            <Loder status={status} />
            <Chatbox orderid={orderid} />
            {/* Table is only shown after loader is hidden */}
            {status === "hide" && (
                <div
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

                                    <button
                                        onClick={() => exportToExcel(data, "Reports")}
                                        className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-800 text-white text-sm font-medium rounded-md border border-green-600 transition-all duration-200 shadow-sm hover:shadow-md">
                                        <FontAwesomeIcon icon={faDownload} className="text-white text-base" />
                                        Download Report
                                    </button>

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
                                                    >
                                                        {
                                                            col.header === 'Message' ? (
                                                                <div className="w-full flex justify-center items-center">
                                                                    <img
                                                                        src="/img/messages.png"
                                                                        alt="Message"
                                                                        className="w-8 h-8 cursor-pointer"
                                                                        onClick={() => openPopup(`${row.orderid}`)}
                                                                    />
                                                                </div>
                                                            ) : col.header === 'Download' ? (
                                                                <div className="flex justify-center items-center gap-2">
                                                                    {/* Initial File */}
                                                                    {
                                                                        row.file_path && row.file_path != '' ? (<button
                                                                            onClick={() => downloadFile('initial', row.file_path)}
                                                                            className="bg-blue-500 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs"
                                                                        >
                                                                            Initial
                                                                        </button>) : ''
                                                                    }

                                                                    {/* Finish File */}
                                                                    {
                                                                        row.finish_file_path && row.finish_file_path != '' ? (<button
                                                                            onClick={() => downloadFile('finish', row.finish_file_path)}
                                                                            className="bg-green-500 hover:bg-green-700 text-white px-2 py-1 rounded text-xs"
                                                                        >
                                                                            Finish
                                                                        </button>) : ""
                                                                    }

                                                                    {/* STL File */}
                                                                    {
                                                                        row.finish_file_path && row.finish_file_path != '' ? (<button
                                                                            onClick={() => downloadFile('stl', row.stl_file_path)}
                                                                            className="bg-orange-500 hover:bg-orange-700 text-white px-2 py-1 rounded text-xs"
                                                                        >
                                                                            STL
                                                                        </button>) : ''
                                                                    }

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
                                                className={`p-5 text-center ${getNoDataClass()}`}
                                            >
                                                📭 No records found.
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
                </div>
            )}
        </>
    );
}