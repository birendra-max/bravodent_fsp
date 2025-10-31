import { useState, useRef, useEffect, useContext } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faUser, faVideo, faTimes, faFile, faDownload,
    faPaperclip, faPaperPlane
} from "@fortawesome/free-solid-svg-icons";
import { UserContext } from '../Context/UserContext';
import { DesignerContext } from '../Context/DesignerContext';

export default function Chatbox({ orderid }) {
    const token = localStorage.getItem('token');

    // Use both contexts
    const userCtx = useContext(UserContext);
    const designerCtx = useContext(DesignerContext);

    // Get current user - FIXED FOR BOTH
    let currentUser = null;
    let userId = null;
    let userRole = null;
    let userName = null;

    if (userCtx?.user) {
        currentUser = userCtx.user;
        userId = currentUser.userid; // Client ID
        userRole = 'client';
        userName = currentUser.name;
    } else if (designerCtx?.designer) {
        currentUser = designerCtx.designer;
        userId = currentUser.desiid; // Designer ID
        userRole = 'designer';
        userName = currentUser.name;
    }

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isOnline, setIsOnline] = useState(true);
    const fileInputRef = useRef(null);
    const chatBodyRef = useRef(null);
    const chatboxRef = useRef(null);
    const posRef = useRef({ x: 0, y: 0, left: 0, top: 0 });

    // Reset when order changes
    useEffect(() => {
        setMessages([]);
        setNewMessage('');
    }, [orderid]);

    // Auto-scroll
    useEffect(() => {
        if (chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }
    }, [messages]);

    // Fetch messages for BOTH client and designer - FIXED VERSION
    useEffect(() => {
        if (orderid && userId && userRole) {
            const fetchChat = () => {
                fetch(`http://localhost/bravodent_ci/chat/get-chat/${orderid}`, {
                    method: "GET",
                    headers: {
                        'Content-Type': "application/json",
                        'Authorization': `Bearer ${token}`
                    },
                })
                    .then(res => {
                        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
                        return res.json();
                    })
                    .then(data => {
                        if (data.status === 'success' && Array.isArray(data.data)) {
                            const formattedMessages = data.data.map(msg => {
                                // Determine message alignment based on user_type from API
                                const isClientMessage = msg.user_type === 'Client';
                                const isDesignerMessage = msg.user_type === 'Designer';

                                // For current user viewing:
                                // - If I'm a client: my messages (client) should be on right, designer messages on left
                                // - If I'm a designer: my messages (designer) should be on right, client messages on left
                                const shouldShowRight =
                                    (userRole === 'client' && isClientMessage) ||
                                    (userRole === 'designer' && isDesignerMessage);

                                return {
                                    id: msg.chatid || msg.id,
                                    orderid: msg.orderid,
                                    text: msg.message || msg.text,
                                    sender: msg.sender,
                                    timestamp: msg.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                    user_type: msg.user_type, // Keep original user_type from API
                                    alignment: shouldShowRight ? 'right' : 'left', // Add alignment field
                                    fileSize: msg.file_size ? formatFileSize(msg.file_size) : null,
                                    filePath: msg.file_path || msg.filePath,
                                    fileName: msg.filename || msg.fileName,
                                    file_path: msg.file_path,
                                    filename: msg.filename,
                                    file_size: msg.file_size,
                                    hasAttachment: !!(msg.file_path || msg.filename)
                                };
                            });
                            setMessages(formattedMessages);
                        } else {
                            setMessages([]);
                        }
                    })
                    .catch(err => {
                        console.error("❌ Error fetching messages:", err);
                        setMessages([]);
                    });
            }

            fetchChat();
            const interval = setInterval(fetchChat, 3000)
            return () => clearInterval(interval)
        } else {
            setMessages([]);
        }
    }, [orderid, userId, userRole, token]);

    // Enable dragging
    useEffect(() => {
        const chatbox = chatboxRef.current;
        if (!chatbox) return;

        const header = document.getElementById("chatHeader");
        if (!header) return;

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

    // Format file size utility function
    const formatFileSize = (bytes) => {
        if (!bytes || bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Helper to check message alignment
    const getMessageAlignment = (message) => {
        return message.alignment || 'left';
    };

    // Download file (WORKS FOR BOTH)
    const downloadFile = (filePath, fileName) => {
        if (!filePath) {
            console.error("No file path provided for download");
            return;
        }

        const absolutePath = filePath.startsWith('http') ? filePath : `http://localhost/bravodent_ci/${filePath.replace(/^\//, '')}`;

        const link = document.createElement('a');
        link.href = absolutePath;
        link.download = fileName || 'download';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Send text message
    const sendMessage = () => {
        if (!newMessage.trim() || !orderid || !userId || !userRole) {
            console.warn("🚫 Cannot send message: missing data", {
                newMessage,
                orderid,
                userId,
                userRole
            });
            return;
        }

        const messageData = {
            orderid,
            text: newMessage.trim(),
            sender: userId,
            user_type: userRole, // This will be either 'client' or 'designer'
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        // Optimistic update - FIXED ALIGNMENT
        const tempMessage = {
            id: Date.now(),
            ...messageData,
            text: newMessage.trim(),
            user_type: userRole,
            alignment: 'right', // Current user's messages always show on right
            hasAttachment: false
        };

        setMessages(prev => [...prev, tempMessage]);
        setNewMessage('');

        // Send to server
        fetch('http://localhost/bravodent_ci/chat/send-message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(messageData)
        })
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success' && data.data) {
                    // Replace temporary message with server response
                    setMessages(prev => prev.map(msg =>
                        msg.id === tempMessage.id
                            ? {
                                ...msg,
                                id: data.data.chatid,
                                alignment: 'right'
                            }
                            : msg
                    ));
                }
            })
            .catch(err => console.error("❌ Error sending message:", err));
    };

    // Handle file upload - FIXED FILE HANDLING
    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file || !orderid || !userId || !userRole) {
            console.warn("🚫 Cannot upload file: missing data", {
                file,
                orderid,
                userId,
                userRole
            });
            return;
        }

        const chatData = new FormData();
        chatData.append('orderid', orderid);
        chatData.append('sender', userId);
        chatData.append('user_type', userRole);
        chatData.append('chatfile', file);

        const tempId = Date.now();
        const tempMessage = {
            id: tempId,
            orderid,
            text: file.name, // Use actual file name
            sender: userId,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            fileSize: formatFileSize(file.size),
            fileName: file.name,
            user_type: userRole,
            alignment: 'right',
            isUploading: true,
            file_path: null,
            filename: file.name,
            file_size: file.size,
            hasAttachment: true
        };

        setMessages(prev => [...prev, tempMessage]);
        event.target.value = '';

        fetch('http://localhost/bravodent_ci/chat/chat-file', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: chatData,
        })
            .then(res => res.json())
            .then(response => {
                console.log("✅ File upload response:", response);
                if (response.status === 'success' && response.data) {
                    setMessages(prev => prev.map(msg =>
                        msg.id === tempId
                            ? {
                                ...msg,
                                id: response.data.chatid || tempId,
                                file_path: response.data.file_path,
                                filename: response.data.filename || file.name,
                                file_size: response.data.file_size || file.size,
                                fileSize: response.data.file_size ? formatFileSize(response.data.file_size) : formatFileSize(file.size),
                                alignment: 'right',
                                isUploading: false,
                                hasAttachment: true
                            }
                            : msg
                    ));
                } else {
                    console.warn("❌ Upload failed:", response);
                    setMessages(prev => prev.map(msg =>
                        msg.id === tempId
                            ? { ...msg, isUploading: false, uploadFailed: true }
                            : msg
                    ));
                }
            })
            .catch(err => {
                console.error("❌ Upload error:", err);
                setMessages(prev => prev.map(msg =>
                    msg.id === tempId
                        ? { ...msg, isUploading: false, uploadFailed: true }
                        : msg
                ));
            });
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const triggerFileInput = () => fileInputRef.current?.click();

    return (
        <section
            id="chatbox"
            ref={chatboxRef}
            style={{ position: "fixed", top: "80px", right: "24px" }}
            className="md:w-[320px] w-[300px] h-[420px] rounded-xl shadow-xl border border-blue-400/30 bg-gradient-to-br from-gray-900 to-gray-800 z-[999] hidden overflow-hidden backdrop-blur-sm"
        >
            {/* Header - Shows current user name and role */}
            <div id="chatHeader"
                className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-blue-800/60 to-purple-800/60 rounded-t-xl border-b border-blue-400/30 cursor-move select-none">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md ring-1 ring-blue-400/50">
                        <FontAwesomeIcon icon={faUser} className="text-xs" />
                    </div>
                    <div>
                        <h4 className="text-white font-semibold text-sm bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                            {userRole === 'client' ? 'Designer Team' : orderid}
                        </h4>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <button className="w-6 h-6 flex items-center justify-center text-white/60 hover:text-green-300 hover:bg-green-500/20 rounded transition-all duration-200">
                        <FontAwesomeIcon icon={faVideo} />
                    </button>
                    <button
                        className="w-6 h-6 flex items-center justify-center text-white/60 hover:text-red-300 hover:bg-red-500/20 rounded transition-all duration-200"
                        onClick={() => document.getElementById('chatbox').style.display = "none"}>
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>
            </div>

            {/* Chat Body - FIXED STRUCTURE */}
            <div ref={chatBodyRef} id="chatBody" className="p-3 h-72 overflow-y-auto space-y-3 bg-gradient-to-br from-gray-900 to-gray-800 scroll-smooth">
                {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-gray-400 text-sm">No messages yet. Start a conversation!</p>
                    </div>
                ) : (
                    messages.map((message) => {
                        const isRightAligned = getMessageAlignment(message) === 'right';
                        const hasAttachment = message.hasAttachment || message.file_path || message.filename;
                        const isUploading = message.isUploading;
                        const uploadFailed = message.uploadFailed;

                        // Get proper file name and size
                        const fileName = message.filename || message.fileName || message.text;
                        const fileSize = message.fileSize || (message.file_size ? formatFileSize(message.file_size) : null);

                        return (
                            <div key={message.id} className={`flex flex-col ${isRightAligned ? "items-end" : "items-start"}`}>
                                <div className={`max-w-[85%] p-2 rounded-lg shadow-md ${isRightAligned
                                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-br-none"
                                    : "bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-bl-none"
                                    }`}
                                >
                                    {hasAttachment || isUploading || uploadFailed ? (
                                        <div className="flex items-center gap-2">
                                            <div className={`w-8 h-8 rounded flex items-center justify-center ${uploadFailed ? 'bg-red-500/20' : isRightAligned ? 'bg-green-500/20' : 'bg-blue-500/20'}`}>
                                                <FontAwesomeIcon
                                                    icon={faFile}
                                                    className={`text-xl ${uploadFailed ? 'text-red-300' : isRightAligned ? 'text-green-300' : 'text-blue-300'}`}
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                {/* Show file name as main content - like text messages */}
                                                <p className="text-[10px] whitespace-pre-wrap leading-relaxed">
                                                    {fileName}
                                                </p>
                                            </div>
                                            {!isUploading && !uploadFailed && message.file_path && (
                                                <button
                                                    onClick={() => downloadFile(message.file_path, fileName)}
                                                    className={`text-xs p-1 rounded transition-colors hover:bg-opacity-30 ${isRightAligned
                                                        ? "text-green-200 hover:text-white hover:bg-green-500"
                                                        : "text-blue-200 hover:text-white hover:bg-blue-500"
                                                        }`}
                                                    title="Download file"
                                                >
                                                    <FontAwesomeIcon icon={faDownload} />
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-xs whitespace-pre-wrap leading-relaxed">
                                            {message.text}
                                        </p>
                                    )}
                                </div>
                                {/* Timestamp now properly aligned with the message bubble */}
                                <span className={`text-[10px] mt-1 px-1 ${isRightAligned ? "text-green-100 text-right" : "text-blue-100 text-left"}`}>
                                    {message.timestamp}
                                </span>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Input Area */}
            <div className="absolute bottom-0 left-0 right-0 border-t border-blue-400/20 px-3 py-2 bg-gradient-to-r from-gray-800 to-gray-700 rounded-b-xl">
                <div className="flex items-center gap-1.5">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                        accept="*/*"
                    />
                    <button
                        onClick={triggerFileInput}
                        disabled={!orderid}
                        className="w-7 h-7 flex items-center justify-center text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FontAwesomeIcon icon={faPaperclip} />
                    </button>
                    <input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        type="text"
                        placeholder={orderid ? "Type a message..." : "Select an order to chat"}
                        disabled={!orderid}
                        className="flex-1 bg-gray-700/80 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400 border border-gray-600 placeholder-gray-400 text-xs disabled:opacity-50"
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