import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import Loder from "../../Components/Loder";
import { ThemeContext } from "../../Context/ThemeContext";
import Hd from "./Hd";
import Foot from "./Foot";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faDownload,
    faFileAlt,
    faCube,
    faArchive,
    faClock,
    faBackward,
    faPalette,
    faUserCog
} from "@fortawesome/free-solid-svg-icons";

export default function OrderDetails() {
    const { theme } = useContext(ThemeContext);
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [fileHistory, setFileHistory] = useState({ stl_files: [], finished_files: [] });
    const [designPreferences, setDesignPreferences] = useState(null);
    const [preferencesLoading, setPreferencesLoading] = useState(false);
    const navigate = useNavigate();
    const base_url = localStorage.getItem("bravo_user_base_url");
    const token = localStorage.getItem("bravo_user_token");

    const fetchFileHistory = async () => {
        try {
            const response = await fetch(`${base_url}/get-file-history`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}`, 'X-Tenant': 'bravodent' },
                body: JSON.stringify({ orderid: id }),
            });

            const resp = await response.json();
            if (resp.status === "success") {
                setFileHistory({
                    stl_files: resp.stl_files || [],
                    finished_files: resp.finished_files || []
                });
            }
        } catch (error) {
            console.error("Error fetching file history:", error);
        }
    };

    useEffect(() => {
        async function fetchOrderDetails() {
            try {
                setLoading(true);
                const response = await fetch(`${base_url}/get-order-details`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}`, 'X-Tenant': 'bravodent' },
                    body: JSON.stringify({ orderid: id }),
                });

                const resp = await response.json();
                if (resp.status === "success") {
                    setOrder(resp.order);
                    await fetchFileHistory();

                    if (resp.order?.userid) {
                        fetchUserPreferences(resp.order.userid);
                    }
                } else {
                    setError(resp.message || "Failed to fetch order details");
                }
            } catch (error) {
                setError("Failed to fetch order details");
            } finally {
                setLoading(false);
            }
        }

        if (id) fetchOrderDetails();
    }, [id]);

    const fetchUserPreferences = async (userid) => {
        try {
            setPreferencesLoading(true);
            const response = await fetch(`${base_url}/get-default-pref/${userid}`, {
                headers: { 'X-Tenant': 'bravodent' }
            });

            const result = await response.json();

            if (result.status === 'Success') {
                setDesignPreferences(result.prefe || {});
            } else {
                setDesignPreferences({});
            }
        } catch (error) {
            setDesignPreferences({});
        } finally {
            setPreferencesLoading(false);
        }
    };

    const downloadFile = (filename, path) => {
        if (!path) {
            toast.error("File path not found!");
            return;
        }

        const encodedPath = encodeURIComponent(path);
        const finalUrl = `${base_url}/download?path=${encodedPath}`;

        const link = document.createElement("a");
        link.href = finalUrl;
        link.target = "_blank";
        link.download = filename || "download";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleFileNameClick = (file) => {
        const filePath = file.url || file.path || file.file_path;
        if (filePath) {
            downloadFile(file.fname, filePath);
        } else {
            toast.error("File path not found!");
        }
    };

    if (loading) return (
        <>
            <Hd />
            <main className={`min-h-screen flex flex-col items-center justify-center ${theme === "light" ? "bg-gray-50" : "bg-gray-900"}`}>
                <Loder status="show" />
            </main>
            <Foot />
        </>
    );

    if (error) return (
        <>
            <Hd />
            <main className={`min-h-screen flex flex-col items-center justify-center ${theme === "light" ? "bg-gray-50" : "bg-gray-900"}`}>
                <div className="text-center">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h2 className={`text-2xl font-bold mb-2 ${theme === "light" ? "text-gray-900" : "text-white"}`}>Error Loading Order</h2>
                    <p className={theme === "light" ? "text-gray-600" : "text-gray-400"}>{error}</p>
                </div>
            </main>
            <Foot />
        </>
    );

    return (
        <>
            <Toaster position="top-right" />
            <Hd />

            <main className={`min-h-screen py-12 ${theme === "light" ? "bg-gray-100 text-gray-900" : "bg-gray-900 text-white"}`}>
                <section className="py-8">
                    <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`rounded-xl shadow-lg ${theme === "light" ? "bg-white" : "bg-gray-800"}`}>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                    <div>
                                        <label className="font-bold text-lg">Order ID: </label>
                                        <span className="text-xl font-bold text-blue-600">{order?.orderid}</span>
                                    </div>
                                    <div>
                                        <label className="font-bold text-lg"><FontAwesomeIcon icon={faClock} className="mr-2" />Status:</label>
                                        <span className={`ml-2 px-4 py-2 rounded-full text-sm font-bold ${order?.status === 'Completed' ? 'bg-green-500 text-white' : order?.status === 'Cancel' || order?.status === 'Cancelled' ? 'bg-red-500 text-white' : 'bg-yellow-500 text-gray-900'}`}>
                                            {order?.status === 'progress' ? 'In Progress' : order?.status}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <button onClick={() => navigate(-1)} className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold transition-colors shadow-lg cursor-pointer">
                                            <FontAwesomeIcon icon={faBackward} className="mr-2" />Back to Orders
                                        </button>
                                    </div>
                                </div>

                                <div className="border-t pt-6">
                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
                                        <div className="lg:col-span-7">
                                            <label className="font-bold block mb-3 text-lg">Initial Scan: </label>
                                            {order?.file_path ? (
                                                <div className="flex items-center space-x-3 bg-gray-50 p-4 rounded-lg">
                                                    <FontAwesomeIcon icon={faFileAlt} className="text-blue-500 text-xl" />
                                                    <div className="flex-1">
                                                        <a 
                                                            href="#" 
                                                            className="text-blue-600 hover:text-blue-800 hover:underline font-semibold text-lg cursor-pointer"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                downloadFile(order.fname || "initial_file.zip", order.file_path);
                                                            }}
                                                        >
                                                            {order?.fname}
                                                        </a>
                                                        <p className={`text-sm ${theme === "light" ? "text-gray-500" : "text-gray-400"}`}>Uploaded: {order?.order_date || 'N/A'}</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className={`text-center py-4 ${theme === "light" ? "text-gray-500" : "text-gray-400"}`}>
                                                    <FontAwesomeIcon icon={faFileAlt} className="text-3xl mb-2 opacity-50" />
                                                    <p className="text-lg">No initial file available</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 mt-8">
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className={`rounded-xl shadow-lg ${theme === "light" ? "bg-white" : "bg-gray-800"}`}>
                                <div className="p-6 h-full flex flex-col">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-3 rounded-xl ${theme === "light" ? "bg-green-100 text-green-600" : "bg-green-900 text-green-300"}`}>
                                                <FontAwesomeIcon icon={faFileAlt} className="text-xl" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold">Uploaded Files</h3>
                                                <p className={`text-sm ${theme === "light" ? "text-gray-500" : "text-gray-400"}`}>
                                                    {fileHistory.stl_files.length + fileHistory.finished_files.length} total files
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex-grow flex flex-col min-h-0">
                                        <div className="overflow-x-auto flex-shrink-0">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className={`border-b ${theme === "light" ? "border-gray-200" : "border-gray-700"}`}>
                                                        <th className="py-3 px-4 text-left font-bold text-sm w-[80%]">File Name</th>
                                                        <th className="py-3 px-4 text-right font-bold text-sm">Actions</th>
                                                    </tr>
                                                </thead>
                                            </table>
                                        </div>

                                        <div className="overflow-y-auto flex-grow" style={{ maxHeight: '400px' }}>
                                            <table className="w-full">
                                                <tbody>
                                                    {fileHistory.stl_files.length === 0 && fileHistory.finished_files.length === 0 ? (
                                                        <tr>
                                                            <td colSpan="2" className="py-8 text-center">
                                                                <div className="flex flex-col items-center justify-center py-4">
                                                                    <FontAwesomeIcon icon={faFileAlt} className="text-3xl mb-3 opacity-50" />
                                                                    <p className={`text-lg ${theme === "light" ? "text-gray-500" : "text-gray-400"}`}>No files uploaded yet</p>
                                                                    <p className={`text-sm mt-1 ${theme === "light" ? "text-gray-400" : "text-gray-500"}`}>Upload your first file to get started</p>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        <>
                                                            {[...fileHistory.stl_files, ...fileHistory.finished_files].map((file, index) => {
                                                                const isStlFile = file.type === 'stl' || file.file_type === 'stl' || (file.fname && file.fname.endsWith('.stl'));
                                                                const fileIcon = isStlFile ? faCube : faArchive;

                                                                return (
                                                                    <tr key={file.id || index} className={`border-b ${theme === "light" ? "border-gray-100 hover:bg-gray-50" : "border-gray-700 hover:bg-gray-700"}`}>
                                                                        <td className="py-3 px-4 w-[80%]">
                                                                            <div className="flex items-start gap-3">
                                                                                <div className="mt-1">
                                                                                    <FontAwesomeIcon icon={fileIcon} className={`text-sm ${isStlFile ? 'text-blue-500' : 'text-green-500'}`} />
                                                                                </div>
                                                                                <div className="flex-1">
                                                                                    <a
                                                                                        href="#"
                                                                                        onClick={(e) => {
                                                                                            e.preventDefault();
                                                                                            handleFileNameClick(file);
                                                                                        }}
                                                                                        className={`font-semibold text-[14px] hover:underline cursor-pointer ${theme === "light" ? "text-blue-600 hover:text-blue-800" : "text-blue-400 hover:text-blue-300"}`}
                                                                                        title={file.fname}
                                                                                    >
                                                                                        {file.fname}
                                                                                    </a>
                                                                                    <p className={`text-xs mt-1 ${theme === "light" ? "text-gray-500" : "text-gray-400"}`}>
                                                                                        <FontAwesomeIcon icon={faClock} className="mr-1 text-xs" />
                                                                                        Uploaded: {file.upload_date || 'N/A'}
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                        </td>
                                                                        <td className="py-3 px-4 text-right">
                                                                            <button
                                                                                onClick={() => handleFileNameClick(file)}
                                                                                className="flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-md font-semibold transition-all ml-auto"
                                                                            >
                                                                                <FontAwesomeIcon icon={faDownload} />
                                                                            </button>
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className={`rounded-xl shadow-lg ${theme === "light" ? "bg-white" : "bg-gray-800"}`}>
                                <div className="p-6 h-full flex flex-col">
                                    <div className="mb-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                                <FontAwesomeIcon icon={faPalette} className="text-purple-600" />
                                                Default Design Preferences
                                            </h2>
                                            {preferencesLoading && (
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                                            )}
                                        </div>

                                        {designPreferences ? (
                                            <div className={`rounded-lg p-4 ${theme === "light" ? "bg-gray-50" : "bg-gray-700/50"}`}>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                    <div className="flex justify-between items-center">
                                                        <span className={`text-sm font-bold ${theme === "light" ? "text-black" : "text-gray-300"}`}>
                                                            Contact:
                                                        </span>
                                                        <span className={`text-sm font-semibold px-3 py-1 rounded ${theme === "light" ? "text-black" : "bg-blue-900/50 text-blue-300"}`}>
                                                            {designPreferences.contact}
                                                        </span>
                                                    </div>

                                                    <div className="flex justify-between items-center">
                                                        <span className={`text-sm font-bold ${theme === "light" ? "text-black" : "text-gray-300"}`}>
                                                            Occlusion:
                                                        </span>
                                                        <span className={`text-sm font-semibold px-3 py-1 rounded ${theme === "light" ? "text-black" : "bg-green-900/50 text-green-300"}`}>
                                                            {designPreferences.occlusion}
                                                        </span>
                                                    </div>

                                                    <div className="flex justify-between items-center">
                                                        <span className={`text-sm font-bold ${theme === "light" ? "text-black" : "text-gray-300"}`}>
                                                            Anatomy:
                                                        </span>
                                                        <span className={`text-sm font-semibold px-3 py-1 rounded ${theme === "light" ? "text-black" : "bg-purple-900/50 text-purple-300"}`}>
                                                            {designPreferences.anatomy}
                                                        </span>
                                                    </div>

                                                    <div className="flex justify-between items-center">
                                                        <span className={`text-sm font-bold ${theme === "light" ? "text-black" : "text-gray-300"}`}>
                                                            Pontic:
                                                        </span>
                                                        <span className={`text-sm font-semibold px-3 py-1 rounded ${theme === "light" ? "text-black" : "bg-amber-900/50 text-amber-300"}`}>
                                                            {designPreferences.pontic}
                                                        </span>
                                                    </div>

                                                    <div className="flex justify-between items-center">
                                                        <span className={`text-sm font-bold ${theme === "light" ? "text-black" : "text-gray-300"}`}>
                                                            Liner Spacer:
                                                        </span>
                                                        <span className={`text-sm font-semibold px-3 py-1 rounded ${theme === "light" ? "text-black" : "bg-indigo-900/50 text-indigo-300"}`}>
                                                            {designPreferences.liner_spacer}
                                                        </span>
                                                    </div>

                                                    <div className="flex justify-between items-center">
                                                        <span className={`text-sm font-bold ${theme === "light" ? "text-black" : "text-gray-300"}`}>
                                                            Custom:
                                                        </span>
                                                        <span className={`text-sm font-semibold px-3 py-1 rounded ${theme === "light" ? "text-black" : "bg-pink-900/50 text-pink-300"}`}>
                                                            {designPreferences.custom}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className={`rounded-lg p-4 text-center ${theme === "light" ? "bg-gray-50" : "bg-gray-700/50"}`}>
                                                <FontAwesomeIcon icon={faUserCog} className={`text-2xl mb-2 ${theme === "light" ? "text-gray-400" : "text-gray-500"}`} />
                                                <p className={`text-sm ${theme === "light" ? "text-gray-500" : "text-gray-400"}`}>
                                                    No design preferences found for this user
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>
            </main>
            <Foot />
        </>
    );
}