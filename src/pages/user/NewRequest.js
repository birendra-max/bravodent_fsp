import { useContext, useState } from "react";
import Hd from "./Hd";
import Foot from "./Foot";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../../Context/ThemeContext";
import { UserContext } from "../../Context/UserContext";
import { fetchWithAuth } from '../../utils/userapi';

export default function NewRequest() {
  let base_url = localStorage.getItem('base_url');
  const { theme } = useContext(ThemeContext);
  const { user, logout } = useContext(UserContext);
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [drag, setDragActive] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState("");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [uploadRequests, setUploadRequests] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false); // Added missing state

  const handleFiles = (selectedFiles) => {
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

  const token = localStorage.getItem('token');

  const uploadFile = async (file) => {
    try {
      const checkResponse = await fetchWithAuth(`check-file-exists?file=${encodeURIComponent(file.name)}`);

      if (checkResponse.message === 'File already exists') {
        const confirmUpload = window.confirm(
          `The file "${file.name}" already exists.\nDo you want to proceed with uploading?`
        );

        if (!confirmUpload) {
          setFiles((prev) =>
            prev.map((f) =>
              f.fileName === file.name
                ? { ...f, uploadStatus: "Cancelled", progress: 0 }
                : f
            )
          );
          return;
        }
      }
    } catch (err) {
      // Error handling for check exists API
    }

    setFiles((prev) =>
      prev.map((f) =>
        f.fileName === file.name
          ? { ...f, uploadStatus: "Uploading... 0%", progress: 0 }
          : f
      )
    );

    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("userid", user.userid);
      formData.append("labname", user.labname);

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setFiles((prev) =>
            prev.map((f) =>
              f.fileName === file.name
                ? {
                  ...f,
                  progress: percentComplete,
                  uploadStatus: `Uploading... ${percentComplete}%`
                }
                : f
            )
          );
        }
      });

      xhr.addEventListener('load', async () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const result = JSON.parse(xhr.responseText);
            setFiles((prev) =>
              prev.map((f) =>
                f.fileName === file.name
                  ? {
                    ...f,
                    progress: 100,
                    uploadStatus: "Success",
                    orderId: result.id,
                    productType: result.product_type,
                    unit: result.unit,
                    tooth: result.tooth,
                    message: result.message
                  }
                  : f
              )
            );
            resolve(result);
          } catch (error) {
            setFiles((prev) =>
              prev.map((f) =>
                f.fileName === file.name
                  ? {
                    ...f,
                    progress: 100,
                    uploadStatus: "Failed",
                    message: "Invalid response from server"
                  }
                  : f
              )
            );
            reject(error);
          }
        } else {
          setFiles((prev) =>
            prev.map((f) =>
              f.fileName === file.name
                ? {
                  ...f,
                  progress: 100,
                  uploadStatus: "Failed",
                  message: `Server error: ${xhr.status}`
                }
                : f
            )
          );
          reject(new Error(`Server error: ${xhr.status}`));
        }

        setUploadRequests(prev => {
          const newRequests = { ...prev };
          delete newRequests[file.name];
          return newRequests;
        });
      });

      xhr.addEventListener('error', () => {
        setFiles((prev) =>
          prev.map((f) =>
            f.fileName === file.name
              ? {
                ...f,
                progress: 100,
                uploadStatus: "Failed",
                message: "Network error"
              }
              : f
          )
        );
        reject(new Error('Network error'));

        setUploadRequests(prev => {
          const newRequests = { ...prev };
          delete newRequests[file.name];
          return newRequests;
        });
      });

      xhr.open('POST', `${base_url}/new-orders`);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.setRequestHeader('X-Tenant', 'bravodent');
      xhr.timeout = 300000;
      xhr.send(formData);

      setUploadRequests(prev => ({ ...prev, [file.name]: xhr }));
    });
  };

  const cancelUpload = (fileName) => {
    if (uploadRequests[fileName]) {
      uploadRequests[fileName].abort();
      setFiles(prev =>
        prev.map(f =>
          f.fileName === fileName
            ? { ...f, uploadStatus: "Cancelled", progress: 0 }
            : f
        )
      );

      setUploadRequests(prev => {
        const newRequests = { ...prev };
        delete newRequests[fileName];
        return newRequests;
      });
    }
  };

  const cancelOrder = async (orderId, fileName) => {
    if (!orderId || orderId === "-") {
      cancelUpload(fileName);
      return;
    }

    try {
      setFiles(prev =>
        prev.map(f =>
          f.fileName === fileName
            ? { ...f, uploadStatus: "Cancelling..." }
            : f
        )
      );

      const response = await fetchWithAuth(`/cancel-order/${orderId}`);
      const result = response;
      if (result.status === 'success') {
        setFiles(prev =>
          prev.map(f =>
            f.fileName === fileName
              ? { ...f, uploadStatus: "Cancelled", message: "Order cancelled successfully" }
              : f
          )
        );
      } else {
        setFiles(prev =>
          prev.map(f =>
            f.fileName === fileName
              ? { ...f, uploadStatus: "Failed", message: `Failed to cancel: ${result.message || 'Unknown error'}` }
              : f
          )
        );
      }
    } catch (error) {
      setFiles(prev =>
        prev.map(f =>
          f.fileName === fileName
            ? { ...f, uploadStatus: "Failed", message: `Network error: ${error.message}` }
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

  const resetPage = () => {
    setFiles([]);
    setSelectedDuration("");
    setShowSuccessPopup(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedDuration) {
      alert("Please select a time duration");
      return;
    }

    setIsSubmitting(true); // Start loading

    const filesWithDuration = files.map(file => ({
      ...file,
      tduration: selectedDuration
    }));

    try {
      const response = await fetch(`${base_url}/new-orders-data`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`,
          'X-Tenant': 'bravodent'
        },
        body: JSON.stringify(filesWithDuration),
      });

      const resp = await response.json();
      if (resp.status === 'completed') {
        if (resp.results.length === files.length) {
          setShowSuccessPopup(true);
          setTimeout(() => {
            resetPage();
          }, 3000);
        }
      } else {
        if (resp.error === 'Invalid or expired token') {
          alert('Invalid or expired token. Please log in again.')
          navigate('/login');
        } else {
          alert(`Submission failed: ${resp.message || 'Unknown error'}`);
        }
      }

    } catch (error) {
      alert(`Submission error: ${error.message}`);
    } finally {
      setIsSubmitting(false); // End loading
    }
  };

  const canSubmit = files.length > 0 &&
    files.some(f => f.uploadStatus === "Success") &&
    !files.some(f => f.uploadStatus.startsWith("Uploading...")) &&
    selectedDuration;

  const getCardClass = () => {
    return theme === 'light'
      ? 'bg-white border-gray-200'
      : 'bg-gray-800 border-gray-700';
  };

  const getUploadAreaClass = () => {
    const baseClass = "border-3 min-h-[75vh] flex justify-center items-center flex-col border-dashed rounded-2xl p-12 text-center transition-all duration-200";

    if (theme === 'light') {
      return drag
        ? `${baseClass} border-blue-500 bg-blue-50 scale-[1.02] text-gray-900`
        : `${baseClass} border-gray-300 hover:border-blue-400 hover:bg-blue-25 text-gray-900`;
    } else {
      return drag
        ? `${baseClass} border-blue-500 bg-blue-900/20 scale-[1.02] text-white`
        : `${baseClass} border-gray-600 hover:border-blue-400 hover:bg-gray-800 text-white`;
    }
  };

  const getTableContainerClass = () => {
    return theme === 'light'
      ? 'bg-gray-50 border-gray-200'
      : 'bg-gray-800 border-gray-700';
  };

  const getTableHeaderClass = () => {
    return theme === 'light'
      ? 'text-gray-700 bg-gray-100'
      : 'text-gray-300 bg-gray-700';
  };

  const getTableRowClass = () => {
    return theme === 'light'
      ? 'hover:bg-white text-gray-900'
      : 'hover:bg-gray-700 text-white';
  };

  const getInputClass = () => {
    return theme === 'light'
      ? 'border-gray-300 bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500'
      : 'border-gray-600 bg-gray-700 text-white focus:ring-blue-500 focus:border-blue-500';
  };

  const StatusBadge = ({ status, message, progress }) => {
    const getStatusConfig = (status) => {
      const lightConfig = {
        Success: {
          bgColor: "bg-gradient-to-r from-green-50 to-green-100",
          textColor: "text-green-700",
          borderColor: "border-green-200",
        },
        Failed: {
          bgColor: "bg-gradient-to-r from-red-50 to-red-100",
          textColor: "text-red-700",
          borderColor: "border-red-200",
        },
        "Uploading...": {
          bgColor: "bg-gradient-to-r from-blue-50 to-blue-100",
          textColor: "text-blue-700",
          borderColor: "border-blue-200",
        },
        "Waiting...": {
          bgColor: "bg-gradient-to-r from-gray-50 to-gray-100",
          textColor: "text-gray-700",
          borderColor: "border-gray-200",
        },
        "Cancelled": {
          bgColor: "bg-gradient-to-r from-gray-50 to-gray-100",
          textColor: "text-gray-700",
          borderColor: "border-gray-200",
        },
        "Cancelling...": {
          bgColor: "bg-gradient-to-r from-yellow-50 to-yellow-100",
          textColor: "text-yellow-700",
          borderColor: "border-yellow-200",
        }
      };

      const darkConfig = {
        Success: {
          bgColor: "bg-gradient-to-r from-green-900/20 to-green-800/20",
          textColor: "text-green-400",
          borderColor: "border-green-700",
        },
        Failed: {
          bgColor: "bg-gradient-to-r from-red-900/20 to-red-800/20",
          textColor: "text-red-400",
          borderColor: "border-red-700",
        },
        "Uploading...": {
          bgColor: "bg-gradient-to-r from-blue-900/20 to-blue-800/20",
          textColor: "text-blue-400",
          borderColor: "border-blue-700",
        },
        "Waiting...": {
          bgColor: "bg-gradient-to-r from-gray-700 to-gray-800",
          textColor: "text-gray-400",
          borderColor: "border-gray-600",
        },
        "Cancelled": {
          bgColor: "bg-gradient-to-r from-gray-700 to-gray-800",
          textColor: "text-gray-400",
          borderColor: "border-gray-600",
        },
        "Cancelling...": {
          bgColor: "bg-gradient-to-r from-yellow-900/20 to-yellow-800/20",
          textColor: "text-yellow-400",
          borderColor: "border-yellow-700",
        }
      };

      const config = theme === 'light' ? lightConfig[status] : darkConfig[status];

      return {
        ...config,
        shadow: "shadow-sm",
        icon: (
          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${status === "Success" ? "bg-green-500" :
            status === "Failed" ? "bg-red-500" :
              status === "Cancelled" ? "bg-gray-500" :
                status === "Cancelling..." ? "bg-yellow-500" :
                  status.startsWith("Uploading...") ? "bg-blue-500" :
                    "bg-gray-400"
            }`}>
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {status === "Success" && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />}
              {status === "Failed" && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />}
              {status === "Cancelled" && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M18 6L6 18M6 6l12 12" />}
              {status.startsWith("Uploading...") && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />}
              {status === "Waiting..." && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />}
            </svg>
          </div>
        )
      };
    };

    // For Uploading status, show progress bar ONLY
    if (status.startsWith("Uploading...")) {
      return (
        <div className="w-full">
          <div
            className="progress-bar bg-success rounded overflow-hidden"
            role="progressbar"
            style={{
              width: `${progress}%`,
              height: '40px',
              padding: '10px',
              whiteSpace: 'pre-wrap',
              backgroundColor: '#28a745',
              color: 'white',
              fontWeight: '500',
              fontSize: '13px',
              textAlign: 'center',
              transition: 'width 0.3s ease-in-out'
            }}
          >
            {progress}% {progress === 100 ? 'Completed' : ''}
          </div>
        </div>
      );
    }

    // For all other statuses, show the regular status badge
    const config = getStatusConfig(status.split(' ')[0]);

    return (
      <div className="flex flex-col space-y-2">
        <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-semibold border ${config.bgColor} ${config.textColor} ${config.borderColor} ${config.shadow} transition-all duration-200`}>
          {config.icon}
          <span className="font-medium">
            {status}
          </span>
        </div>
        {(status === "Failed" || status === "Cancelled") && message && (
          <div className={`flex items-start space-x-2 text-xs px-3 py-2 rounded-lg border ${theme === 'light'
            ? status === "Failed" ? 'text-red-600 bg-red-50 border-red-200' : 'text-gray-600 bg-gray-50 border-gray-200'
            : status === "Failed" ? 'text-red-400 bg-red-900/20 border-red-700' : 'text-gray-400 bg-gray-900/20 border-gray-700'
            }`}>
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="flex-1">{message}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Hd />
      <main id="main" className={`flex-grow px-2 transition-colors duration-300 ${theme === 'light' ? 'bg-white text-black' : 'bg-black text-white'} pt-16 sm:pt-18`}>
        {showSuccessPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`rounded-xl p-8 max-w-md mx-4 shadow-2xl ${theme === 'light' ? 'bg-white text-gray-900' : 'bg-gray-800 text-white'}`}>
              <div className="text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${theme === 'light' ? 'bg-green-100' : 'bg-green-900/20'}`}>
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Success!</h3>
                <p className={`mb-6 ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>
                  All orders have been successfully submitted for design.
                </p>
                <button
                  onClick={resetPage}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                >
                  Upload More Files
                </button>
              </div>
            </div>
          </div>
        )}

        <section className={theme === 'light' ? 'bg-gray-50' : 'bg-black'}>
          <div className="max-w-full mx-auto mt-4">
            <div className={`rounded-xl shadow-lg border ${getCardClass()}`}>
              {files.length === 0 && (
                <div className="p-6">
                  <div
                    className={getUploadAreaClass()}
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
                    <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${theme === 'light' ? 'bg-blue-100' : 'bg-blue-900/20'}`}>
                      <svg className={`w-10 h-10 ${theme === 'light' ? 'text-blue-600' : 'text-blue-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold mb-3">
                      {drag ? "Drop files to upload" : "Upload Order Files"}
                    </h3>
                    <p className={`mb-6 max-w-md mx-auto ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                      Drag and drop your ZIP files here or click the button below. Supported format: .zip only
                    </p>
                    <label className={`inline-flex items-center px-8 py-3 font-semibold rounded-lg shadow-sm cursor-pointer transition-colors ${theme === 'light'
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-blue-700 hover:bg-blue-600 text-white'
                      }`}>
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

              {files.length > 0 && (
                <div className="p-2">
                  <div className={`rounded-lg border ${getTableContainerClass()}`}>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className={`border-b ${theme === 'light' ? 'border-gray-200' : 'border-gray-700'}`}>
                            {[
                              { name: "ORDER ID", width: "w-25" },
                              { name: "FILE NAME", width: "w-62" },
                              { name: "STATUS", width: "w-48" },
                              { name: "PRODUCT TYPE", width: "w-32" },
                              { name: "UNIT", width: "w-20" },
                              { name: "TOOTH", width: "w-30" },
                              { name: "ACTION", width: "w-20" },
                              { name: "MESSAGE", width: "w-48" },
                            ].map((header, index) => (
                              <th
                                key={index}
                                className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider ${header.width} ${getTableHeaderClass()}`}
                              >
                                {header.name}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className={`divide-y ${theme === 'light' ? 'divide-gray-200' : 'divide-gray-700'}`}>
                          {files.map((file, idx) => (
                            <tr key={idx} className={getTableRowClass()}>
                              <td className="px-4 py-3">
                                <span className={`text-sm font-medium px-2 py-1 rounded ${theme === 'light' ? 'bg-gray-100 text-gray-900' : 'bg-gray-700 text-white'}`}>
                                  {file.orderId}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center space-x-3">
                                  <div className={`w-2 h-2 rounded-full ${file.uploadStatus === "Success" ? "bg-green-500" :
                                    file.uploadStatus === "Failed" ? "bg-red-500" :
                                      file.uploadStatus === "Cancelled" ? "bg-gray-500" :
                                        file.uploadStatus === "Cancelling..." ? "bg-yellow-500" :
                                          file.uploadStatus.startsWith("Uploading...") ? "bg-blue-500 animate-pulse" :
                                            "bg-gray-400"
                                    }`}></div>
                                  <span className="text-[13px] font-medium break-all whitespace-normal word-break break-words max-w-[400px]">
                                    {file.fileName}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <StatusBadge status={file.uploadStatus} message={file.message} progress={file.progress} />
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-[13px]">{file.productType}</span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-sm font-medium">{file.unit}</span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-sm font-medium break-all">{file.tooth}</span>
                              </td>
                              <td className="px-4 py-3">
                                <button
                                  onClick={() => cancelOrder(file.orderId, file.fileName)}
                                  disabled={file.uploadStatus === "Cancelled" || file.uploadStatus === "Cancelling..."}
                                  className={`px-3 py-1.5 text-md font-semibold rounded transition-colors ${file.uploadStatus === "Cancelled" || file.uploadStatus === "Cancelling..."
                                    ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                                    : "bg-red-600 text-white hover:bg-red-700 cursor-pointer"
                                    }`}
                                >
                                  {file.uploadStatus === "Cancelling..." ? "Cancelling..." : "Cancel"}
                                </button>
                              </td>
                              <td className="px-4 py-3">
                                <input
                                  type="text"
                                  value={file.message}
                                  onChange={(e) => handleMessageChange(file.fileName, e.target.value)}
                                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${getInputClass()}`}
                                  placeholder="Add instructions..."
                                  disabled={file.uploadStatus === "Cancelled" || file.uploadStatus === "Cancelling..."}
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className={`mt-4 rounded-xl border-2 p-2 w-3/4 mx-auto ${getTableContainerClass()}`}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="flex justify-center">
                        <div className="w-full max-w-4xl">
                          <h2 className={`text-lg font-bold mb-4 text-left ${theme === "light" ? "text-gray-900" : "text-white"} ml-12`}>Choose Your Delivery Option</h2>
                          <div className="flex justify-around items-center space-x-2">
                            <label className={`flex flex-col items-center cursor-pointer group p-2 rounded-md transition-all duration-300 ${theme === "light" ? "hover:bg-gray-200" : "hover:bg-gray-800"}`}>
                              <div className="relative mb-1.5">
                                <input
                                  type="radio"
                                  name="timeduration"
                                  value="Rush"
                                  checked={selectedDuration === "Rush"}
                                  onChange={(e) => setSelectedDuration(e.target.value)}
                                  className="sr-only"
                                />
                                <div className={`w-6 h-6 rounded-full border-3 flex items-center justify-center transition-all duration-300 ${selectedDuration === "Rush"
                                  ? "border-blue-600 bg-blue-600 shadow-md"
                                  : theme === "light"
                                    ? "border-gray-400 bg-white group-hover:border-blue-500 group-hover:shadow-sm"
                                    : "border-gray-500 bg-gray-700 group-hover:border-blue-500 group-hover:shadow-sm"
                                  }`}>
                                  {selectedDuration === "Rush" && (
                                    <div className="w-4 h-4 bg-white rounded-full animate-pulse"></div>
                                  )}
                                </div>
                              </div>
                              <span className={`text-sm font-semibold text-center ${theme === "light" ? "text-gray-900" : "text-white"}`}>Rush</span>
                              <span className={`text-xs text-center flex items-center mt-0.5 ${theme === "light" ? "text-gray-600" : "text-gray-400"}`}>
                                <i className="fas fa-bolt mr-1 text-yellow-500 text-xs"></i> 1-2 Hours
                              </span>
                            </label>

                            <label className={`flex flex-col items-center cursor-pointer group p-2 rounded-md transition-all duration-300 ${theme === "light" ? "hover:bg-gray-200" : "hover:bg-gray-800"}`}>
                              <div className="relative mb-1.5">
                                <input
                                  type="radio"
                                  name="timeduration"
                                  value="Same Day"
                                  checked={selectedDuration === "Same Day"}
                                  onChange={(e) => setSelectedDuration(e.target.value)}
                                  className="sr-only"
                                />
                                <div className={`w-6 h-6 rounded-full border-3 flex items-center justify-center transition-all duration-300 ${selectedDuration === "Same Day"
                                  ? "border-blue-600 bg-blue-600 shadow-md"
                                  : theme === "light"
                                    ? "border-gray-400 bg-white group-hover:border-blue-500 group-hover:shadow-sm"
                                    : "border-gray-500 bg-gray-700 group-hover:border-blue-500 group-hover:shadow-sm"
                                  }`}>
                                  {selectedDuration === "Same Day" && (
                                    <div className="w-4 h-4 bg-white rounded-full animate-pulse"></div>
                                  )}
                                </div>
                              </div>
                              <span className={`text-sm font-semibold text-center ${theme === "light" ? "text-gray-900" : "text-white"}`}>Same Day</span>
                              <span className={`text-xs text-center flex items-center mt-0.5 ${theme === "light" ? "text-gray-600" : "text-gray-400"}`}>
                                <i className="fas fa-clock mr-1 text-blue-500 text-xs"></i> 6 Hours
                              </span>
                            </label>

                            <label className={`flex flex-col items-center cursor-pointer group p-2 rounded-md transition-all duration-300 ${theme === "light" ? "hover:bg-gray-200" : "hover:bg-gray-800"}`}>
                              <div className="relative mb-1.5">
                                <input
                                  type="radio"
                                  name="timeduration"
                                  value="Next Day"
                                  checked={selectedDuration === "Next Day"}
                                  onChange={(e) => setSelectedDuration(e.target.value)}
                                  className="sr-only"
                                />
                                <div className={`w-6 h-6 rounded-full border-3 flex items-center justify-center transition-all duration-300 ${selectedDuration === "Next Day"
                                  ? "border-blue-600 bg-blue-600 shadow-md"
                                  : theme === "light"
                                    ? "border-gray-400 bg-white group-hover:border-blue-500 group-hover:shadow-sm"
                                    : "border-gray-500 bg-gray-700 group-hover:border-blue-500 group-hover:shadow-sm"
                                  }`}>
                                  {selectedDuration === "Next Day" && (
                                    <div className="w-4 h-4 bg-white rounded-full animate-pulse"></div>
                                  )}
                                </div>
                              </div>
                              <span className={`text-sm font-semibold text-center ${theme === "light" ? "text-gray-900" : "text-white"}`}>Next Day</span>
                              <span className={`text-xs text-center flex items-center mt-0.5 ${theme === "light" ? "text-gray-600" : "text-gray-400"}`}>
                                <i className="fas fa-calendar-alt mr-1 text-green-500 text-xs"></i> 12 Hours
                              </span>
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col justify-center items-center">
                        <div className="w-full max-w-sm">
                          <h3 className={`text-md font-semibold mb-3 text-left ${theme === "light" ? "text-gray-900" : "text-white"}`}>Submit Your Order</h3>
                          <div className={`text-xs mb-3 text-center leading-relaxed p-2 rounded-md ${isSubmitting
                            ? theme === "light" ? "text-blue-700 bg-blue-100" : "text-blue-300 bg-blue-900/30"
                            : files.some(f => f.uploadStatus.startsWith("Uploading..."))
                              ? theme === "light" ? "text-yellow-700 bg-yellow-100" : "text-yellow-300 bg-yellow-900/30"
                              : !files.some(f => f.uploadStatus === "Success")
                                ? theme === "light" ? "text-red-700 bg-red-100" : "text-red-300 bg-red-900/30"
                                : canSubmit
                                  ? theme === "light" ? "text-green-700 bg-green-100" : "text-green-300 bg-green-900/30"
                                  : theme === "light" ? "text-gray-700 bg-gray-100" : "text-gray-300 bg-gray-900/30"
                            }`}>
                            {isSubmitting
                              ? "🔄 Submitting your order, please wait..."
                              : files.some(f => f.uploadStatus.startsWith("Uploading..."))
                                ? "⏳ Please wait for all uploads to complete before proceeding."
                                : !files.some(f => f.uploadStatus === "Success")
                                  ? "❌ No files successfully uploaded. Please check and retry failed uploads."
                                  : !selectedDuration
                                    ? "📋 Please select a delivery timeframe to continue."
                                    : files.some(f => f.uploadStatus === "Failed")
                                      ? "⚠️ Some files failed, but you can submit the successful ones."
                                      : "✅ All files are ready for processing. You're all set!"
                            }
                          </div>
                          <div className="space-y-2">
                            <button
                              onClick={handleSubmit}
                              disabled={!canSubmit || isSubmitting}
                              className={`w-full font-bold py-2.5 px-5 rounded-lg text-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-1 ${canSubmit && !isSubmitting
                                ? "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg transform hover:scale-[1.02] focus:ring-blue-300"
                                : theme === "light"
                                  ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                                  : "bg-gray-600 text-gray-400 cursor-not-allowed"
                                }`}
                              aria-label="Submit Order for Design"
                            >
                              {isSubmitting ? (
                                <span className="flex items-center justify-center">
                                  <svg className="animate-spin w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Processing...
                                </span>
                              ) : canSubmit ? (
                                <span className="flex items-center justify-center">
                                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                  </svg>
                                  Send for Design
                                </span>
                              ) : (
                                "Send for Design"
                              )}
                            </button>
                            {files.some(f => f.uploadStatus === "Failed") && canSubmit && (
                              <div className={`text-xs text-center py-1 px-2.5 rounded-sm shadow-sm ${theme === "light"
                                ? "text-yellow-700 bg-yellow-100 border border-yellow-200"
                                : "text-yellow-300 bg-yellow-900/30 border border-yellow-700"
                                }`}>
                                ⚠️ Only successful files will be submitted
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <Foot />
    </>
  );
}