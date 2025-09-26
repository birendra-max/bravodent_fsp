import React, { useContext, useState } from "react";
import Hd from "./Hd";
import Foot from "./Foot";
import { UserContext } from "../../Context/UserContext";

export default function NewRequest() {
    const { user } = useContext(UserContext);
    const [files, setFiles] = useState([]);
    const [drag, setDragActive] = useState(false);

    // ✅ Handle files (only zip allowed)
    const handleFiles = async (selectedFiles) => {
        const fileArray = Array.from(selectedFiles);
        const zipFiles = fileArray.filter((file) => file.name.endsWith(".zip"));

        if (zipFiles.length !== fileArray.length) {
            alert("Only .zip files are allowed!");
            return; // Added return to stop execution if invalid files are found
        }

        for (let file of zipFiles) {
            // Add temp row (status: uploading with progress)
            setFiles((prev) => [
                ...prev,
                {
                    fileName: file.name,
                    progress: 0,
                    uploadStatus: "Uploading...",
                    orderId: "-",
                    productType: "-",
                    unit: "-",
                    tooth: "-",
                    message: "",
                },
            ]);

            const formData = new FormData();
            formData.append("file", file);

            try {
                const response = await fetch("http://localhost/bravodent_ci/new-orders", {
                    method: "POST",
                    header:{
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    body: formData,
                });

                if (response.ok) {
                    const result = await response.json();

                    setFiles((prev) =>
                        prev.map((f) =>
                            f.fileName === file.name
                                ? {
                                    ...f,
                                    uploadStatus: "Success",
                                    orderId: result.order_id,
                                    productType: result.product_type,
                                    unit: result.unit,
                                    tooth: result.tooth,
                                    progress: 100, // Ensure progress is 100% on success
                                }
                                : f
                        )
                    );
                } else {
                    throw new Error(`Upload failed with status: ${response.status}`);
                }
            } catch (error) {
                console.error("Upload failed:", error);
                setFiles((prev) =>
                    prev.map((f) =>
                        f.fileName === file.name
                            ? {
                                ...f,
                                uploadStatus: "Failed",
                                message: error.message || "Error uploading file",
                                progress: 100, // Set progress to 100 even on failure
                            }
                            : f
                    )
                );
            }
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const handleMessageChange = (fileName, value) => {
        setFiles((prev) =>
            prev.map((f) =>
                f.fileName === fileName ? { ...f, message: value } : f
            )
        );
    };

    const removeFile = (fileName) => {
        setFiles((prev) => prev.filter((f) => f.fileName !== fileName));
    };

    return (
        <>
            <Hd />
            <section className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-22 px-4">
                <div className="max-w-fill mx-auto">
                    <form className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                        {/* Card Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-white mb-2">
                                        Upload Your Orders
                                    </h2>
                                    <p className="text-blue-100 text-sm">
                                        Drag and drop or select your ZIP files
                                    </p>
                                </div>
                                <div className="bg-white/20 p-3 rounded-full">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Drag & Drop Area */}
                        {files.length === 0 && (
                            <div className="p-4">
                                <div
                                    className={` min-h-[70vh] relative border-2 border-dashed rounded-2xl transition-all duration-300 ${drag
                                        ? "border-blue-500 bg-blue-50 scale-105"
                                        : "border-gray-300 hover:border-blue-400"
                                        }`}
                                    onDragEnter={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setDragActive(true);
                                    }}
                                    onDragOver={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                    }}
                                    onDragLeave={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setDragActive(false);
                                    }}
                                    onDrop={handleDrop}
                                >
                                    <div className="p-12 text-center">
                                        <div className="mx-auto w-24 h-24 mb-6">
                                            <svg className="w-full h-full text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                            </svg>
                                        </div>

                                        <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                                            Drop your files here
                                        </h3>
                                        <p className="text-gray-500 mb-6">
                                            Supports ZIP files only. Maximum file size: 100MB
                                        </p>

                                        <label className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-lg shadow-lg cursor-pointer transition-all duration-300 transform hover:scale-105">
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                            Browse Files
                                            <input
                                                type="file"
                                                id="selectfile"
                                                accept=".zip"
                                                multiple
                                                className="hidden"
                                                onChange={(e) => handleFiles(e.target.files)}
                                            />
                                        </label>

                                        <p className="text-sm text-gray-400 mt-4">
                                            or drag and drop your files
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Upload Details Table */}
                        {files.length > 0 && (
                            <div className="p-8">
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-800">
                                            Upload Progress
                                        </h3>
                                        <p className="text-gray-600">
                                            {files.length} file{files.length !== 1 ? 's' : ''} being processed
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm text-gray-500">
                                            Last updated: {new Date().toLocaleTimeString()}
                                        </span>
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full">
                                            <thead className="bg-gradient-to-r from-gray-100 to-gray-200">
                                                <tr>
                                                    {[
                                                        { name: "Order ID", width: "15%" },
                                                        { name: "File Name", width: "20%" },
                                                        { name: "Progress", width: "20%" },
                                                        { name: "Product Type", width: "12%" },
                                                        { name: "Unit", width: "10%" },
                                                        { name: "Tooth", width: "10%" },
                                                        { name: "Message", width: "18%" },
                                                    ].map((header) => (
                                                        <th
                                                            key={header.name}
                                                            className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                                                            style={{ width: header.width }}
                                                        >
                                                            {header.name}
                                                        </th>
                                                    ))}
                                                    <th className="w-12"></th>
                                                </tr>
                                            </thead>

                                            <tbody className="divide-y divide-gray-200">
                                                {files.map((file, idx) => (
                                                    <tr
                                                        key={idx}
                                                        className="hover:bg-blue-50/50 transition-colors duration-200"
                                                    >
                                                        {/* Order ID */}
                                                        <td className="px-6 py-4">
                                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                {file.orderId}
                                                            </span>
                                                        </td>

                                                        {/* File Name */}
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center">
                                                                <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                </svg>
                                                                <span
                                                                    title={file.fileName}
                                                                    className="text-sm font-medium text-gray-900 truncate max-w-xs"
                                                                >
                                                                    {file.fileName}
                                                                </span>
                                                            </div>
                                                        </td>

                                                        {/* Upload Progress */}
                                                        <td className="px-6 py-4">
                                                            <div className="space-y-2">
                                                                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                                                    <div
                                                                        className={`h-2 rounded-full transition-all duration-500 ease-out ${file.uploadStatus === "Success"
                                                                            ? "bg-green-500"
                                                                            : file.uploadStatus === "Failed"
                                                                                ? "bg-red-500"
                                                                                : "bg-gradient-to-r from-blue-500 to-purple-500"
                                                                            }`}
                                                                        style={{ width: `${file.progress}%` }}
                                                                    ></div>
                                                                </div>
                                                                <div className="flex justify-between text-xs text-gray-500">
                                                                    <span>{file.uploadStatus}</span>
                                                                    <span>{file.progress}%</span>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        {/* Product Type */}
                                                        <td className="px-6 py-4 text-sm text-gray-700 font-medium">
                                                            {file.productType}
                                                        </td>

                                                        {/* Unit */}
                                                        <td className="px-6 py-4 text-sm text-gray-600">
                                                            {file.unit}
                                                        </td>

                                                        {/* Tooth */}
                                                        <td className="px-6 py-4">
                                                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-700 text-sm font-medium">
                                                                {file.tooth}
                                                            </span>
                                                        </td>

                                                        {/* Message Input */}
                                                        <td className="px-6 py-4">
                                                            <div className="relative">
                                                                <input
                                                                    type="text"
                                                                    value={file.message}
                                                                    onChange={(e) =>
                                                                        handleMessageChange(
                                                                            file.fileName,
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                                    placeholder="Add a note..."
                                                                />
                                                            </div>
                                                        </td>

                                                        {/* Remove Button */}
                                                        <td className="px-2 py-4">
                                                            <button
                                                                onClick={() => removeFile(file.fileName)}
                                                                className="p-2 text-gray-400 hover:text-red-500 transition-colors duration-200"
                                                                title="Remove file"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                </svg>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Footer Stats */}
                                    <div className="bg-gray-100 px-6 py-4 border-t border-gray-200">
                                        <div className="flex justify-between items-center">
                                            <div className="flex space-x-6">
                                                <div className="text-sm">
                                                    <span className="text-gray-600">Total: </span>
                                                    <span className="font-semibold text-gray-800">{files.length}</span>
                                                </div>
                                                <div className="text-sm">
                                                    <span className="text-gray-600">Completed: </span>
                                                    <span className="font-semibold text-green-600">
                                                        {files.filter(f => f.uploadStatus === "Success").length}
                                                    </span>
                                                </div>
                                                <div className="text-sm">
                                                    <span className="text-gray-600">Failed: </span>
                                                    <span className="font-semibold text-red-600">
                                                        {files.filter(f => f.uploadStatus === "Failed").length}
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setFiles([])}
                                                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200"
                                            >
                                                Clear All
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-end space-x-4 mt-6">
                                    <button
                                        type="button"
                                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 font-medium shadow-lg"
                                    >
                                        Submit Orders
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </section>
            <Foot />
        </>
    );
}