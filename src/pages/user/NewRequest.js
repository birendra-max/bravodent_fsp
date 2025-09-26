import React, { useContext, useState } from "react";
import Hd from './Hd';
import Foot from './Foot';
import { UserContext } from "../../Context/UserContext";

export default function NewRequest() {
    const { user } = useContext(UserContext);
    const [files, setFiles] = useState([]);
    const [drag, setdragActive] = useState(false);

    // ✅ Handle files (only zip allowed)
    const handleFiles = (selectedFiles) => {
        const fileArray = Array.from(selectedFiles);
        const zipFiles = fileArray.filter(file => file.name.endsWith(".zip"));

        if (zipFiles.length !== fileArray.length) {
            alert("Only .zip files are allowed!");
        }

        setFiles(prev => [...prev, ...zipFiles]);
        console.log("Accepted files:", zipFiles);
    };

    // ✅ Handle file drop
    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setdragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
        }
    };

    return (
        <>
            <Hd />
            <section className="mt-18 py-4 px-4 flex justify-center items-center">
                <form
                    action=""
                    method="post"
                    encType="multipart/form-data"
                    className="flex items-center justify-center w-full"
                >
                    <div className="w-full max-w-full">
                        {/* <!-- File Upload Card --> */}
                        <div className="bg-gray-800 text-white shadow-lg border border-gray-700 p-8">
                            <h2 className="text-xl font-bold mb-6 text-center">Upload Your Orders</h2>

                            {/* <!-- Drag & Drop --> */}
                            <div
                                id="drag_drop"
                                className={`w-full max-w-full min-h-[65vh] p-10 border-2 border-dashed rounded-xl text-center flex justify-center items-center flex-col transition ${drag ? "border-indigo-500 bg-indigo-50" : "border-gray-400"}`}
                                onDragEnter={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setdragActive(true);
                                }}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                }}
                                onDragLeave={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setdragActive(false);
                                }}
                                onDrop={handleDrop}
                            >
                                <p className="text-gray-300 font-medium">Drag & Drop ZIP File Here</p>
                                <p className="text-sm text-gray-400">or</p>
                                <label className="mt-4 inline-flex items-center px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow cursor-pointer transition">
                                    <i className="fas fa-paperclip mr-2"></i> Browse Files
                                    <input
                                        type="file"
                                        id="selectfile"
                                        accept=".zip"
                                        multiple
                                        className="hidden"
                                        onChange={(e) => handleFiles(e.target.files)}
                                    />
                                </label>
                            </div>
                        </div>

                        {/* <!-- Hidden input --> */}
                        <input type="hidden" name="total_files" id="total_files" />

                        {/* <!-- Show selected files --> */}
                        {files.length > 0 && (
                            <div className="mt-6 bg-white text-gray-800 p-4 rounded-lg shadow">
                                <h3 className="font-semibold mb-2">Selected ZIP Files:</h3>
                                <ul className="list-disc list-inside text-sm">
                                    {files.map((file, index) => (
                                        <li key={index}>{file.name}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* <!-- Time Options --> */}
                        <div id="timed" className="mt-10 hidden">
                            <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">
                                Select Time Duration
                            </h3>
                            <div className="flex justify-center gap-8">
                                <label className="flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-300 hover:border-indigo-500 hover:bg-indigo-50 cursor-pointer transition">
                                    <input type="radio" name="timeduration" value="Rush" className="form-radio text-indigo-600" />
                                    <span className="text-gray-700 font-medium">
                                        <i className="fas fa-ambulance text-red-500 mr-1"></i> Rush (1–2 Hours)
                                    </span>
                                </label>
                                <label className="flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-300 hover:border-indigo-500 hover:bg-indigo-50 cursor-pointer transition">
                                    <input type="radio" name="timeduration" value="Same Day" className="form-radio text-indigo-600" />
                                    <span className="text-gray-700 font-medium">
                                        <i className="fas fa-ambulance text-yellow-500 mr-1"></i> Same Day (6 Hours)
                                    </span>
                                </label>
                                <label className="flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-300 hover:border-indigo-500 hover:bg-indigo-50 cursor-pointer transition">
                                    <input type="radio" name="timeduration" value="Next Day" className="form-radio text-indigo-600" />
                                    <span className="text-gray-700 font-medium">
                                        <i className="fas fa-ambulance text-green-500 mr-1"></i> Next Day (12 Hours)
                                    </span>
                                </label>
                            </div>
                        </div>

                        {/* <!-- Submit --> */}
                        <div className="flex justify-center mt-12">
                            <input
                                type="submit"
                                name="submit"
                                id="sbtbtn"
                                value="Send For Design"
                                className="hidden px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl shadow transition"
                            />
                        </div>
                    </div>
                </form>
            </section>
            <Foot />
        </>
    );
}
