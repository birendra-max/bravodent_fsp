import { useState, useRef, useEffect, useContext } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faUser, faVideo, faTimes, faFile, faDownload,
    faPaperclip, faPaperPlane
} from "@fortawesome/free-solid-svg-icons";
import { DesignerContext } from '../Context/DesignerContext';
import { useNavigate } from 'react-router-dom';

export default function Dchatbox({ orderid }) {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const { designer: currentDesigner, logout } = useContext(DesignerContext);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isOnline, setIsOnline] = useState(true);
    const fileInputRef = useRef(null);
    const chatBodyRef = useRef(null);
    const chatboxRef = useRef(null);
    const posRef = useRef({ x: 0, y: 0, left: 0, top: 0 });

    // Reset messages when orderid changes
    useEffect(() => {
        setMessages([]); // Clear previous messages
        setNewMessage(''); // Clear input field
    }, [orderid]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }
    }, [messages]);

    // Fetch messages when chatbox opens or orderid changes
    useEffect(() => {
        if (orderid && currentDesigner?.desiid) {
            // Clear messages first to avoid showing old messages during fetch
            setMessages([]);

            fetch(`http://localhost/bravodent_ci/get-chat/${orderid}`, {
                method: "GET",
                headers: {
                    'Content-Type': "application/json",
                    "Authorization": `Bearer ${token}`
                },
            })
                .then(res => res.json())
                .then(data => {
                    if (data.status === 'success') {
                        // Map the fetched messages to ensure consistent structure
                        const formattedMessages = data.data.map(msg => ({
                            ...msg,
                            // Ensure we have the correct field for alignment
                            user_type: msg.user_type || (msg.sender === currentDesigner.desiid ? 'designer' : 'other'),
                            // Ensure file data is properly handled
                            fileSize: msg.file_size || msg.fileSize,
                            filePath: msg.file_path || msg.filePath,
                            fileName: msg.filename || msg.fileName || msg.text
                        }));
                        setMessages(formattedMessages);
                    } else {
                        // If no messages or error, set empty array
                        setMessages([]);
                        if (data.error === 'Invalid or expired token') {
                            alert('Invalid or expired token. Please log in again.')
                            navigate(logout);
                        }
                    }
                })
                .catch(err => {
                    console.error("Error fetching messages:", err);
                    setMessages([]); // Clear on error
                });
        } else {
            // If no orderid or designer, clear messages
            setMessages([]);
        }
    }, [orderid, currentDesigner]); // This will re-run when orderid changes

    // Enable dragging
    useEffect(() => {
        const chatbox = chatboxRef.current;
        const header = document.getElementById("dchatHeader");

        const mouseDownHandler = (e) => {
            posRef.current = {
                x: e.clientX,
                y: e.clientY,
                left: chatbox.offsetLeft,
                top: chatbox.offsetTop
            };
            document.addEventListener("mousemove", mouseMoveHandler);
            document.addEventListener("mouseup", mouseUpHandler);
        };

        const mouseMoveHandler = (e) => {
            const dx = e.clientX - posRef.current.x;
            const dy = e.clientY - posRef.current.y;
            chatbox.style.left = `${posRef.current.left + dx}px`;
            chatbox.style.top = `${posRef.current.top + dy}px`;
        };

        const mouseUpHandler = () => {
            document.removeEventListener("mousemove", mouseMoveHandler);
            document.removeEventListener("mouseup", mouseUpHandler);
        };

        header.addEventListener("mousedown", mouseDownHandler);

        return () => {
            header.removeEventListener("mousedown", mouseDownHandler);
        };
    }, []);

    // Helper function to determine if message is from current designer
    const isCurrentUserMessage = (message) => {
        return message.user_type === 'designer' || message.sender === currentDesigner.desiid;
    };

    // Download file function
    const downloadFile = (filePath, fileName) => {
        if (!filePath) {
            console.error("No file path provided");
            return;
        }

        // Create a temporary anchor element to trigger download
        const link = document.createElement('a');
        link.href = `${filePath}`;
        link.download = fileName || 'download';
        link.target = '_blank';

        // Append to body, click, and remove
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const sendMessage = () => {
        if (newMessage.trim() && orderid) {
            const message = {
                orderid: orderid,
                text: newMessage.trim(),
                sender: currentDesigner.desiid,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                user_type: 'designer' // ✅ Add user_type for consistent alignment
            };

            // Add the new message to local state
            setMessages(prev => [...prev, { ...message, id: Date.now() }]);
            setNewMessage('');

            // Send to backend
            fetch('http://localhost/bravodent_ci/send-message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(message)
            })
                .then(res => res.json())
                .then(data => {
                    if (data.error === 'Invalid or expired token') {
                        alert('Invalid or expired token. Please log in again.')
                        navigate(logout);
                    }
                    console.log("Message saved:", data);
                })
                .catch(err => console.error("Error sending message:", err));
        }
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file && orderid) {
            const chatData = new FormData();
            chatData.append('orderid', orderid);
            chatData.append('text', file.name);
            chatData.append('sender', currentDesigner.desiid);
            chatData.append('timestamp', new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
            chatData.append('chatfile', file); // ✅ important: name must match backend

            // Create temporary message with file preview data
            const tempId = Date.now(); // Store the ID separately
            const tempMessage = {
                id: tempId, // Temporary ID
                orderid,
                text: file.name,
                sender: currentDesigner.desiid,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                fileSize: formatFileSize(file.size),
                fileName: file.name,
                user_type: 'designer',
                // Temporary file preview (will be replaced by backend response)
                isUploading: true,
                file_path: null // Will be updated when backend responds
            };

            // Add temporary message to UI immediately
            setMessages(prev => [...prev, tempMessage]);
            event.target.value = '';

            // Upload file to backend
            fetch('http://localhost/bravodent_ci/chat-file', {
                method: 'POST',
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                body: chatData,
            })
                .then(res => res.json())
                .then(response => {
                    console.log("✅ File uploaded successfully:", response);

                    // Update the temporary message with actual backend data
                    if (response.status === 'success' && response.data) {
                        setMessages(prev => prev.map(msg =>
                            msg.id === tempId
                                ? {
                                    ...msg,
                                    file_path: response.data.file_path,
                                    filename: response.data.filename || file.name,
                                    file_size: response.data.file_size || file.size,
                                    isUploading: false // Remove uploading flag
                                }
                                : msg
                        ));
                    } else {
                        if (response.error === 'Invalid or expired token') {
                            alert('Invalid or expired token. Please log in again.')
                            navigate(logout);
                        }
                        // Handle case where response structure is different
                        console.warn("Unexpected response structure:", response);
                        setMessages(prev => prev.map(msg =>
                            msg.id === tempId
                                ? {
                                    ...msg,
                                    file_path: response.file_path || `/uploads/${file.name}`,
                                    filename: file.name,
                                    file_size: file.size,
                                    isUploading: false
                                }
                                : msg
                        ));
                    }
                })
                .catch(err => {
                    console.error("❌ Error uploading file:", err);
                    // Mark the message as failed
                    setMessages(prev => prev.map(msg =>
                        msg.id === tempId
                            ? {
                                ...msg,
                                isUploading: false,
                                uploadFailed: true,
                                text: `Upload failed: ${file.name}`
                            }
                            : msg
                    ));
                });
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    return (
        <section
            id="dchatbox"
            ref={chatboxRef}
            style={{ position: "fixed", top: "80px", right: "24px" }}
            className="md:w-[320px] w-[300px] h-[420px] rounded-xl shadow-xl border border-blue-400/30 bg-gradient-to-br from-gray-900 to-gray-800 z-[999] hidden overflow-hidden backdrop-blur-sm"
        >
            {/* Header */}
            <div id="dchatHeader"
                className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-blue-800/60 to-purple-800/60 rounded-t-xl border-b border-blue-400/30 cursor-move select-none">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md ring-1 ring-blue-400/50 relative">
                        <FontAwesomeIcon icon={faUser} className="text-xs" />
                    </div>
                    <div>
                        <h4 className="text-white font-semibold text-sm bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                            Bravo Team
                        </h4>
                        <div className="flex items-center gap-1">
                            <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-400' : 'bg-gray-400'}`}></span>
                            <span className={`text-[10px] ${isOnline ? 'text-green-400' : 'text-gray-400'}`}>
                                {isOnline ? 'Online' : 'Offline'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <button className="w-6 h-6 flex items-center justify-center text-white/60 hover:text-green-300 hover:bg-green-500/20 rounded transition-all duration-200 cursor-pointer text-xs">
                        <FontAwesomeIcon icon={faVideo} />
                    </button>
                    <button
                        className="w-6 h-6 flex items-center justify-center text-white/60 hover:text-red-300 hover:bg-red-500/20 rounded transition-all duration-200 cursor-pointer text-xs"
                        onClick={() => document.getElementById('dchatbox').style.display = "none"}>
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>
            </div>

            {/* Chat Body */}
            <div
                ref={chatBodyRef}
                id="dchatBody"
                className="p-3 h-72 overflow-y-auto space-y-3 bg-gradient-to-br from-gray-900 to-gray-800 scroll-smooth"
            >
                {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-gray-400 text-sm">No messages yet</p>
                    </div>
                ) : (
                    messages.map((message) => {
                        const isCurrentUser = isCurrentUserMessage(message);
                        // Check if message has file attachment (using backend fields)
                        const hasAttachment = message.file_path || message.filename;
                        const isUploading = message.isUploading;
                        const uploadFailed = message.uploadFailed;

                        return (
                            <div
                                key={message.id || message.chatid}
                                className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[85%] p-2 rounded-lg shadow-md ${isCurrentUser
                                        ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-br-none"
                                        : "bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-bl-none"
                                        }`}
                                >
                                    {hasAttachment || isUploading || uploadFailed ? (
                                        <div className="flex items-center gap-2">
                                            <div className={`w-8 h-8 rounded flex items-center justify-center ${uploadFailed ? 'bg-red-500/20' : 'bg-blue-500/20'
                                                }`}>
                                                <FontAwesomeIcon
                                                    icon={faFile}
                                                    className={`text-xs ${uploadFailed ? 'text-red-300' : 'text-blue-300'
                                                        }`}
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium truncate">
                                                    {message.filename || message.text}
                                                </p>
                                                <div className="flex items-center gap-1 text-[11px]">
                                                    {isUploading ? (
                                                        <span className="text-yellow-400">Uploading...</span>
                                                    ) : uploadFailed ? (
                                                        <span className="text-red-400">Upload failed</span>
                                                    ) : (
                                                        <>
                                                            <span>FILE</span>
                                                            <span>•</span>
                                                            <span>{message.message}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            {!isUploading && !uploadFailed && message.file_path && (
                                                <button
                                                    onClick={() => downloadFile(
                                                        message.file_path,
                                                        message.filename || message.text
                                                    )}
                                                    className="text-blue-200 hover:text-white transition-colors text-xs p-1 hover:bg-blue-500/30 rounded"
                                                    title="Download file"
                                                >
                                                    <FontAwesomeIcon icon={faDownload} />
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <>
                                            <p className="text-xs whitespace-pre-wrap leading-relaxed">
                                                {message.text || message.message}
                                            </p>
                                            <span
                                                className={`text-[10px] block mt-0.5 ${isCurrentUser ? "text-green-100" : "text-blue-100"
                                                    }`}
                                            >
                                                {message.timestamp}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Input Area */}
            <div className="absolute bottom-0 left-0 right-0 border-t border-blue-400/20 px-3 py-2 bg-gradient-to-r from-gray-800 to-gray-700 rounded-b-xl">
                <div className="flex items-center gap-1.5">
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                    <button onClick={triggerFileInput} className="w-7 h-7 flex items-center justify-center text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded transition-all duration-200 cursor-pointer text-xs">
                        <FontAwesomeIcon icon={faPaperclip} />
                    </button>
                    <input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        type="text"
                        placeholder={orderid ? "Type a message..." : "Select an order to chat"}
                        disabled={!orderid}
                        className="flex-1 bg-gray-700/80 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-transparent border border-gray-600 placeholder-gray-400 text-xs transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <button
                        onClick={sendMessage}
                        disabled={!newMessage.trim() || !orderid}
                        className="w-8 h-8 flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-lg transition-all duration-200 cursor-pointer shadow-md hover:shadow-blue-500/20 text-xs disabled:cursor-not-allowed">
                        <FontAwesomeIcon icon={faPaperPlane} />
                    </button>
                </div>
            </div>
        </section>
    );
}