import { useState, useRef, useEffect, useContext } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faUser, faTimes, faFile, faPaperclip, faPaperPlane, faDownload,
    faCrown, faUserTie, faCamera, faMicrophone
} from "@fortawesome/free-solid-svg-icons";
import { UserContext } from '../Context/UserContext';
import { DesignerContext } from '../Context/DesignerContext';
import { AdminContext } from '../Context/AdminContext';
import config from '../config';

export default function Chatbox({ orderid }) {
    const userToken = localStorage.getItem('bravo_user_token');
    const adminToken = localStorage.getItem('bravo_admin_token');
    const designerToken = localStorage.getItem('bravo_designer_token');
    const token = userToken || adminToken || designerToken;

    const userCtx = useContext(UserContext);
    const designerCtx = useContext(DesignerContext);
    const adminCtx = useContext(AdminContext);

    let currentUser = null, userId = null, userRole = null, userName = null;

    if (userCtx?.user?.userid) {
        currentUser = userCtx.user;
        userId = currentUser.userid;
        userRole = 'client';
        userName = currentUser.name || 'Client';
    } else if (designerCtx?.designer?.desiid) {
        currentUser = designerCtx.designer;
        userId = currentUser.desiid;
        userRole = 'designer';
        userName = currentUser.name || 'Designer';
    } else if (adminCtx?.admin?.id) {
        currentUser = adminCtx.admin;
        userId = currentUser.id;
        userRole = 'admin';
        userName = currentUser.name || 'Admin';
    } else {
        try {
            const storedUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
            const storedAdmin = localStorage.getItem('bravo_admin') ? JSON.parse(localStorage.getItem('bravo_admin')) : null;
            const storedDesigner = localStorage.getItem('designer') ? JSON.parse(localStorage.getItem('designer')) : null;

            if (storedUser?.userid) {
                userId = storedUser.userid;
                userRole = 'client';
                userName = storedUser.name || 'Client';
            } else if (storedAdmin?.id) {
                userId = storedAdmin.id;
                userRole = 'admin';
                userName = storedAdmin.name || 'Admin';
            } else if (storedDesigner?.desiid) {
                userId = storedDesigner.desiid;
                userRole = 'designer';
                userName = storedDesigner.name || 'Designer';
            }
        } catch (e) { }
    }

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const fileInputRef = useRef(null);
    const chatBodyRef = useRef(null);
    const chatboxRef = useRef(null);
    const textareaRef = useRef(null);
    const pollingIntervalRef = useRef(null);
    const lastMessageIdRef = useRef(0);
    const posRef = useRef({ x: 0, y: 0, left: 0, top: 0 });
    const recentlySentMessagesRef = useRef(new Set());

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
        }
    }, [newMessage]);

    useEffect(() => {
        if (!orderid) return;

        setMessages([]);
        setNewMessage('');
        lastMessageIdRef.current = 0;
        recentlySentMessagesRef.current.clear();

        // Clear any existing polling interval
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
        }

        if (orderid && token) {
            loadChatHistory();
        }
    }, [orderid]);

    const loadChatHistory = async () => {
        try {
            const response = await fetch(`${config.API_BASE_URL}/chat/get-chat-history/${orderid}`, {
                headers: {
                    'X-Tenant': 'bravodent'
                }
            });

            if (!response.ok) return;

            const data = await response.json();

            if (data.status === 'success' && data.data) {
                const formatted = data.data.map(msg => {
                    // SIMPLE RULE: Client messages -> LEFT, Designer/Admin messages -> RIGHT
                    const isClientMessage = msg.user_type === 'Client';

                    return {
                        id: msg.id,
                        orderid: msg.orderid,
                        text: msg.message,
                        timestamp: msg.message_date,
                        user_type: msg.user_type,
                        user_name: msg.user_name || msg.user_type,
                        alignment: isClientMessage ? 'left' : 'right',
                        file_path: msg.file_path || null,
                        filename: msg.attachment || null,
                        hasAttachment: !!msg.file_path,
                        isAdmin: msg.user_type === 'Admin',
                        isDesigner: msg.user_type === 'Designer',
                        isClient: msg.user_type === 'Client'
                    };
                });

                setMessages(formatted);

                if (formatted.length > 0) {
                    lastMessageIdRef.current = Math.max(...formatted.map(m => m.id));
                }

                // Start polling for new messages
                startPolling();
            }
        } catch (error) {
            console.error("Error loading chat history:", error);
            // Start polling anyway
            startPolling();
        }
    };

    const startPolling = () => {
        // Clear any existing interval first
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
        }

        // Set up polling every 3 seconds
        pollingIntervalRef.current = setInterval(fetchNewMessages, 3000);
        setIsConnected(true);
    };

    const fetchNewMessages = async () => {
        if (!orderid || !token) return;

        try {
            // Fetch new messages since the last message ID
            const response = await fetch(
                `${config.API_BASE_URL}/chat/get-chat-history/${orderid}?lastId=${lastMessageIdRef.current}`,
                {
                    headers: {
                        'X-Tenant': 'bravodent'
                    }
                }
            );

            if (!response.ok) {
                setIsConnected(false);
                return;
            }

            const data = await response.json();

            if (data.status === 'success' && data.data) {
                // Filter to only get messages newer than our last message ID
                const newMessages = data.data
                    .filter(msg => msg.id > lastMessageIdRef.current)
                    .map(msg => {
                        // SIMPLE RULE: Client messages -> LEFT, Designer/Admin messages -> RIGHT
                        const isClientMessage = msg.user_type === 'Client';

                        return {
                            id: msg.id,
                            orderid: msg.orderid,
                            text: msg.message,
                            timestamp: msg.message_date,
                            user_type: msg.user_type,
                            user_name: msg.user_name || msg.user_type,
                            alignment: isClientMessage ? 'left' : 'right',
                            file_path: msg.file_path || null,
                            filename: msg.attachment || null,
                            hasAttachment: !!msg.file_path,
                            isAdmin: msg.user_type === 'Admin',
                            isDesigner: msg.user_type === 'Designer',
                            isClient: msg.user_type === 'Client'
                        };
                    });

                if (newMessages.length > 0) {
                    // Update messages state
                    setMessages(prev => {
                        // Filter out any duplicates
                        const existingIds = new Set(prev.map(m => m.id));
                        const uniqueNewMessages = newMessages.filter(m => !existingIds.has(m.id));

                        if (uniqueNewMessages.length > 0) {
                            // Update last message ID
                            lastMessageIdRef.current = Math.max(...uniqueNewMessages.map(m => m.id));
                            return [...prev, ...uniqueNewMessages];
                        }
                        return prev;
                    });

                    setIsConnected(true);
                }
            }
        } catch (error) {
            console.error("Error fetching new messages:", error);
            setIsConnected(false);
        }
    };

    useEffect(() => {
        if (chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }
    }, [messages]);

    // Cleanup polling interval on component unmount
    useEffect(() => {
        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
                pollingIntervalRef.current = null;
            }
        };
    }, []);

    const formatTimestamp = (dateString) => {
        if (!dateString) return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        try {
            const date = new Date(dateString);
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch {
            return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
    };

    const getUserTypeForApi = () => {
        if (userRole === 'client') return 'Client';
        if (userRole === 'designer') return 'Designer';
        if (userRole === 'admin') return 'Admin';
        return 'Designer';
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !orderid || !userId) return;

        const messageText = newMessage.trim();

        try {
            const response = await fetch(`${config.API_BASE_URL}/chat/send-message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'X-Tenant': 'bravodent'
                },
                body: JSON.stringify({
                    orderid,
                    text: messageText,
                    user_type: getUserTypeForApi()
                }),
            });

            const data = await response.json();

            if (data.status === 'success') {
                // Determine alignment based on user role
                // Client messages go LEFT, Designer/Admin messages go RIGHT
                const isCurrentUserClient = userRole === 'client';

                const newMsg = {
                    id: data.data.id,
                    orderid: orderid,
                    text: messageText,
                    timestamp: new Date().toISOString(),
                    user_type: getUserTypeForApi(),
                    user_name: userName,
                    alignment: isCurrentUserClient ? 'left' : 'right',
                    file_path: null,
                    filename: null,
                    hasAttachment: false,
                    isAdmin: userRole === 'admin',
                    isDesigner: userRole === 'designer',
                    isClient: userRole === 'client'
                };

                setMessages(prev => [...prev, newMsg]);
                lastMessageIdRef.current = data.data.id;
                setNewMessage('');

                // Trigger immediate poll to get any other new messages
                setTimeout(() => fetchNewMessages(), 500);
            } else {
                alert(`Failed to send message: ${data.message}`);
            }
        } catch (err) {
            alert("Network error. Please check your connection.");
        }
    };

    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length || !orderid) return;

        for (const file of files) {
            const formData = new FormData();
            formData.append('orderid', orderid);
            formData.append('chatfile', file);

            const fileKey = `${file.name}_${Date.now()}`;
            recentlySentMessagesRef.current.add(fileKey);

            try {
                const res = await fetch(`${config.API_BASE_URL}/chat/chat-file`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'X-Tenant': 'bravodent'
                    },
                    body: formData
                });

                const result = await res.json();

                if (result.status !== 'success') {
                    alert(`Upload failed: ${result.message}`);
                }

                // Trigger immediate poll to show the uploaded file
                setTimeout(() => fetchNewMessages(), 500);

                setTimeout(() => {
                    recentlySentMessagesRef.current.delete(fileKey);
                }, 5000);

            } catch (err) {
                alert("File upload failed. Please try again.");
            }
        }

        e.target.value = '';
    };

    const triggerFileInput = () => fileInputRef.current?.click();

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const downloadFile = (url, name) => {
        if (!url) {
            alert("File Not Found!");
            return;
        }

        try {
            const base_url = localStorage.getItem("bravo_user_base_url") || config.API_BASE_URL;
            const encodedPath = encodeURIComponent(url);
            const finalUrl = `${base_url}/download?path=${encodedPath}`;

            const link = document.createElement("a");
            link.href = finalUrl;
            link.target = "_blank";
            link.download = name || "download";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            alert("Error while downloading file");
        }
    };

    useEffect(() => {
        const chatbox = chatboxRef.current;
        const header = document.getElementById("chatHeader");
        if (!chatbox || !header) return;

        const mouseDownHandler = (e) => {
            posRef.current = { x: e.clientX, y: e.clientY, left: chatbox.offsetLeft, top: chatbox.offsetTop };
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
        return () => header.removeEventListener("mousedown", mouseDownHandler);
    }, []);

    const getUserIcon = (userType) => {
        switch (userType) {
            case 'Admin': return faCrown;
            case 'Designer': return faUserTie;
            case 'Client': return faUser;
            default: return faUser;
        }
    };

    return (
        <section
            id="chatbox"
            ref={chatboxRef}
            style={{ position: "fixed", top: "80px", right: "24px" }}
            className="md:w-[400px] w-[300px] h-[540px] rounded-xl shadow-xl bg-white z-[999] hidden overflow-hidden"
        >
            {/* Header */}
            <div
                id="chatHeader"
                className="flex items-center justify-between px-3 py-2 bg-[#00a884] rounded-t-xl border-b border-gray-300 cursor-move select-none"
            >
                <div className="flex items-center gap-2 py-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${userRole === 'admin' ? 'bg-purple-600' :
                        userRole === 'designer' ? 'bg-green-600' :
                            'bg-blue-600'
                        }`}>
                        <FontAwesomeIcon icon={getUserIcon(userRole === 'admin' ? 'Admin' : userRole === 'designer' ? 'Designer' : 'Client')} className="text-xs" />
                    </div>
                    <div>
                        <h4 className="text-white font-semibold text-sm">
                            Order #{orderid}
                        </h4>
                        <div className="flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-full bg-green-400`}></div>
                            <span className="text-xs text-white/90">
                                Online
                            </span>
                            <span className="text-xs text-white/80 ml-1">
                                ({userName})
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => document.getElementById('chatbox').style.display = "none"}
                        className="w-6 h-6 flex items-center justify-center text-white/80 hover:text-white hover:bg-red-500/20 rounded"
                    >
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>
            </div>

            {/* Chat Body - Scrollable area */}
            <div
                ref={chatBodyRef}
                className="p-3 h-[calc(520px-120px)] overflow-y-auto"
                style={{
                    backgroundColor: '#efeae2',
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%23d1f7c4\' fill-opacity=\'0.4\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")'
                }}
            >
                {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-gray-600 text-sm">No messages yet. Start chatting!</p>
                        {!token && <p className="text-red-500 text-xs mt-2">No authentication token found</p>}
                    </div>
                ) : (
                    messages.map(msg => {
                        const isRight = msg.alignment === 'right';
                        const isAdmin = msg.user_type === 'Admin';
                        const isDesigner = msg.user_type === 'Designer';
                        const isClient = msg.user_type === 'Client';

                        return (
                            <div key={msg.id} className={`flex flex-col ${isRight ? 'items-end' : 'items-start'} mb-3`}>
                                <div className={`max-w-[85%] p-2 rounded-lg ${isRight ? 'bg-[#d9fdd3] text-gray-800 rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none shadow-sm'}`}>
                                    {msg.hasAttachment && msg.file_path ? (
                                        <div className="flex items-center gap-2 p-1">
                                            <FontAwesomeIcon icon={faFile} className="text-gray-600" />
                                            <span className="text-[10px] text-gray-700">{msg.filename}</span>
                                            <button
                                                onClick={() => downloadFile(msg.file_path, msg.filename)}
                                                className="text-gray-600 hover:text-gray-800 ml-2"
                                                title="Download file"
                                            >
                                                <FontAwesomeIcon icon={faDownload} className="text-xl hover:text-gray-800 cursor-pointer" />
                                            </button>
                                        </div>
                                    ) : (
                                        <p className="text-xs whitespace-pre-wrap">{msg.text}</p>
                                    )}
                                </div>
                                <span className={`text-[10px] mt-1 px-1 ${isAdmin ? 'text-purple-600' :
                                    isDesigner ? 'text-green-600' :
                                        'text-blue-600'
                                    }`}>
                                    {formatTimestamp(msg.timestamp)}
                                </span>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Input Area - Fixed at bottom */}
            <div className="flex-shrink-0 bg-gray-100 border-t border-gray-300">
                <div className="px-4 py-3">
                    <div className="flex items-end gap-2">
                        {/* Attachment Button */}
                        <button
                            onClick={triggerFileInput}
                            disabled={!orderid || !token}
                            className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors disabled:opacity-50 flex-shrink-0"
                            title="Attach"
                        >
                            <FontAwesomeIcon icon={faPaperclip} className="text-xl" />
                        </button>

                        {/* Camera Button */}
                        <button
                            onClick={triggerFileInput}
                            disabled={!orderid || !token}
                            className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors disabled:opacity-50 flex-shrink-0"
                            title="Camera"
                        >
                            <FontAwesomeIcon icon={faCamera} className="text-xl" />
                        </button>

                        {/* Text Input Area */}
                        <div className="flex-1 min-w-0 relative bg-white rounded-full border border-gray-300 overflow-hidden">
                            <textarea
                                ref={textareaRef}
                                value={newMessage}
                                onChange={(e) => {
                                    setNewMessage(e.target.value);
                                    // Auto-resize
                                    const textarea = e.target;
                                    textarea.style.height = 'auto';
                                    textarea.style.height = Math.min(textarea.scrollHeight, 80) + 'px';
                                }}
                                onKeyDown={handleKeyDown}
                                placeholder={!token ? "Authentication required" : !orderid ? "Select an order" : "Type a message"}
                                className="w-full bg-transparent text-gray-800 px-4 py-3 text-sm focus:outline-none resize-none"
                                disabled={!orderid || !token}
                                rows="1"
                                style={{
                                    minHeight: '44px',
                                    maxHeight: '80px',
                                    overflowY: 'auto',
                                    scrollbarWidth: 'thin',
                                    scrollbarColor: '#CBD5E0 transparent'
                                }}
                            />
                        </div>

                        <button
                            onClick={sendMessage}
                            disabled={!newMessage.trim() || !orderid || !token}
                            className="w-10 h-10 flex items-center justify-center text-white bg-whatsapp-green rounded-full transition-colors disabled:opacity-50 flex-shrink-0"
                            style={{ backgroundColor: '#00a884' }}
                            title="Send"
                        >
                            <FontAwesomeIcon icon={faPaperPlane} className="text-lg" />
                        </button>
                    </div>
                </div>

                {/* Hidden File Input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileUpload}
                    multiple
                    className="hidden"
                />
            </div>
        </section>
    );
}