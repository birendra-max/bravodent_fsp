import React, { useState, useMemo, useEffect } from "react";
import Loder from "../../Components/Loder";

export default function Datatable({
    columns = [],
    data = [],
    rowsPerPageOptions = [10, 25, 50],
}) {
    const [status, setStatus] = useState("show");
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(
        rowsPerPageOptions.length > 0 ? rowsPerPageOptions[0] : 5
    );
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

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

        setTimeout(()=>{
            setStatus('hide');
        },3000)

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

    return (
        <>
            <Loder status={status} />

            {/* Table is only shown after loader is hidden */}
            {status === "hide" && (
                <div
                    style={{ padding: "20px"}}
                    className="bg-gray-200 rounded-xl shadow-xl mt-4"
                >
                    {(!Array.isArray(columns) || columns.length === 0) && (
                        <div style={{ padding: "20px", textAlign: "center", background: "#f8f9fa", borderRadius: "8px" }}>
                            ⚠️ No columns provided.
                        </div>
                    )}

                    {Array.isArray(columns) && columns.length > 0 && (
                        <>
                            {/* Search + Rows per page */}
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                                <div>
                                    <label>
                                        Rows per page:{" "}
                                        <select
                                            value={rowsPerPage}
                                            onChange={handleRowsPerPageChange}
                                            style={{ padding: "8px", borderRadius: "5px", border: "1px solid #ccc" }}
                                        >
                                            {rowsPerPageOptions.map((option) => (
                                                <option key={option} value={option}>
                                                    {option}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                </div>

                                <div>
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={search}
                                        onChange={handleSearch}
                                        style={{ padding: "10px", width: "250px", borderRadius: "5px", border: "1px solid #ccc" }}
                                    />
                                </div>
                            </div>

                            {/* Table */}
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                    <tr style={{ background: "#007bff", color: "#fff" }}>
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
                                            <tr key={idx} style={{ background: idx % 2 === 0 ? "#f9f9f9" : "#fff" }}>
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
                                                        {row[col.accessor] ?? "-"}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={columns.length} style={{ textAlign: "center", padding: "20px" }}>
                                                📭 No records found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                            {/* Pagination */}
                            {paginatedData.length > 0 && (
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "15px" }}>
                                    <div style={{ fontSize: "14px" }}>
                                        Showing {paginatedData.length} of {filteredData.length} entries
                                    </div>

                                    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} style={paginationButtonStyle}>
                                            Prev
                                        </button>

                                        {getPageNumbers(totalPages, currentPage).map((page, i) => (
                                            <button
                                                key={i}
                                                style={{
                                                    ...paginationButtonStyle,
                                                    background: currentPage === page ? "#007bff" : "#fff",
                                                    color: currentPage === page ? "#fff" : "#000",
                                                }}
                                                onClick={() => typeof page === "number" && handlePageChange(page)}
                                                disabled={page === "..."}
                                            >
                                                {page}
                                            </button>
                                        ))}

                                        <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} style={paginationButtonStyle}>
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

const paginationButtonStyle = {
    padding: "8px 12px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    cursor: "pointer",
    background: "#fff",
    color: "#000",
    fontWeight: "bold",
};
