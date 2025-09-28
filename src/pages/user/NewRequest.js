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
      alert("Only .zip files are allowed!");
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
                orderId: result.id || "-",
                productType: result.product_type || "-",
                unit: result.unit || "-",
                tooth: result.tooth || "-",
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
              </div>
            </div>

            {/* Drag & Drop Area */}
            {files.length === 0 && (
              <div className="p-4">
                <div
                  className={`min-h-[70vh] flex justify-center items-center relative border-2 border-dashed rounded-2xl transition-all duration-300 ${
                    drag
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
                    <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                      Drop your files here
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Supports ZIP files only. Maximum file size: 100MB
                    </p>

                    <label className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg shadow-lg cursor-pointer">
                      Browse Files
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
              </div>
            )}

            {/* Upload Table */}
            {files.length > 0 && (
              <div className="p-8">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gradient-to-r from-gray-100 to-gray-200">
                      <tr>
                        {[
                          "ID",
                          "File Name",
                          "Progress",
                          "Product Type",
                          "Unit",
                          "Tooth",
                          "Message",
                        ].map((header) => (
                          <th
                            key={header}
                            className="px-6 py-4 text-left font-semibold text-gray-700 text-base"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200 text-xs">
                      {files.map((file, idx) => (
                        <tr
                          key={idx}
                          className="hover:bg-blue-50/50 transition-colors duration-200"
                        >
                          <td className="px-6 py-4">{file.orderId}</td>
                          <td className="px-6 py-4 break-all w-72">
                            {file.fileName}
                          </td>

                          {/* Custom Progress Bar */}
                          <td className="px-6 py-4">
                            <div className="relative w-full bg-gray-200 rounded-sm h-6 overflow-hidden shadow-inner">
                              <div
                                className={`absolute top-0 left-0 h-full rounded-sm transition-all duration-500 ease-out ${
                                  file.uploadStatus === "Success"
                                    ? "bg-gradient-to-r from-green-400 to-green-600"
                                    : file.uploadStatus === "Failed"
                                    ? "bg-gradient-to-r from-red-400 to-red-600"
                                    : "bg-gradient-to-r from-blue-500 to-purple-600 animate-pulse"
                                }`}
                                style={{ width: `${file.progress}%` }}
                              ></div>
                              <span className="absolute w-full text-center text-white font-semibold text-sm z-10">
                                {file.progress}%
                              </span>
                            </div>
                            <span className="text-xs mt-1 block">
                              {file.uploadStatus}
                            </span>
                          </td>

                          <td className="px-6 py-4 break-all w-44">
                            {file.productType}
                          </td>
                          <td className="px-6 py-4 w-24">{file.unit}</td>
                          <td className="px-6 py-4 w-24">{file.tooth}</td>
                          <td className="px-6 py-4 w-72">
                            <input
                              type="text"
                              value={file.message}
                              onChange={(e) =>
                                handleMessageChange(file.fileName, e.target.value)
                              }
                              className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                              placeholder="Add note..."
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
