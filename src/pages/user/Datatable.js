import React, { useEffect, useRef, useState } from "react";
import $ from "jquery";
import "datatables.net-dt/css/dataTables.dataTables.css";
import "datatables.net-dt";

export default function Datatable() {
    const tableRef = useRef(null);
    const [data, setData] = useState([]);
    const [isInitialized, setIsInitialized] = useState(false);

    // Mock data - replace with your API call
    useEffect(() => {
        const mockData = [
            {
                orderId: "ORD-001",
                patientName: "John Doe",
                tat: 5,
                status: "In Progress",
                units: 3,
                toothNumber: "15,16",
                labName: "Premium Dental Lab",
                date: "2024-01-15",
                message: "Rush case"
            },
            // Add more mock data...
        ];
        setData(mockData);
    }, []);

    useEffect(() => {
        if (data.length === 0 || isInitialized) return;

        const table = $(tableRef.current).DataTable({
            data: data,
            columns: [
                { data: "orderId" },
                { data: "patientName" },
                { data: "tat" },
                { 
                    data: "status",
                    render: function(data, type, row) {
                        const statusColors = {
                            "New": "bg-blue-100 text-blue-800",
                            "In Progress": "bg-yellow-100 text-yellow-800",
                            "Completed": "bg-green-100 text-green-800",
                            "Cancel": "bg-red-100 text-red-800"
                        };
                        return `<span class="px-2 py-1 rounded-full text-xs font-medium ${statusColors[data] || 'bg-gray-100'}">${data}</span>`;
                    }
                },
                { data: "units" },
                { data: "toothNumber" },
                { data: "labName" },
                { data: "date" },
                { data: "message" }
            ],
            paging: true,
            searching: true,
            ordering: true,
            responsive: true,
            pageLength: 10,
            lengthMenu: [5, 10, 25, 50],
            destroy: true, // Important: allow reinitialization
            dom: '<"flex flex-col md:flex-row md:items-center md:justify-between p-4 border-b"<"mb-4 md:mb-0"l><"flex items-center space-x-2"f>>rt<"flex flex-col md:flex-row md:items-center md:justify-between p-4"<"mb-4 md:mb-0"i><"pagination"p>>',
            language: {
                search: "",
                searchPlaceholder: "🔍 Search cases...",
                lengthMenu: "Show _MENU_ entries",
                info: "Showing _START_ to _END_ of _TOTAL_ cases",
                infoEmpty: "No cases available",
                infoFiltered: "(filtered from _MAX_ total cases)",
                zeroRecords: "No matching cases found",
                paginate: {
                    next: "Next →",
                    previous: "← Prev",
                    first: "First",
                    last: "Last"
                }
            },
            initComplete: function() {
                $('.dataTables_filter input').addClass('px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent');
                $('.dataTables_length select').addClass('px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent');
                setIsInitialized(true);
            }
        });

        return () => {
            if (table) {
                table.destroy(true);
            }
        };
    }, [data, isInitialized]);

    // If no data, show loading
    if (data.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
                    <div className="h-32 bg-gray-100 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-700 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2">Case Management</h2>
                        <p className="text-blue-100">Manage and track all your dental cases</p>
                    </div>
                    <div className="flex items-center space-x-3 mt-4 sm:mt-0">
                        <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm text-white">
                            📊 {data.length} Cases
                        </span>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="p-1">
                <table ref={tableRef} className="min-w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Order ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Patient Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">TAT (Days)</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Units</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Tooth #</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Lab</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Message</th>
                        </tr>
                    </thead>
                </table>
            </div>
        </div>
    );
}