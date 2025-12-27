import { useContext, useState, useEffect, useMemo } from "react";
import Hd from './Hd';
import Foot from './Foot';
import { ThemeContext } from "../../Context/ThemeContext";
import Datatable from './Datatable';
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faHome,
    faFileAlt,
    faDownload,
    faCalendarAlt,
    faFilter,
    faSearch,
    faChartBar,
    faSync,
    faHashtag
} from '@fortawesome/free-solid-svg-icons';
import { fetchWithAuth } from '../../utils/userapi';

export default function Reports() {
    const { theme } = useContext(ThemeContext);
    const [selectedFilter, setSelectedFilter] = useState('4'); // Default to 'All Time'
    const [isLoading, setIsLoading] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [orderIdFrom, setOrderIdFrom] = useState('');
    const [orderIdTo, setOrderIdTo] = useState('');
    const [allData, setAllData] = useState([]); // Store all data from backend
    const [filteredData, setFilteredData] = useState([]); // Store filtered data for display
    const [activeFilterType, setActiveFilterType] = useState('time'); // 'time' or 'custom'

    // Professional theme-based classes
    const getThemeClasses = () => {
        const isLight = theme === 'light';
        return {
            main: isLight
                ? 'bg-gradient-to-br from-gray-25 to-gray-50 text-gray-900'
                : 'bg-gradient-to-br from-gray-900 to-gray-950 text-white',
            card: isLight
                ? 'bg-gray-200'
                : 'bg-gray-800 border-gray-700 shadow-xl',
            input: isLight
                ? 'bg-white border-gray-300 focus:border-blue-500 text-gray-900 placeholder-gray-500 shadow-sm'
                : 'bg-gray-700 border-gray-600 focus:border-blue-400 text-white placeholder-gray-400 shadow-sm',
            button: {
                primary: isLight
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all cursor-pointer'
                    : 'bg-blue-700 hover:bg-blue-600 text-white shadow-md hover:shadow-lg transition-all cursor-pointer',
                success: isLight
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg'
                    : 'bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg',
                filterActive: isLight
                    ? 'bg-blue-600 text-white shadow-md border border-blue-600'
                    : 'bg-blue-700 text-white shadow-md border border-blue-600',
                filterInactive: isLight
                    ? 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 shadow-sm'
                    : 'bg-gray-700 text-gray-200 border border-gray-600 hover:bg-gray-600 hover:border-gray-500 shadow-sm',
                download: isLight
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg'
                    : 'bg-emerald-700 hover:bg-emerald-600 text-white shadow-md hover:shadow-lg'
            },
            text: {
                primary: isLight ? 'text-gray-900' : 'text-white',
                secondary: isLight ? 'text-gray-600' : 'text-gray-300',
                muted: isLight ? 'text-gray-500' : 'text-gray-400',
                accent: isLight ? 'text-blue-600' : 'text-blue-400'
            },
            border: isLight ? 'border-gray-200' : 'border-gray-700'
        };
    };

    const themeClasses = getThemeClasses();

    const columns = [
        { header: "Order ID", accessor: "orderid" },
        { header: "File Name", accessor: "fname" },
        { header: "TAT", accessor: "tduration" },
        { header: "Status", accessor: "status" },
        { header: "Unit", accessor: "unit" },
        { header: "Tooth", accessor: "tooth" },
        { header: "Lab Name", accessor: "labname" },
        { header: "Date", accessor: "order_date" },
        { header: "Message", accessor: "message" },
    ];

    const filterButtons = [
        { value: '1', label: 'Today', icon: faCalendarAlt },
        { value: '2', label: 'Weekly', icon: faChartBar },
        { value: '3', label: 'Monthly', icon: faFileAlt },
        { value: '4', label: 'All Time', icon: faFilter },
    ];

    // Universal date parser that works across all browsers
    const parseOrderDateOnly = (dateStr) => {
        if (!dateStr) return null;

        try {
            // Format: "14-Mar-2023 07:32:31am" or similar
            const [datePart] = dateStr.split(' ');

            // Split the date part
            const [day, monthStr, year] = datePart.split('-');

            // Month mapping
            const monthMap = {
                'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3,
                'May': 4, 'Jun': 5, 'Jul': 6, 'Aug': 7,
                'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
            };

            const monthIndex = monthMap[monthStr];
            if (monthIndex === undefined) {
                // Try parsing as ISO format or other formats
                const parsedDate = new Date(dateStr);
                if (isNaN(parsedDate.getTime())) {
                    return null;
                }
                // Reset time to midnight for date-only comparison
                parsedDate.setHours(0, 0, 0, 0);
                return parsedDate;
            }

            // Create date using UTC to avoid timezone issues
            const date = new Date(Date.UTC(parseInt(year), monthIndex, parseInt(day)));
            date.setHours(0, 0, 0, 0);

            return date;
        } catch (error) {
            console.error("Error parsing date:", dateStr, error);
            return null;
        }
    };

    // Helper function to get start of day (midnight) for a date
    const getStartOfDay = (date) => {
        const newDate = new Date(date);
        newDate.setHours(0, 0, 0, 0);
        return newDate;
    };

    // Apply TIME-BASED filters (Today/Weekly/Monthly/All Time)
    const applyTimeFilters = () => {
        if (!allData.length) {
            setFilteredData([]);
            return;
        }

        let filtered = [...allData];
        const today = getStartOfDay(new Date());

        // ===== Time period filter =====
        switch (selectedFilter) {
            case '1': { // Today
                filtered = filtered.filter(item => {
                    const itemDate = parseOrderDateOnly(item.order_date);
                    return itemDate && itemDate.getTime() === today.getTime();
                });
                break;
            }

            case '2': { // Last 7 Days
                const weekAgo = new Date(today);
                weekAgo.setDate(weekAgo.getDate() - 7);
                weekAgo.setHours(0, 0, 0, 0);

                filtered = filtered.filter(item => {
                    const itemDate = parseOrderDateOnly(item.order_date);
                    return itemDate && itemDate >= weekAgo;
                });
                break;
            }

            case '3': { // Last 30 Days
                const monthAgo = new Date(today);
                monthAgo.setDate(monthAgo.getDate() - 30);
                monthAgo.setHours(0, 0, 0, 0);

                filtered = filtered.filter(item => {
                    const itemDate = parseOrderDateOnly(item.order_date);
                    return itemDate && itemDate >= monthAgo;
                });
                break;
            }

            case '4': // All Time
            default:
                // No filtering needed for All Time
                break;
        }

        setFilteredData(filtered);
    };

    // Apply CUSTOM filters (Order ID range OR Date range)
    const applyCustomFilters = () => {
        if (!allData.length) {
            setFilteredData([]);
            return;
        }

        let filtered = [...allData];

        // ===== Order ID filter =====
        if (orderIdFrom) {
            const fromId = parseInt(orderIdFrom);
            filtered = filtered.filter(item => {
                const itemId = parseInt(item.orderid);
                return !isNaN(itemId) && itemId >= fromId;
            });
        }

        if (orderIdTo) {
            const toId = parseInt(orderIdTo);
            filtered = filtered.filter(item => {
                const itemId = parseInt(item.orderid);
                return !isNaN(itemId) && itemId <= toId;
            });
        }

        // ===== Custom Date Range (DATE ONLY) =====
        if (startDate) {
            const start = getStartOfDay(new Date(startDate));

            filtered = filtered.filter(item => {
                const itemDate = parseOrderDateOnly(item.order_date);
                return itemDate && itemDate >= start;
            });
        }

        if (endDate) {
            const end = getStartOfDay(new Date(endDate));

            filtered = filtered.filter(item => {
                const itemDate = parseOrderDateOnly(item.order_date);
                return itemDate && itemDate <= end;
            });
        }

        setFilteredData(filtered);
    };

    // Main apply filters function
    const applyFilters = () => {
        if (activeFilterType === 'time') {
            applyTimeFilters();
        } else if (activeFilterType === 'custom') {
            applyCustomFilters();
        }
    };

    // Handle search button click for custom filters
    const handleSearchClick = () => {
        setActiveFilterType('custom');
        applyCustomFilters();
    };

    // Handle filter button click for time filters
    const handleFilterClick = (filterValue) => {
        setSelectedFilter(filterValue);
        setActiveFilterType('time');
    };

    // Handle download report
    const handleDownloadReport = () => {
        if (filteredData.length > 0) {
            const fileName = `report_${new Date().toISOString().split('T')[0]}.csv`;

            // Simple CSV export
            const headers = columns.map(col => col.header).join(',');
            const csvData = filteredData.map(row =>
                columns.map(col => {
                    const value = row[col.accessor] || '';
                    // Escape quotes and wrap in quotes
                    return `"${String(value).replace(/"/g, '""')}"`;
                }).join(',')
            ).join('\n');

            const csvContent = `${headers}\n${csvData}`;
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } else {
            alert('No data to export');
        }
    };

    // Handle reset filters
    const handleResetFilters = () => {
        setStartDate('');
        setEndDate('');
        setOrderIdFrom('');
        setOrderIdTo('');
        setSelectedFilter('4');
        setActiveFilterType('time');
        // Reset filteredData to show all data
        setFilteredData(allData);
    };

    // Handle order ID input validation
    const handleOrderIdFromChange = (e) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        setOrderIdFrom(value);
    };

    const handleOrderIdToChange = (e) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        setOrderIdTo(value);
    };

    const getHeaderClass = () => {
        return theme === 'light'
            ? 'bg-gray-200 text-gray-800'
            : 'bg-gray-800 text-white';
    };

    // Apply filters whenever selectedFilter changes (for time filters)
    useEffect(() => {
        if (activeFilterType === 'time') {
            applyTimeFilters();
        }
    }, [selectedFilter]);

    // Apply filters when custom filter inputs change
    useEffect(() => {
        if (activeFilterType === 'custom') {
            const timeoutId = setTimeout(() => {
                applyCustomFilters();
            }, 300);

            return () => clearTimeout(timeoutId);
        }
    }, [startDate, endDate, orderIdFrom, orderIdTo, activeFilterType]);

    // Initial data fetch
    useEffect(() => {
        async function fetchAllCases() {
            setIsLoading(true);
            try {
                const data = await fetchWithAuth('/get-all-cases', {
                    method: "GET",
                });

                if (data && data.status === 'success') {
                    setAllData(data.new_cases || []);
                    setFilteredData(data.new_cases || []);
                } else {
                    setAllData([]);
                    setFilteredData([]);
                }
            } catch (error) {
                console.error("Error fetching cases:", error);
                setAllData([]);
                setFilteredData([]);
            } finally {
                setIsLoading(false);
            }
        }

        fetchAllCases();
    }, []);

    return (
        <>
            <Hd />
            <main id="main" className={`flex-grow px-4 transition-colors duration-300 ${themeClasses.main} pt-16 sm:pt-18`}>
                <div className="min-h-screen px-2 sm:px-6 lg:px-2">
                    <div className="w-full max-w-full">

                        {/* Enhanced Header Section */}
                        <header className={`rounded-xl shadow-sm my-6 px-6 py-4 ${getHeaderClass()}`}>
                            <div className="container mx-auto">
                                <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="text-center sm:text-left">
                                        <h1 className={`text-2xl sm:text-3xl font-bold ${theme === 'light' ? 'text-black' : 'text-white'}`}>
                                            Reports & Analytics
                                        </h1>
                                        <p className={`mt-2 text-sm sm:text-base ${themeClasses.text.secondary}`}>
                                            Generate comprehensive reports and analyze order performance
                                        </p>
                                    </div>
                                    <nav className="flex justify-center sm:justify-start">
                                        <ol className="flex items-center space-x-2 sm:space-x-3 text-sm">
                                            <li>
                                                <Link
                                                    to="/user/home"
                                                    className={`hover:text-blue-700 transition-colors duration-300 flex items-center ${themeClasses.text.accent}`}
                                                >
                                                    <FontAwesomeIcon icon={faHome} className="w-4 h-4 mr-2" />
                                                    <span>Dashboard</span>
                                                </Link>
                                            </li>
                                            <li className={themeClasses.text.muted}>
                                                <span>/</span>
                                            </li>
                                            <li className={themeClasses.text.muted}>
                                                <span>Reports</span>
                                            </li>
                                        </ol>
                                    </nav>
                                </div>
                            </div>
                        </header>

                        {/* Main Card Container */}
                        <div className={`rounded-xl ${themeClasses.card} p-6 mb-8`}>

                            {/* Search Section */}
                            <div className="mb-8">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className={`text-xl font-semibold ${themeClasses.text.primary} flex items-center`}>
                                        <FontAwesomeIcon icon={faSearch} className="w-5 h-5 mr-3 text-blue-500" />
                                        Report Criteria
                                    </h2>

                                    <div className="flex space-x-3">
                                        <button
                                            onClick={handleResetFilters}
                                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all ${theme === 'light'
                                                ? 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                                                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                                                }`}
                                        >
                                            <FontAwesomeIcon icon={faSync} className="w-4 h-4" />
                                            <span>Reset</span>
                                        </button>

                                        <button
                                            onClick={handleDownloadReport}
                                            disabled={filteredData.length === 0}
                                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all ${filteredData.length === 0
                                                ? 'bg-gray-400 cursor-not-allowed'
                                                : themeClasses.button.download
                                                }`}
                                        >
                                            <FontAwesomeIcon icon={faDownload} className="w-4 h-4" />
                                            <span>Export Report</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="max-w-6xl mx-auto overflow-x-auto">
                                    <div className="grid grid-cols-12 gap-4 items-center">

                                        {/* Order ID From */}
                                        <div className="col-span-2">
                                            <label className={`block text-sm font-semibold ${themeClasses.text.primary} mb-2 flex items-center`}>
                                                <FontAwesomeIcon icon={faHashtag} className="w-4 h-4 mr-2 text-blue-500" />
                                                Order ID From
                                            </label>
                                            <input
                                                type="text"
                                                value={orderIdFrom}
                                                onChange={handleOrderIdFromChange}
                                                placeholder="e.g., 1001"
                                                className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${themeClasses.input}`}
                                            />
                                        </div>

                                        {/* Order ID To */}
                                        <div className="col-span-2">
                                            <label className={`block text-sm font-semibold ${themeClasses.text.primary} mb-2 flex items-center`}>
                                                <FontAwesomeIcon icon={faHashtag} className="w-4 h-4 mr-2 text-blue-500" />
                                                Order ID To
                                            </label>
                                            <input
                                                type="text"
                                                value={orderIdTo}
                                                onChange={handleOrderIdToChange}
                                                placeholder="e.g., 2000"
                                                className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${themeClasses.input}`}
                                            />
                                        </div>

                                        {/* OR */}
                                        <div className="col-span-1 flex justify-center items-end font-bold text-gray-400 text-lg mt-4">
                                            OR
                                        </div>

                                        {/* Start Date */}
                                        <div className="col-span-2">
                                            <label className={`block text-sm font-semibold ${themeClasses.text.primary} mb-2 flex items-center`}>
                                                <FontAwesomeIcon icon={faCalendarAlt} className="w-4 h-4 mr-2 text-blue-500" />
                                                Start Date
                                            </label>
                                            <input
                                                type="date"
                                                value={startDate}
                                                onChange={(e) => setStartDate(e.target.value)}
                                                className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${themeClasses.input}`}
                                            />
                                        </div>

                                        {/* End Date */}
                                        <div className="col-span-2">
                                            <label className={`block text-sm font-semibold ${themeClasses.text.primary} mb-2 flex items-center`}>
                                                <FontAwesomeIcon icon={faCalendarAlt} className="w-4 h-4 mr-2 text-blue-500" />
                                                End Date
                                            </label>
                                            <input
                                                type="date"
                                                value={endDate}
                                                onChange={(e) => setEndDate(e.target.value)}
                                                className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${themeClasses.input}`}
                                            />
                                        </div>

                                        {/* Apply Filters */}
                                        <div className="col-span-3 flex items-end mt-6">
                                            <button
                                                onClick={handleSearchClick}
                                                disabled={isLoading}
                                                className={`w-44 h-12 text-white font-semibold rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 ${isLoading ? 'bg-gray-400 cursor-not-allowed' : themeClasses.button.success
                                                    }`}
                                            >
                                                {isLoading ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                                        <span>Applying Filters...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <FontAwesomeIcon icon={faFileAlt} className="w-4 h-4" />
                                                        <span>Apply Filters</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>

                                    </div>

                                    {/* Tips */}
                                    <div className="mt-4">
                                        <p className={`text-xs ${themeClasses.text.muted}`}>
                                            Tip: Use Order ID range or Date range to refine your report. Showing {filteredData.length} of {allData.length} records.
                                        </p>
                                    </div>
                                </div>
                            </div>


                            {/* Enhanced Filter Section */}
                            <div className="mb-8">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className={`text-lg font-semibold ${themeClasses.text.primary} flex items-center`}>
                                        <FontAwesomeIcon icon={faFilter} className="w-4 h-4 mr-2 text-blue-500" />
                                        Time Period
                                    </h3>
                                    <span className={`text-sm ${themeClasses.text.muted}`}>
                                        {filteredData.length} of {allData.length} records shown
                                    </span>
                                </div>

                                <div className="max-w-full mx-auto">
                                    <div className="flex flex-wrap justify-center gap-3">
                                        {filterButtons.map((button) => (
                                            <button
                                                key={button.value}
                                                onClick={() => handleFilterClick(button.value)}
                                                disabled={isLoading}
                                                className={`px-6 py-3 rounded-lg transition-all duration-200 flex items-center space-x-3 min-w-[120px] cursor-pointer ${selectedFilter === button.value && activeFilterType === 'time'
                                                    ? `${themeClasses.button.filterActive} transform scale-105`
                                                    : themeClasses.button.filterInactive
                                                    } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
                                            >
                                                <FontAwesomeIcon
                                                    icon={button.icon}
                                                    className={`w-4 h-4 ${selectedFilter === button.value && activeFilterType === 'time' ? 'text-white' : 'text-blue-500'
                                                        }`}
                                                />
                                                <span className="font-medium">{button.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Data Table Section */}
                            <div className="mt-8">
                                <Datatable
                                    columns={columns}
                                    data={filteredData}
                                    rowsPerPage={50}
                                    theme={theme}
                                />
                            </div>

                        </div>
                    </div>
                </div>
            </main>
            <Foot />
        </>
    );
}