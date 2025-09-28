import React, { useContext, useState, useEffect } from "react";
import Hd from "./Hd";
import Foot from "./Foot";
import { UserContext } from "../../Context/UserContext";
import { useNavigate } from "react-router-dom";

export default function NewRequest() {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [files, setFiles] = useState([]);
  const [drag, setDragActive] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState("");

  useEffect(() => {
    const checkSession = async () => {
      try {
        const resp = await fetch("http://localhost/bravodent_ci/session-check", {
          method: "GET",
          credentials: "include",
        });
        const data = await resp.json();
        if (data.status !== "success") navigate("/", { replace: true });
      } catch (error) {
        console.error("Error checking session:", error);
        navigate("/", { replace: true });
      }
    };
    checkSession();
  }, []);

  const handleFiles = async (selectedFiles) => {
    const fileArray = Array.from(selectedFiles);
    const zipFiles = fileArray.filter((file) => file.name.endsWith(".zip"));

    if (zipFiles.length !== fileArray.length) {
      setFiles(prev => [...prev, {
        fileName: "Invalid files detected",
        progress: 0,
        uploadStatus: "Error",
        orderId: "-",
        productType: "-",
        unit: "-",
        tooth: "-",
        message: "Only .zip files are allowed!",
        isError: true
      }]);

      setTimeout(() => {
        setFiles(prev => prev.filter(f => !f.isError));
      }, 3000);
      return;
    }

    zipFiles.forEach((file) => {
      setFiles((prev) => [
        ...prev,
        {
          fileName: file.name,
          progress: 0,
          uploadStatus: "Waiting...",
          orderId: "-",
          productType: "-",
          unit: "-",
          tooth: "-",
          message: "",
          file: file,
        },
      ]);
      uploadFile(file);
    });
  };

  const uploadFile = async (file) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.fileName === file.name
          ? { ...f, uploadStatus: "Uploading...", progress: 20 }
          : f
      )
    );

    const progressInterval = setInterval(() => {
      setFiles((prev) =>
        prev.map((f) =>
          f.fileName === file.name && f.progress < 80
            ? { ...f, progress: f.progress + 5 }
            : f
        )
      );
    }, 300);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost/bravodent_ci/new-orders", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) throw new Error(`Upload failed: ${response.status}`);

      const result = await response.json();

      setFiles((prev) =>
        prev.map((f) =>
          f.fileName === file.name
            ? {
              ...f,
              uploadStatus: "Success",
              progress: 100,
              orderId: result.id || "ORD-001",
              productType: result.product_type || "Crown",
              unit: result.unit || "1",
              tooth: result.tooth || "15",
              message: result.message || "",
            }
            : f
        )
      );
    } catch (error) {
      clearInterval(progressInterval);
      setFiles((prev) =>
        prev.map((f) =>
          f.fileName === file.name
            ? {
              ...f,
              uploadStatus: "Failed",
              progress: 100,
              message: error.message || "Error uploading file",
            }
            : f
        )
      );
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
      prev.map((f) => (f.fileName === fileName ? { ...f, message: value } : f))
    );
  };

  const removeFile = (fileName) => {
    setFiles(prev => prev.filter(f => f.fileName !== fileName));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedDuration) {
      alert("Please select a time duration");
      return;
    }

    // Helper to convert object/array to URL-encoded string
    const toUrlEncoded = (obj) => {
      const params = new URLSearchParams();

      for (let key in obj) {
        if (Array.isArray(obj[key])) {
          params.append(key, JSON.stringify(obj[key])); // serialize array as JSON
        } else {
          params.append(key, obj[key]);
        }
      }
      return params.toString();
    };

    const bodyData = toUrlEncoded({
      files: files,
      duration: selectedDuration
    });

    try {
      const response = await fetch('http://localhost/bravodent_ci/new-orders-data', {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        credentials: 'include',
        body: bodyData
      });

      const resp = await response.json();
      console.log(resp);

    } catch (error) {
      console.error("Error submitting:", error);
    }
  };


  return (
    <>
      <Hd />
      <section className="min-h-screen bg-gray-50 py-22 px-4">
        <div className="max-w-full mx-auto">
          {/* Main Content - Full Width */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            {/* Upload Area */}
            {files.length === 0 && (
              <div className="p-6">
                <div
                  className={`border-3 min-h-[70vh] flex justify-center items-center flex-col border-dashed rounded-2xl p-12 text-center transition-all duration-200 ${drag
                    ? "border-blue-500 bg-blue-50 scale-[1.02]"
                    : "border-gray-300 hover:border-blue-400 hover:bg-blue-25"
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
                  <div className="w-20 h-20 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {drag ? "Drop files to upload" : "Upload Order Files"}
                  </h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    Drag and drop your ZIP files here or click the button below. Supported format: .zip only
                  </p>
                  <label className="inline-flex items-center px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm cursor-pointer transition-colors">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Choose Files
                    <input
                      type="file"
                      accept=".zip"
                      multiple
                      className="hidden"
                      onChange={(e) => handleFiles(e.target.files)}
                    />
                  </label>
                </div>
              </div>
            )}

            {/* Files Table */}
            {files.length > 0 && (
              <div className="p-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-4">
                    <div className="text-2xl font-bold">{files.length}</div>
                    <div className="text-blue-100 text-sm">Total Files</div>
                  </div>
                  <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-4">
                    <div className="text-2xl font-bold">
                      {files.filter(f => f.uploadStatus === "Success").length}
                    </div>
                    <div className="text-green-100 text-sm">Completed</div>
                  </div>
                  <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg p-4">
                    <div className="text-2xl font-bold">
                      {files.filter(f => f.uploadStatus === "Uploading...").length}
                    </div>
                    <div className="text-yellow-100 text-sm">In Progress</div>
                  </div>
                  <div className="bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg p-4">
                    <div className="text-2xl font-bold">
                      {files.filter(f => f.uploadStatus === "Waiting...").length}
                    </div>
                    <div className="text-gray-100 text-sm">Pending</div>
                  </div>
                </div>

                {/* Table Container */}
                <div className="bg-gray-50 rounded-lg border border-gray-200">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          {[
                            { name: "ORDER ID", width: "w-32" },
                            { name: "FILE NAME", width: "w-62" },
                            { name: "STATUS", width: "w-40" },
                            { name: "PRODUCT TYPE", width: "w-32" },
                            { name: "UNIT", width: "w-20" },
                            { name: "TOOTH", width: "w-20" },
                            { name: "MESSAGE", width: "w-48" },
                          ].map((header, index) => (
                            <th
                              key={index}
                              className={`px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider ${header.width}`}
                            >
                              {header.name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {files.map((file, idx) => (
                          <tr key={idx} className="hover:bg-white transition-colors">
                            <td className="px-4 py-3">
                              <span className="text-sm font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded">
                                {file.orderId}
                              </span>
                            </td>
                            <td className="px-4 py-3 w-44">
                              <div className="flex items-center space-x-3">
                                <div className={`w-3 h-3 rounded-full ${file.uploadStatus === "Success" ? "bg-green-500" :
                                  file.uploadStatus === "Failed" ? "bg-red-500" :
                                    file.uploadStatus === "Uploading..." ? "bg-yellow-500 animate-pulse" :
                                      "bg-gray-400"
                                  }`}></div>
                                <span className="text-sm text-gray-900 font-medium truncate max-w-sm">
                                  {file.fileName}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center space-x-2">
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full transition-all duration-300 ${file.uploadStatus === "Success" ? "bg-green-500" :
                                      file.uploadStatus === "Failed" ? "bg-red-500" :
                                        "bg-yellow-500"
                                      }`}
                                    style={{ width: `${file.progress}%` }}
                                  ></div>
                                </div>
                                <span className={`text-xs font-medium ${file.uploadStatus === "Success" ? "text-green-600" :
                                  file.uploadStatus === "Failed" ? "text-red-600" :
                                    "text-yellow-600"
                                  }`}>
                                  {file.progress}%
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm text-gray-900">{file.productType}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm text-gray-900 font-medium">{file.unit}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm text-gray-900 font-medium">{file.tooth}</span>
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="text"
                                value={file.message}
                                onChange={(e) => handleMessageChange(file.fileName, e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Add instructions..."
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Delivery Options and Submit Section */}
                <div className="mt-8 bg-gray-50 rounded-xl border border-gray-200 p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Delivery Options */}
                    <div className="lg:col-span-2">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Options</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                          {
                            value: "Rush",
                            label: "Rush Delivery",
                            description: "1-2 Hours",
                            price: "+$50",
                            color: "red"
                          },
                          {
                            value: "Same Day",
                            label: "Same Day",
                            description: "6 Hours",
                            price: "+$25",
                            color: "yellow"
                          },
                          {
                            value: "Next Day",
                            label: "Next Day",
                            description: "12 Hours",
                            price: "Free",
                            color: "green"
                          },
                        ].map((option) => (
                          <label
                            key={option.value}
                            className={`block p-4 border-2 rounded-xl cursor-pointer transition-all ${selectedDuration === option.value
                              ? `border-${option.color}-500 bg-${option.color}-50`
                              : "border-gray-200 hover:border-gray-300"
                              }`}
                          >
                            <input
                              type="radio"
                              name="timeduration"
                              value={option.value}
                              checked={selectedDuration === option.value}
                              onChange={(e) => setSelectedDuration(e.target.value)}
                              className="sr-only"
                            />
                            <div className="text-center">
                              <div className="font-semibold text-gray-900 text-sm">{option.label}</div>
                              <div className="text-xs text-gray-500 mt-1">{option.description}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Submit Section */}
                    <div className="flex flex-col justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Submit Orders</h3>
                        <div className="text-sm text-gray-600 mb-4">
                          {files.some(f => f.uploadStatus === "Uploading...")
                            ? "Please wait for all uploads to complete"
                            : "All files are ready for processing"
                          }
                        </div>
                      </div>
                      <div className="space-y-3">
                        <button
                          onClick={handleSubmit}
                          disabled={files.some(f => f.uploadStatus === "Uploading...") || !selectedDuration}
                          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-lg text-sm transition-all disabled:cursor-not-allowed"
                        >
                          Send for Design
                        </button>
                        {!selectedDuration && (
                          <div className="text-xs text-red-600 text-center">
                            Please select delivery timeframe
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
      <Foot />
    </>
  );
}