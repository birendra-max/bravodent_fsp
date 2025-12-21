import { useContext, useState, useEffect } from "react";
import Hd from "./Hd";
import Foot from './Foot';
import { ThemeContext } from "../../Context/ThemeContext";
import CasesDatatable from "./CasesDatatable";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faUserGear,
    faPaperPlane,
    faListCheck,
    faCheckDouble
} from "@fortawesome/free-solid-svg-icons";
import { fetchWithAuth } from "../../utils/adminapi";
import Sidebar from "./Sidebar";

export default function AssignOrders() {
    const { theme } = useContext(ThemeContext);
    const [selectedFilter, setSelectedFilter] = useState('1');
    const [orderId, setOrderId] = useState('');
    const [selectedDesigner, setSelectedDesigner] = useState('');
    const [designers, setDesigners] = useState([]);
    const [allData, setAllData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [selectedOrders, setSelectedOrders] = useState([]); // For bulk selection
    const [selectAll, setSelectAll] = useState(false); // For select all checkbox
    const [loading, setLoading] = useState(false);
    const [assigning, setAssigning] = useState(false);
    const [bulkAssigning, setBulkAssigning] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [mode, setMode] = useState('single'); // 'single' or 'bulk'

    const themeClasses = {
        main: theme === "dark" ? "bg-gray-950 text-gray-100" : "bg-gray-100 text-gray-900",
        card: theme === "dark" ? "bg-gray-900 border border-gray-700" : "bg-white border border-gray-200",
        input:
            theme === "dark"
                ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500"
                : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-600",
        select:
            theme === "dark"
                ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500"
                : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-600",
        button: {
            assign:
                theme === "dark"
                    ? "bg-purple-700 hover:bg-purple-600 text-white"
                    : "bg-purple-600 hover:bg-purple-700 text-white",
            bulkAssign:
                theme === "dark"
                    ? "bg-green-700 hover:bg-green-600 text-white"
                    : "bg-green-600 hover:bg-green-700 text-white",
            filterActive:
                theme === "dark"
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-blue-600 text-white shadow-md",
            filterInactive:
                theme === "dark"
                    ? "bg-gray-800 text-gray-200 border border-gray-700 hover:bg-gray-700"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100",
            modeActive:
                theme === "dark"
                    ? "bg-indigo-700 text-white"
                    : "bg-indigo-600 text-white",
            modeInactive:
                theme === "dark"
                    ? "bg-gray-800 text-gray-300 border border-gray-700"
                    : "bg-gray-200 text-gray-700 border border-gray-300",
        },
    };

    const filterButtons = [
        { value: "1", label: "All" },
        { value: "5", label: "New" },
        { value: "6", label: "In Progress" },
        { value: "7", label: "QC Required" },
        { value: "8", label: "On Hold" },
        { value: "9", label: "Designed Completed" },
        { value: "10", label: "Canceled" },
        { value: "11", label: "Redesign" },
    ];

    // Order ID input validation
    const handleOrderIdChange = (e) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        setOrderId(value);
    };

    // Handle order selection for bulk mode
    const handleOrderSelect = (orderId) => {
        if (selectedOrders.includes(orderId)) {
            setSelectedOrders(selectedOrders.filter(id => id !== orderId));
        } else {
            setSelectedOrders([...selectedOrders, orderId]);
        }
    };

    // Handle select all orders
    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedOrders([]);
        } else {
            const allOrderIds = filteredData.map(item => item.orderid).filter(id => id);
            setSelectedOrders(allOrderIds);
        }
        setSelectAll(!selectAll);
    };

    // Fetch all designers
    const fetchDesigners = async () => {
        try {
            console.log("Fetching designers...");
            const responseData = await fetchWithAuth("/get-designers", {
                method: "GET",
            });

            console.log("Designers API response:", responseData);

            if (responseData?.status === "success") {
                const designersData = responseData.designers || responseData.data || [];
                console.log("Designers data loaded:", designersData);
                setDesigners(designersData);
            } else {
                console.log("No designers data found in response");
                setDesigners([]);
            }
        } catch (error) {
            console.error("Error fetching designers:", error);
            setDesigners([]);
        }
    };

    // Apply filters
    const applyFilters = () => {
        if (!allData.length) {
            setFilteredData([]);
            setSelectedOrders([]);
            setSelectAll(false);
            return;
        }

        let filtered = [...allData];

        // Apply status filter
        if (selectedFilter !== '1') {
            const statusMap = {
                '5': 'New',
                '6': 'Pending',
                '7': 'Qc',
                '8': 'Hold',
                '9': 'Completed',
                '10': 'Cancelled',
                '11': 'Redesign'
            };
            const targetStatus = statusMap[selectedFilter];

            if (targetStatus) {
                filtered = filtered.filter(item => {
                    const itemStatus = item.status?.toLowerCase();
                    const targetStatusLower = targetStatus.toLowerCase();
                    return itemStatus === targetStatusLower;
                });
            }
        }

        // Apply order ID filter if entered (single mode only)
        if (orderId && mode === 'single') {
            const searchId = parseInt(orderId);
            if (!isNaN(searchId)) {
                filtered = filtered.filter(item => {
                    const itemId = parseInt(item.orderid);
                    return !isNaN(itemId) && itemId === searchId;
                });
            }
        }

        setFilteredData(filtered);

        // Reset selection when filters change
        setSelectedOrders([]);
        setSelectAll(false);
    };

    // Filter button handler
    const handleFilterClick = (filterValue) => {
        setSelectedFilter(filterValue);
    };

    // Toggle between single and bulk mode
    const handleModeChange = (newMode) => {
        setMode(newMode);
        setSelectedOrders([]);
        setSelectAll(false);
        setOrderId('');
        setError(null);
        setSuccessMessage('');
    };

    // Assign single order to designer
    const handleAssignOrder = async () => {
        if (!orderId) {
            setError("Please enter an Order ID");
            setTimeout(() => setError(''), 3000);
            return;
        }

        if (!selectedDesigner) {
            setError("Please select a designer");
            setTimeout(() => setError(''), 3000);
            return;
        }

        try {
            setAssigning(true);
            setError(null);
            setSuccessMessage('');

            const responseData = await fetchWithAuth("/assign-order-to-designer", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    order_id: orderId,
                    designer_id: selectedDesigner,
                }),
            });

            if (responseData?.status === "success") {
                const designerName = designers.find(d =>
                    (d.id || d.designer_id) == selectedDesigner
                )?.name || designers.find(d =>
                    (d.id || d.designer_id) == selectedDesigner
                )?.designer_name || 'Designer';

                setSuccessMessage(`Order #${orderId} successfully assigned to ${designerName}!`);

                // Clear the form
                setOrderId('');
                setSelectedDesigner('');

                // Refresh the cases data
                await fetchAllCases();

                // Clear success message after 5 seconds
                setTimeout(() => setSuccessMessage(''), 5000);
            } else {
                setError(responseData?.message || "Failed to assign order. Please try again.");
                setTimeout(() => setError(''), 5000);
            }
        } catch (error) {
            console.error("Error assigning order:", error);
            setError("Network error. Please check your connection.");
            setTimeout(() => setError(''), 5000);
        } finally {
            setAssigning(false);
        }
    };

    // Bulk assign multiple orders
    const handleBulkAssignOrders = async () => {
        if (selectedOrders.length === 0) {
            setError("Please select at least one order");
            setTimeout(() => setError(''), 3000);
            return;
        }

        if (!selectedDesigner) {
            setError("Please select a designer");
            setTimeout(() => setError(''), 3000);
            return;
        }

        try {
            setBulkAssigning(true);
            setError(null);
            setSuccessMessage('');

            const responseData = await fetchWithAuth("/bulk-assign-orders-to-designer", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    order_ids: selectedOrders,
                    designer_id: selectedDesigner,
                }),
            });

            if (responseData?.status === "success") {
                const designerName = designers.find(d =>
                    (d.id || d.designer_id) == selectedDesigner
                )?.name || designers.find(d =>
                    (d.id || d.designer_id) == selectedDesigner
                )?.designer_name || 'Designer';

                setSuccessMessage(`✅ Successfully assigned ${selectedOrders.length} order(s) to ${designerName}!`);

                // Clear selection
                setSelectedOrders([]);
                setSelectAll(false);
                setSelectedDesigner('');

                // Refresh the cases data
                await fetchAllCases();

                // Clear success message after 5 seconds
                setTimeout(() => setSuccessMessage(''), 5000);
            } else {
                setError(responseData?.message || "Failed to assign orders. Please try again.");
                setTimeout(() => setError(''), 5000);
            }
        } catch (error) {
            console.error("Error bulk assigning orders:", error);
            setError("Network error. Please check your connection.");
            setTimeout(() => setError(''), 5000);
        } finally {
            setBulkAssigning(false);
        }
    };

    // Clear all filters
    const handleClearFilters = () => {
        setSelectedFilter('1');
        setOrderId('');
        setSelectedDesigner('');
        setSelectedOrders([]);
        setSelectAll(false);
        setFilteredData(allData);
        setError(null);
        setSuccessMessage('');
    };

    // Fetch all cases
    const fetchAllCases = async () => {
        try {
            setLoading(true);
            setError(null);
            const responseData = await fetchWithAuth("/get-all-cases", {
                method: "GET",
            });

            if (responseData?.status === "success") {
                const casesData = responseData.new_cases || responseData.cases || responseData.all_cases || [];
                setAllData(casesData);
                setFilteredData(casesData);
            } else {
                setAllData([]);
                setFilteredData([]);
            }
        } catch (error) {
            console.error("Error fetching cases:", error);
            setAllData([]);
            setFilteredData([]);
            setError("Network error. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    // Fetch all cases and designers on component mount
    useEffect(() => {
        fetchAllCases();
        fetchDesigners();
    }, []);

    // Apply filters whenever any filter criteria changes
    useEffect(() => {
        applyFilters();
    }, [selectedFilter, orderId, mode]);

    // Update selectAll when selectedOrders changes
    useEffect(() => {
        if (filteredData.length > 0 && selectedOrders.length === filteredData.length) {
            setSelectAll(true);
        } else {
            setSelectAll(false);
        }
    }, [selectedOrders, filteredData]);

    // Define columns (simple version without checkboxes in table)
    const columns = [
        { header: "Order Id", accessor: "orderid" },
        { header: "File Name", accessor: "fname" },
        { header: "TAT", accessor: "tduration" },
        { header: "Status", accessor: "status" },
        { header: "Unit", accessor: "unit" },
        { header: "Tooth", accessor: "tooth" },
        { header: "Lab Name", accessor: "labname" },
        { header: "Run Self By", accessor: "run_self_by" },
        { header: "Date", accessor: "order_date" },
        { header: "Assigned To", accessor: "assigned_to" },
    ];

    return (
        <>
            <Hd />

            <main className={`min-h-screen flex transition-all duration-300 ${themeClasses.main}`}>
                {/* Sidebar */}
                <div className="fixed top-0 left-0 h-full w-64 z-20">
                    <Sidebar />
                </div>

                {/* Main Content */}
                <div className="flex-1 ml-64 p-4 mt-16 space-y-8">
                    {/* Assign Order Card */}
                    <div className={`rounded-2xl p-6 shadow-lg ${themeClasses.card}`}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <FontAwesomeIcon icon={faUserGear} className="text-blue-500" />
                                Assign Task to Designer
                            </h2>
                            <div className="flex items-center gap-3">
                                {/* Mode Toggle Buttons */}
                                <div className="flex rounded-lg overflow-hidden">
                                    <button
                                        onClick={() => handleModeChange('single')}
                                        className={`px-4 py-2 text-sm font-medium transition-all ${mode === 'single' ? themeClasses.button.modeActive : themeClasses.button.modeInactive}`}
                                    >
                                        <FontAwesomeIcon icon={faPaperPlane} className="mr-2" />
                                        Single
                                    </button>
                                    <button
                                        onClick={() => handleModeChange('bulk')}
                                        className={`px-4 py-2 text-sm font-medium transition-all ${mode === 'bulk' ? themeClasses.button.modeActive : themeClasses.button.modeInactive}`}
                                    >
                                        <FontAwesomeIcon icon={faListCheck} className="mr-2" />
                                        Bulk
                                    </button>
                                </div>
                                <button
                                    onClick={handleClearFilters}
                                    className={`px-4 py-2 text-sm rounded-lg ${themeClasses.button.filterInactive}`}
                                >
                                    Clear All
                                </button>
                            </div>
                        </div>

                        {/* Success Message */}
                        {successMessage && (
                            <div className="mb-4 p-3 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-lg">
                                {successMessage}
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className="mb-4 p-3 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-lg">
                                ⚠️ {error}
                            </div>
                        )}

                        {/* Assign Order Form */}
                        <div className="grid grid-cols-10 gap-4 items-center mb-6">
                            {/* Order ID (Single Mode Only) */}
                            {mode === 'single' && (
                                <div className="col-span-3">
                                    <label className="block text-sm font-medium mb-2">Order ID</label>
                                    <input
                                        type="text"
                                        value={orderId}
                                        onChange={handleOrderIdChange}
                                        placeholder="Enter Order ID (e.g., 1001)"
                                        className={`w-full px-4 py-3 rounded-lg border-2 focus:ring-2 focus:ring-purple-500 transition-all ${themeClasses.input}`}
                                    />
                                </div>
                            )}

                            {/* Selected Orders Count (Bulk Mode Only) */}
                            {mode === 'bulk' && (
                                <div className="col-span-3">
                                    <label className="block text-sm font-medium mb-2">Selected Orders</label>
                                    <div className={`w-full px-4 py-3 rounded-lg border-2 ${themeClasses.input}`}>
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">
                                                {selectedOrders.length} order(s) selected
                                            </span>
                                            {selectedOrders.length > 0 && (
                                                <button
                                                    onClick={() => setSelectedOrders([])}
                                                    className="text-sm text-red-500 hover:text-red-700"
                                                >
                                                    Clear
                                                </button>
                                            )}
                                        </div>
                                        {selectedOrders.length > 0 && (
                                            <div className="mt-2 text-xs text-gray-500 overflow-hidden text-ellipsis">
                                                IDs: {selectedOrders.slice(0, 5).join(', ')}
                                                {selectedOrders.length > 5 && ` +${selectedOrders.length - 5} more`}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Designer Dropdown */}
                            <div className={`${mode === 'single' ? 'col-span-4' : 'col-span-5'}`}>
                                <label className="block text-sm font-medium mb-2">Select Designer</label>
                                <select
                                    value={selectedDesigner}
                                    onChange={(e) => setSelectedDesigner(e.target.value)}
                                    className={`w-full px-4 py-3 rounded-lg border-2 focus:ring-2 focus:ring-purple-500 transition-all ${themeClasses.select}`}
                                    disabled={assigning || bulkAssigning}
                                >
                                    <option value="">-- Select a Designer --</option>
                                    {designers.map((designer, index) => (
                                        <option
                                            key={designer.id || designer.designer_id || index}
                                            value={designer.id || designer.designer_id}
                                        >
                                            {designer.name || designer.designer_name || `Designer ${designer.id}`}
                                            {designer.email ? ` (${designer.email})` : ''}
                                            {designer.specialization ? ` - ${designer.specialization}` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Assign Order Button */}
                            <div className={`${mode === 'single' ? 'col-span-3' : 'col-span-2'}`}>
                                <button
                                    onClick={mode === 'single' ? handleAssignOrder : handleBulkAssignOrders}
                                    disabled={
                                        (mode === 'single' ? assigning : bulkAssigning) ||
                                        (mode === 'single' ? !orderId || !selectedDesigner : selectedOrders.length === 0 || !selectedDesigner)
                                    }
                                    className={`w-full h-12 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${mode === 'single' ? themeClasses.button.assign : themeClasses.button.bulkAssign}`}
                                >
                                    {mode === 'single' ? (
                                        <>
                                            <FontAwesomeIcon icon={faPaperPlane} />
                                            {assigning ? 'Assigning...' : 'Assign Order'}
                                        </>
                                    ) : (
                                        <>
                                            <FontAwesomeIcon icon={faCheckDouble} />
                                            {bulkAssigning ? 'Assigning...' : 'Assign Selected'}
                                        </>
                                    )}
                                </button>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                                    {mode === 'single'
                                        ? 'Assign this order to designer'
                                        : `Assign ${selectedOrders.length} order(s)`}
                                </p>
                            </div>
                        </div>

                        {/* Bulk Mode: Order Selection Checkboxes */}
                        {mode === 'bulk' && (
                            <div className="mb-6 p-4 border rounded-lg border-gray-200 dark:border-gray-700">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={selectAll}
                                            onChange={handleSelectAll}
                                            className="h-4 w-4 rounded border-gray-300"
                                            id="selectAllCheckbox"
                                        />
                                        <label htmlFor="selectAllCheckbox" className="text-sm font-medium">
                                            Select All Orders ({filteredData.length} available)
                                        </label>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {selectedOrders.length} selected
                                    </div>
                                </div>

                                {/* Order Checkbox Grid */}
                                <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 max-h-48 overflow-y-auto p-2">
                                    {filteredData.map((order) => (
                                        <div key={order.orderid} className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={selectedOrders.includes(order.orderid)}
                                                onChange={() => handleOrderSelect(order.orderid)}
                                                className="h-4 w-4 rounded border-gray-300"
                                                id={`order-${order.orderid}`}
                                            />
                                            <label htmlFor={`order-${order.orderid}`} className="text-sm truncate">
                                                #{order.orderid}
                                            </label>
                                        </div>
                                    ))}
                                </div>

                                {filteredData.length === 0 && (
                                    <div className="text-center text-gray-500 py-4">
                                        No orders found. Try changing your filters.
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Status Filters */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            {filterButtons.map((btn) => (
                                <button
                                    key={btn.value}
                                    onClick={() => handleFilterClick(btn.value)}
                                    disabled={loading || assigning || bulkAssigning}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedFilter === btn.value
                                        ? `${themeClasses.button.filterActive}`
                                        : themeClasses.button.filterInactive
                                        } ${(loading || assigning || bulkAssigning) ? 'opacity-50' : ''}`}
                                >
                                    {btn.label}
                                </button>
                            ))}
                        </div>

                        {/* Filter Summary */}
                        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-4">
                                <span>📊 Showing {filteredData.length} of {allData.length} total orders</span>
                                {selectedFilter !== '1' && (
                                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded">
                                        Filter: {filterButtons.find(b => b.value === selectedFilter)?.label}
                                    </span>
                                )}
                                {mode === 'single' && orderId && (
                                    <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 rounded">
                                        Order ID: {orderId}
                                    </span>
                                )}
                                {mode === 'bulk' && selectedOrders.length > 0 && (
                                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900 rounded">
                                        Selected: {selectedOrders.length} orders
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Cases Datatable */}
                    <CasesDatatable
                        columns={columns}
                        data={filteredData}
                        rowsPerPage={50}
                        loading={loading || assigning || bulkAssigning}
                        error={error}
                    />
                </div>
            </main>
            <Foot />
        </>
    );
}