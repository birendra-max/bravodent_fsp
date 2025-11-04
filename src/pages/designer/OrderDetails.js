import { useParams } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { ThemeContext } from "../../Context/ThemeContext";
import Hd from "./Hd";
import Foot from "./Foot";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faClock,
    faCheckCircle,
    faSyncAlt,
    faTimesCircle,
    faBoxArchive,
    faCube,
    faFileCircleCheck,
    faEye,
    faUpload,
    faDownload,
    faPlusCircle,
    faSearch,
    faInfoCircle
} from "@fortawesome/free-solid-svg-icons";

export default function OrderDetails() {
    const { theme } = useContext(ThemeContext);
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");

    const base_url = localStorage.getItem("base_url");
    const token = localStorage.getItem("token");

    // Fetch order details
    useEffect(() => {
        async function fetchOrderDetails() {
            try {
                setLoading(true);
                const response = await fetch(`${base_url}/get-order-details`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ orderid: id }),
                });

                const resp = await response.json();
                if (resp.status === "success") {
                    setOrder(resp.order);
                    setSelectedStatus(resp.order.status);
                } else {
                    setError(resp.message || "Failed to fetch order details");
                }
            } catch (error) {
                console.error("Error fetching order details:", error);
                setError("Failed to fetch order details");
            } finally {
                setLoading(false);
            }
        }

        if (id) fetchOrderDetails();
    }, [id]);

    // Status config
    const statusConfig = {
        pending: { color: "bg-yellow-500", icon: faClock },
        completed: { color: "bg-green-500", icon: faCheckCircle },
        qc: { color: "bg-blue-500", icon: faEye },
        redesign: { color: "bg-purple-500", icon: faSyncAlt },
        cancelled: { color: "bg-red-500", icon: faTimesCircle },
    };

    const turnaroundConfig = {
        rush: "bg-red-100 text-red-700 border border-red-200",
        standard: "bg-blue-100 text-blue-700 border border-blue-200",
        economy: "bg-green-100 text-green-700 border border-green-200",
    };

    const handleStatusUpdate = async () => {
        try {
            const response = await fetch(`${base_url}/update-order-status`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ orderid: id, status: selectedStatus }),
            });

            const resp = await response.json();
            if (resp.status === "success") {
                setOrder((prev) => ({ ...prev, status: selectedStatus }));
                alert("Order status updated successfully!");
            } else alert("Failed to update order status");
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Error updating order status");
        }
    };

    if (loading)
        return (
            <>
                <Hd />
                <main
                    className={`min-h-screen flex items-center justify-center ${theme === "light"
                        ? "bg-gray-50 text-gray-900"
                        : "bg-gray-900 text-white"
                        }`}
                >
                    <FontAwesomeIcon icon={faSyncAlt} spin className="text-4xl text-blue-500" />
                </main>
                <Foot />
            </>
        );

    if (error)
        return (
            <>
                <Hd />
                <main
                    className={`min-h-screen flex flex-col items-center justify-center ${theme === "light"
                        ? "bg-gray-50 text-gray-900"
                        : "bg-gray-900 text-white"
                        }`}
                >
                    <FontAwesomeIcon icon={faTimesCircle} className="text-red-500 text-6xl mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Error Loading Order</h2>
                    <p className="text-gray-600 dark:text-gray-400">{error}</p>
                </main>
                <Foot />
            </>
        );

    return (
        <>
            <Hd />
            <main id="main" className={`flex-grow px-4 transition-colors duration-300 ${theme === 'light' ? 'bg-white text-black' : 'bg-black text-white'} pt-16 sm:pt-22 px-8`}>
                <div className="max-w-8xl mx-auto space-y-8">
                    {/* Header */}
                    <div
                        className={`rounded-2xl shadow-sm border px-8 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 ${theme === "light"
                            ? "bg-gray-200 border-gray-200"
                            : "bg-gray-800 border-gray-700"
                            }`}
                    >
                        <div>
                            <h1 className="text-3xl font-bold mb-1">Order Details</h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Manage and track your order below.
                            </p>
                        </div>

                        {/* ✅ Dynamic Status + Order ID */}
                        <div className="flex items-center gap-3">
                            {(() => {
                                let statusColor = "";
                                let textColor = "text-white";

                                switch (order?.status?.toLowerCase()) {
                                    case "completed":
                                        statusColor = "bg-green-600";
                                        break;
                                    case "pending":
                                        statusColor = "bg-yellow-500";
                                        textColor = "text-black";
                                        break;
                                    case "new":
                                        statusColor = "bg-blue-500";
                                        break;
                                    case "cancel":
                                        statusColor = "bg-red-600";
                                        break;
                                    case "qc":
                                        statusColor = "bg-purple-600";
                                        break;
                                    default:
                                        statusColor = "bg-gray-400";
                                        break;
                                }

                                return (
                                    <>
                                        <div
                                            className={`px-4 py-2 rounded-full flex items-center gap-2 text-sm font-semibold shadow-md ${statusColor} ${textColor}`}
                                        >
                                            <FontAwesomeIcon icon={
                                                order?.status?.toLowerCase() === "completed"
                                                    ? faCheckCircle
                                                    : order?.status?.toLowerCase() === "pending"
                                                        ? faClock
                                                        : order?.status?.toLowerCase() === "new"
                                                            ? faPlusCircle
                                                            : order?.status?.toLowerCase() === "cancel"
                                                                ? faTimesCircle
                                                                : order?.status?.toLowerCase() === "qc"
                                                                    ? faSearch
                                                                    : faInfoCircle
                                            } />
                                            <span className="capitalize">{order?.status || "N/A"}</span>
                                        </div>

                                        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-md">
                                            #{order?.orderid}
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                    </div>


                    {/* Content Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* LEFT PANEL */}
                        <div
                            className={`col-span-2 rounded-2xl shadow-xl border p-8 transition-all duration-300 ${theme === "light"
                                ? "bg-gray-200 border-gray-200"
                                : "bg-gray-800 border-gray-700"
                                }`}
                        >
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-semibold flex items-center gap-2">
                                    <FontAwesomeIcon
                                        icon={faFileCircleCheck}
                                        className="text-indigo-500"
                                    />
                                    Order Summary
                                </h2>
                                <span
                                    className={`px-4 py-1.5 rounded-full text-xs font-semibold ${turnaroundConfig[order?.tduration?.toLowerCase()] ||
                                        "bg-gray-600 text-white"
                                        }`}
                                >
                                    {order?.tduration || "N/A"} Delivery
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                                <div className="space-y-8">
                                    <DetailItem label="Order ID" value={order?.orderid} />
                                    <DetailItem label="File Name" value={order?.fname} />
                                    <DetailItem label="Product Type" value={order?.product_type} />
                                    <DetailItem label="Tooth" value={order?.tooth} />
                                </div>
                                <div className="space-y-8">
                                    <DetailItem label="Unit" value={order?.unit} />
                                    <DetailItem label="Lab Name" value={order?.labname} />
                                    <DetailItem label="Designer ID" value={order?.designerid} />
                                    <DetailItem
                                        label="Order Date"
                                        value={
                                            order?.order_date
                                                ? new Date(order.order_date).toLocaleDateString()
                                                : "N/A"
                                        }
                                    />
                                </div>
                            </div>


                            {/* FILE DOWNLOADS */}
                            <div className="mt-10 pt-6 border-t border-gray-300 dark:border-gray-700">
                                <h3 className="text-xl font-semibold mb-5 flex items-center gap-2">
                                    <FontAwesomeIcon icon={faDownload} className="text-blue-500" />
                                    File Downloads
                                </h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                    <FileCard
                                        icon={faBoxArchive}
                                        gradient="from-blue-500 to-cyan-500"
                                        label="ZIP File"
                                        url={order?.file_path}
                                        description="Original uploaded archive"
                                    />
                                    <FileCard
                                        icon={faCube}
                                        gradient="from-green-500 to-emerald-500"
                                        label="STL File"
                                        url={order?.stl_file_path}
                                        description="3D printable model"
                                    />
                                    {order?.finish_file_path && (
                                        <FileCard
                                            icon={faCheckCircle}
                                            gradient="from-purple-500 to-pink-500"
                                            label="Finished File"
                                            url={order?.finish_file_path}
                                            description="Final approved output"
                                        />
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT PANEL */}
                        <div className="space-y-6">
                            {/* Status Update */}
                            <div
                                className={`rounded-2xl shadow-md border p-6 ${theme === "light"
                                    ? "bg-gray-200 border-gray-200"
                                    : "bg-gray-800 border-gray-700"
                                    }`}
                            >
                                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <FontAwesomeIcon
                                        icon={faCheckCircle}
                                        className="text-blue-500"
                                    />
                                    Update Order Status
                                </h2>
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className={`w-full p-3 rounded-lg border text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none ${theme === "light"
                                        ? "bg-gray-50 border-gray-300 text-gray-900"
                                        : "bg-gray-700 border-gray-600 text-white"
                                        }`}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="qc">QC</option>
                                    <option value="redesign">Redesign</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                                <button
                                    onClick={handleStatusUpdate}
                                    className="w-full mt-4 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 text-white font-semibold transition-all"
                                >
                                    Update Status
                                </button>
                            </div>

                            {/* Upload Section */}
                            <div
                                className={`rounded-2xl shadow-md border p-6 ${theme === "light"
                                    ? "bg-gray-200 border-gray-200"
                                    : "bg-gray-800 border-gray-700"
                                    }`}
                            >
                                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <FontAwesomeIcon icon={faUpload} className="text-green-500" />
                                    Upload Files
                                </h2>
                                {["ZIP", "STL"].map((type) => (
                                    <UploadBox key={type} type={type} theme={theme} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Foot />
        </>
    );
}

/* Subcomponents */
function DetailItem({ label, value }) {
    const { theme } = useContext(ThemeContext)
    return (
        <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-8">
            <span className={`font-medium ${theme == 'light' ? 'text-gray-800' : 'text-gray-200'} `}>{label}</span>
            <span className={`font-semibold truncate ${theme == 'light' ? 'text-gray-800' : 'text-gray-200'}`}>{value}</span>
        </div>
    );
}

function FileCard({ icon, gradient, label, url, description }) {
    return (
        <a
            href={url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className={`relative overflow-hidden group rounded-xl border shadow-md transition-all duration-300 hover:-translate-y-1 ${url
                ? "cursor-pointer hover:shadow-xl"
                : "opacity-60 cursor-not-allowed"
                } ${"border-gray-200 dark:border-gray-700"} ${url
                    ? "bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700"
                    : "bg-gray-200 dark:bg-gray-800"
                }`}
        >
            <div className="p-5 flex items-start gap-4">
                <div
                    className={`p-3 rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg`}
                >
                    <FontAwesomeIcon icon={icon} size="lg" />
                </div>
                <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{label}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
                </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-3 text-right">
                {url ? (
                    <span className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline">
                        <FontAwesomeIcon icon={faDownload} /> Download
                    </span>
                ) : (
                    <span className="text-sm text-gray-400">Not Available</span>
                )}
            </div>
        </a>
    );
}

function UploadBox({ type, theme }) {
    const icon = type === "ZIP" ? faBoxArchive : faCube;
    const color = type === "ZIP" ? "text-blue-500" : "text-green-500";

    return (
        <div
            className={`p-5 rounded-lg border-2 border-dashed mb-4 text-center transition-all hover:shadow-lg ${theme === "light"
                ? "border-gray-300 bg-gray-50 hover:bg-gray-100"
                : "border-gray-600 bg-gray-700/30 hover:bg-gray-700/60"
                }`}
        >
            <FontAwesomeIcon icon={icon} className={`text-3xl mb-2 ${color}`} />
            <p className="text-sm mb-3">Upload {type} File</p>
            <input type="file" id={`${type}-upload`} className="hidden" />
            <label
                htmlFor={`${type}-upload`}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer"
            >
                Upload {type}
            </label>
        </div>
    );
}
