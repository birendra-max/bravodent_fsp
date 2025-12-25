import { useState, useRef, useEffect, useContext } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faUser, faTimes, faFile, faPaperclip, faPaperPlane, faDownload,
    faCrown, faShieldAlt, faUserTie
} from "@fortawesome/free-solid-svg-icons";
import { UserContext } from '../Context/UserContext';
import { DesignerContext } from '../Context/DesignerContext';
import { AdminContext } from '../Context/AdminContext';
import config from '../config';

export default function Chatbox({ orderid }) {
    console.log("Chatbox orderid:", orderid);

    // Get correct token based on user type
    const userToken = localStorage.getItem('token');
    const adminToken = localStorage.getItem('bravo_admin_token');
    const designerToken = localStorage.getItem('designer_token') || localStorage.getItem('token');

    // Priority: user token > admin token > designer token
    const token = userToken || adminToken || designerToken || "";

    const userCtx = useContext(UserContext);
    const designerCtx = useContext(DesignerContext);
    const adminCtx = useContext(AdminContext);

    // Detect user role and ID
    let currentUser = null, userId = null, userRole = null, userName = null;

    console.log("User context:", userCtx?.user);
    console.log("Admin context:", adminCtx?.admin);
    console.log("Designer context:", designerCtx?.designer);

    // Check which context has a valid user
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
        // Try to get from localStorage as fallback
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
        } catch (e) {
            console.error("Error parsing stored user:", e);
        }
    }

    console.log("Detected user:", { userId, userRole, userName, tokenExists: !!token });

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const fileInputRef = useRef(null);
    const chatBodyRef = useRef(null);
    const chatboxRef = useRef(null);
    const textareaRef = useRef(null);
    const eventSourceRef = useRef(null);
    const lastMessageIdRef = useRef(0);
    const posRef = useRef({ x: 0, y: 0, left: 0, top: 0 });

    // Track recently sent messages to avoid duplicates
    const recentlySentMessagesRef = useRef(new Set());

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
        }
    }, [newMessage]);

    // Reset messages when order changes
    useEffect(() => {
        if (!orderid) {
            console.log("No orderid provided, skipping chat setup");
            return;
        }

        console.log("Setting up chat for order:", orderid, "with token:", token ? "Yes" : "No");

        setMessages([]);
        setNewMessage('');
        lastMessageIdRef.current = 0;
        recentlySentMessagesRef.current.clear();

        // Close existing connection
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
        }

        // Load chat history when order changes
        if (orderid && token) {
            loadChatHistory();
        } else {
            console.error("Cannot load chat: missing orderid or token");
        }
    }, [orderid]);

    // Load initial chat history
    const loadChatHistory = async () => {
        try {
            console.log("Loading chat history for order:", orderid);

            const response = await fetch(`${config.API_BASE_URL}/chat/get-chat-history/${orderid}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'X-Tenant': 'bravodent'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log("Chat history response:", data);

            if (data.status === 'success' && data.data) {
                const formatted = data.data.map(msg => {
                    // FIXED: Client messages ALWAYS left, Admin/Designer ALWAYS right
                    const isRight = msg.user_type === 'Admin' || msg.user_type === 'Designer';

                    return {
                        id: msg.id,
                        orderid: msg.orderid,
                        text: msg.message,
                        timestamp: msg.message_date,
                        user_type: msg.user_type,
                        user_name: msg.user_name || msg.user_type,
                        alignment: isRight ? 'right' : 'left', // Client=left, Admin/Designer=right
                        file_path: msg.file_path || null,
                        filename: msg.attachment || null,
                        hasAttachment: !!msg.file_path,
                        isAdmin: msg.user_type === 'Admin',
                        isDesigner: msg.user_type === 'Designer',
                        isClient: msg.user_type === 'Client'
                    };
                });

                setMessages(formatted);

                // Set the last message ID for SSE
                if (formatted.length > 0) {
                    lastMessageIdRef.current = Math.max(...formatted.map(m => m.id));
                    console.log("Last message ID set to:", lastMessageIdRef.current);
                }

                // Start SSE connection after loading history
                startSSEConnection();
            } else {
                console.error("Failed to load chat history:", data.message);
            }
        } catch (error) {
            console.error("❌ Failed to load chat history:", error);
            startSSEConnection(); // Still try to connect to SSE
        }
    };

    const formatTimestamp = (dateString) => {
        if (!dateString) return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        try {
            const date = new Date(dateString);
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch {
            return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
    };

    // Get user type for API based on role
    const getUserTypeForApi = () => {
        if (userRole === 'client') return 'Client';
        if (userRole === 'designer') return 'Designer';
        if (userRole === 'admin') return 'Admin';
        return 'Designer'; // fallback
    };

    // Start SSE connection
    const startSSEConnection = () => {
        if (!orderid || !token || eventSourceRef.current) {
            console.log("Cannot start SSE: missing orderid or token or already connected");
            return;
        }

        const url = `${config.API_BASE_URL}/chat/stream-chat/${orderid}?lastId=${lastMessageIdRef.current}&tenant=bravodent`;
        console.log("Starting SSE connection to:", url);

        try {
            eventSourceRef.current = new EventSource(url);

            eventSourceRef.current.onopen = () => {
                console.log("✅ SSE connection opened");
                setIsConnected(true);
            };

            eventSourceRef.current.onmessage = (event) => {
                // Skip heartbeat messages
                if (event.data === ': heartbeat') return;

                try {
                    const data = JSON.parse(event.data);
                    console.log("SSE message received:", data);

                    if (data.messages && Array.isArray(data.messages)) {
                        const newMessages = data.messages.map(msg => {
                            // FIXED: Same logic - Client messages left, Admin/Designer right
                            const isRight = msg.user_type === 'Admin' || msg.user_type === 'Designer';

                            return {
                                id: msg.id,
                                orderid: msg.orderid,
                                text: msg.message,
                                timestamp: formatTimestamp(msg.message_date),
                                user_type: msg.user_type,
                                user_name: msg.user_name || msg.user_type,
                                alignment: isRight ? 'right' : 'left', // Client=left, Admin/Designer=right
                                file_path: msg.file_path || null,
                                filename: msg.attachment || null,
                                hasAttachment: !!msg.file_path,
                                isAdmin: msg.user_type === 'Admin',
                                isDesigner: msg.user_type === 'Designer',
                                isClient: msg.user_type === 'Client'
                            };
                        });

                        setMessages(prev => {
                            const existingIds = new Set(prev.map(m => m.id));
                            const unique = newMessages.filter(m => !existingIds.has(m.id));

                            if (unique.length > 0) {
                                lastMessageIdRef.current = Math.max(...unique.map(m => m.id));
                                console.log("New messages added, lastId:", lastMessageIdRef.current);
                                return [...prev, ...unique];
                            }
                            return prev;
                        });
                    }
                } catch (err) {
                    console.error("❌ SSE parse error:", err);
                }
            };

            eventSourceRef.current.addEventListener('connected', (event) => {
                console.log("✅ SSE connected event received");
                setIsConnected(true);
            });

            eventSourceRef.current.addEventListener('end', (event) => {
                console.log("🔚 SSE stream ended");
                eventSourceRef.current?.close();
                setIsConnected(false);
            });

            eventSourceRef.current.onerror = (err) => {
                console.error("❌ SSE error:", err);
                setIsConnected(false);

                // Attempt to reconnect after 3 seconds
                setTimeout(() => {
                    if (eventSourceRef.current) {
                        eventSourceRef.current.close();
                        eventSourceRef.current = null;
                    }
                    console.log("Attempting to reconnect SSE...");
                    startSSEConnection();
                }, 3000);
            };

        } catch (error) {
            console.error("❌ Failed to create SSE connection:", error);
            setIsConnected(false);
        }
    };

    // Auto-scroll on new messages
    useEffect(() => {
        if (chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }
    }, [messages]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
                console.log("SSE connection closed on unmount");
            }
        };
    }, []);

    // Send message (text)
    const sendMessage = async () => {
        if (!newMessage.trim() || !orderid || !userId) {
            console.log("Cannot send message: missing content, orderid, or userId");
            return;
        }

        const messageText = newMessage.trim();
        console.log("Sending message:", {
            orderid,
            text: messageText,
            userRole,
            userTypeForApi: getUserTypeForApi(),
            userId
        });

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
            console.log("Send message response:", data);

            if (data.status === 'success') {
                lastMessageIdRef.current = data.data.id;
                setNewMessage('');
            } else {
                console.error("Failed to send message:", data.message);
                alert(`Failed to send message: ${data.message}`);
            }
        } catch (err) {
            console.error("Send message error:", err);
            alert("Network error. Please check your connection.");
        }
    };

    // File upload
    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length || !orderid) {
            console.log("No files selected or no orderid");
            return;
        }

        for (const file of files) {
            const formData = new FormData();
            formData.append('orderid', orderid);
            formData.append('chatfile', file);

            // Create a unique identifier for this file upload to track duplicates
            const fileKey = `${file.name}_${Date.now()}`;
            recentlySentMessagesRef.current.add(fileKey);

            try {
                console.log("Uploading file:", file.name);
                const res = await fetch(`${config.API_BASE_URL}/chat/chat-file`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'X-Tenant': 'bravodent'
                    },
                    body: formData
                });

                const result = await res.json();
                console.log("File upload response:", result);

                if (result.status !== 'success') {
                    console.error("❌ Upload failed:", result.message);
                    alert(`Upload failed: ${result.message}`);
                }

                // Remove the file key after 5 seconds
                setTimeout(() => {
                    recentlySentMessagesRef.current.delete(fileKey);
                }, 5000);

            } catch (err) {
                console.error("❌ File upload error:", err);
                alert("File upload failed. Please try again.");
            }
        }

        // Clear file input after all uploads
        e.target.value = '';
    };

    const triggerFileInput = () => fileInputRef.current?.click();

    // Updated handleKeyDown for textarea
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
        // Allow Shift+Enter for new line
    };

    const downloadFile = (url, name) => {
        if (!url) {
            alert("File Not Found!");
            return;
        }

        try {
            const base_url = localStorage.getItem("base_url") || config.API_BASE_URL;
            const encodedPath = encodeURIComponent(url);
            const finalUrl = `${base_url}/download?path=${encodedPath}`;

            console.log("Downloading file:", finalUrl);

            // Create download link
            const link = document.createElement("a");
            link.href = finalUrl;
            link.target = "_blank";
            link.download = name || "download";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            alert("⚠️ Error while downloading file");
            console.error("Download error:", error);
        }
    };

    // Draggable chatbox
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

    // Get icon for user type
    const getUserIcon = (userType) => {
        switch (userType) {
            case 'Admin': return faCrown;
            case 'Designer': return faUserTie;
            case 'Client': return faUser;
            default: return faUser;
        }
    };

    const getMessageColor = (userType, isRight) => {
        if (userType === 'Admin') {
            return isRight
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-br-none'
                : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-bl-none';
        } else if (userType === 'Designer') {
            return isRight
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-br-none'
                : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-bl-none';
        } else {
            return isRight
                ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-br-none'
                : 'bg-gradient-to-r from-blue-400 to-cyan-500 text-white rounded-bl-none';
        }
    };

    // Get chat header title
    const getChatHeaderTitle = () => {
        if (userRole === 'client') return 'Designer Team';
        if (userRole === 'designer') return `Order: ${orderid}`;
        if (userRole === 'admin') return `Admin Chat - Order: ${orderid}`;
        return `Chat - Order: ${orderid}`;
    };

    return (
        <section
            id="chatbox"
            ref={chatboxRef}
            style={{ position: "fixed", top: "80px", right: "24px" }}
            className="md:w-[400px] w-[300px] h-[520px] rounded-xl shadow-xl border border-blue-400/30 bg-gradient-to-br from-gray-900 to-gray-800 z-[999] hidden overflow-hidden backdrop-blur-sm"
        >
            {/* Header */}
            <div id="chatHeader" className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-blue-800/60 to-purple-800/60 rounded-t-xl border-b border-blue-400/30 cursor-move select-none">
                <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md ring-1 ring-blue-400/50 ${userRole === 'admin' ? 'bg-gradient-to-br from-purple-500 to-pink-500' :
                        userRole === 'designer' ? 'bg-gradient-to-br from-green-500 to-emerald-500' :
                            'bg-gradient-to-br from-blue-400 to-purple-500'
                        }`}>
                        <FontAwesomeIcon icon={getUserIcon(userRole === 'admin' ? 'Admin' : userRole === 'designer' ? 'Designer' : 'Client')} className="text-xs" />
                    </div>
                    <div>
                        <h4 className="text-white font-semibold text-sm bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                            {getChatHeaderTitle()}
                        </h4>
                        <div className="flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-full bg-green-400`}></div>
                            <span className="text-xs text-gray-300">
                                Connected
                            </span>
                            <span className={`text-xs ${userRole === 'admin' ? 'text-purple-300' :
                                userRole === 'designer' ? 'text-green-300' :
                                    'text-blue-300'
                                } ml-1`}>
                                ({userName})
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => document.getElementById('chatbox').style.display = "none"}
                        className="w-6 h-6 flex items-center justify-center text-white/60 hover:text-red-300 hover:bg-red-500/20 rounded"
                    >
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div ref={chatBodyRef} className="p-3 h-[78%] overflow-y-auto space-y-3 bg-slate-950">
                {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-gray-400 text-sm">No messages yet. Start chatting!</p>
                        {!token && <p className="text-red-400 text-xs mt-2">No authentication token found</p>}
                    </div>
                ) : (
                    messages.map(msg => {
                        const isRight = msg.alignment === 'right';
                        const isAdmin = msg.user_type === 'Admin';
                        const isDesigner = msg.user_type === 'Designer';
                        const isClient = msg.user_type === 'Client';

                        return (
                            <div key={msg.id} className={`flex flex-col ${isRight ? 'items-end' : 'items-start'}`}>
                                <div className={`max-w-[85%] p-2 rounded-lg shadow-md ${getMessageColor(msg.user_type, isRight)}`}>
                                    <div className="flex items-center gap-1 mb-1">
                                        <FontAwesomeIcon
                                            icon={getUserIcon(msg.user_type)}
                                            className={`w-3 h-3 ${isAdmin ? 'text-yellow-300' :
                                                isDesigner ? 'text-green-300' :
                                                    'text-blue-300'
                                                }`}
                                        />
                                        <span className="text-[10px] font-semibold opacity-90">
                                            {msg.user_name || msg.user_type}
                                        </span>
                                    </div>
                                    {msg.hasAttachment && msg.file_path ? (
                                        <div className="flex items-center gap-2 p-1">
                                            <FontAwesomeIcon icon={faFile} className="text-white/70" />
                                            <span className="text-[10px] text-white/90">{msg.filename}</span>
                                            <button
                                                onClick={() => downloadFile(msg.file_path, msg.filename)}
                                                className="text-white/80 hover:text-white ml-2"
                                                title="Download file"
                                            >
                                                <FontAwesomeIcon icon={faDownload} className="text-xl hover:text-white cursor-pointer" />
                                            </button>
                                        </div>
                                    ) : (
                                        <p className="text-xs whitespace-pre-wrap">{msg.text}</p>
                                    )}
                                </div>
                                <span className={`text-[10px] mt-1 px-1 ${isAdmin ? 'text-purple-200' :
                                    isDesigner ? 'text-green-200' :
                                        'text-blue-200'
                                    }`}>
                                    {msg.timestamp}
                                </span>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Input */}
            <div className="absolute bottom-0 left-0 right-0 border-t border-blue-400/20 px-3 py-2 bg-gradient-to-r from-gray-800 to-gray-700 rounded-b-xl">
                <div className="flex items-start gap-1.5">
                    <input ref={fileInputRef} type="file" onChange={handleFileUpload} multiple className="hidden" />
                    <button
                        onClick={triggerFileInput}
                        disabled={!orderid || !token}
                        className="w-10 h-10 flex items-center justify-center text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded disabled:opacity-50"
                        title="Attach file"
                    >
                        <FontAwesomeIcon icon={faPaperclip} className='text-[20px]' />
                    </button>
                    <textarea
                        ref={textareaRef}
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={!token ? "Not authenticated" : !orderid ? "Select an order to chat" : "Type a message..."}
                        className="flex-1 bg-gray-700/80 text-white px-3 py-2 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-400 border border-gray-600 disabled:opacity-50 resize-none"
                        disabled={!orderid || !token}
                        rows="1"
                        style={{
                            minHeight: '40px',
                            maxHeight: '120px',
                            overflowY: 'auto'
                        }}
                    />
                    <button
                        onClick={sendMessage}
                        disabled={!newMessage.trim() || !orderid || !token}
                        className={`w-10 h-10 flex items-center justify-center text-white rounded-lg transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg text-xs disabled:opacity-50 disabled:cursor-not-allowed ${userRole === 'admin' ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 hover:shadow-purple-500/20' :
                            userRole === 'designer' ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 hover:shadow-green-500/20' :
                                'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 hover:shadow-blue-500/20'
                            }`}
                        title="Send message"
                    >
                        <FontAwesomeIcon icon={faPaperPlane} className='text-lg' />
                    </button>
                </div>
            </div>
        </section>
    );
}