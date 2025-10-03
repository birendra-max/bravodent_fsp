import { useState, useRef, useEffect ,useContext} from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faUser, faVideo, faTimes, faFile, faDownload, 
    faSmile, faPaperclip, faPaperPlane
} from "@fortawesome/free-solid-svg-icons";
import { UserContext } from '../Context/UserContext';

export default function Chatbox() {

    const user=useContext(UserContext);

    const [messages, setMessages] = useState([
        { id: 1, text: "Hey! How's it going?", sender: 'other', timestamp: '2:30 PM', type: 'text' },
        { id: 2, text: "I'm good! Working on the project.", sender: 'user', timestamp: '2:31 PM', type: 'text' }
    ]);
    const [newMessage, setNewMessage] = useState('');
    const [isOnline, setIsOnline] = useState(true);
    const fileInputRef = useRef(null);
    const chatBodyRef = useRef(null);
    const chatboxRef = useRef(null);
    const posRef = useRef({ x: 0, y: 0, left: 0, top: 0 });

    // Auto-scroll to bottom
    useEffect(() => {
        if (chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }
    }, [messages]);

    // Enable dragging
    useEffect(() => {
        const chatbox = chatboxRef.current;
        const header = document.getElementById("chatHeader");

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

    const sendMessage = () => {
        if (newMessage.trim()) {
            const message = {
                id: messages.length + 1,
                text: newMessage.trim(),
                sender: 'user',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                type: 'text'
            };
            setMessages([...messages, message]);
            setNewMessage('');
        }
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const message = {
                id: messages.length + 1,
                text: file.name,
                sender: 'user',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                type: 'file',
                fileType: file.type,
                fileSize: formatFileSize(file.size)
            };
            setMessages([...messages, message]);
            event.target.value = '';
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
        <>
            <section 
                id="chatbox"
                ref={chatboxRef}
                style={{ position: "fixed", top: "80px", right: "24px" }}
                className="md:w-[320px] w-[300px] h-[420px] rounded-xl shadow-xl border border-blue-400/30 bg-gradient-to-br from-gray-900 to-gray-800 z-[999] hidden overflow-hidden backdrop-blur-sm">

                {/* Header */}
                <div id="chatHeader"
                    className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-blue-800/60 to-purple-800/60 rounded-t-xl border-b border-blue-400/30 cursor-move select-none">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md ring-1 ring-blue-400/50 relative">
                            <FontAwesomeIcon icon={faUser} className="text-xs" />
                        </div>
                        <div>
                            <h4 className="text-white font-semibold text-sm bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                                John Doe
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
                            onClick={() => document.getElementById('chatbox').style.display="none"}>
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    </div>
                </div>

                {/* Chat Body */}
                <div ref={chatBodyRef} id="chatBody" className="p-3 h-72 overflow-y-auto space-y-3 bg-gradient-to-br from-gray-900 to-gray-800 scroll-smooth">
                    {messages.map((message) => (
                        <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] p-2 rounded-lg shadow-md ${
                                message.sender === 'user' 
                                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-br-none' 
                                    : 'bg-gray-700 text-white rounded-bl-none border border-gray-600'
                            }`}>
                                {message.type === 'file' ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-blue-500/20 rounded flex items-center justify-center">
                                            <FontAwesomeIcon icon={faFile} className="text-blue-300 text-xs" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium truncate">{message.text}</p>
                                            <div className="flex items-center gap-1 text-[10px] opacity-80">
                                                <span>{message.fileType.split('/')[1]?.toUpperCase() || 'FILE'}</span>
                                                <span>•</span>
                                                <span>{message.fileSize}</span>
                                            </div>
                                        </div>
                                        <button className="text-blue-200 hover:text-white transition-colors text-xs">
                                            <FontAwesomeIcon icon={faDownload} />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-xs whitespace-pre-wrap leading-relaxed">{message.text}</p>
                                        <span className={`text-[10px] block mt-0.5 ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-400'}`}>
                                            {message.timestamp}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Input Area */}
                <div className="absolute bottom-0 left-0 right-0 border-t border-blue-400/20 px-3 py-2 bg-gradient-to-r from-gray-800 to-gray-700 rounded-b-xl">
                    <div className="flex items-center gap-1.5">
                        <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                        <button className="w-7 h-7 flex items-center justify-center text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/20 rounded transition-all duration-200 cursor-pointer text-xs">
                            <FontAwesomeIcon icon={faSmile} />
                        </button>
                        <button onClick={triggerFileInput} className="w-7 h-7 flex items-center justify-center text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded transition-all duration-200 cursor-pointer text-xs">
                            <FontAwesomeIcon icon={faPaperclip} />
                        </button>
                        <input 
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            type="text" 
                            placeholder="Type a message..."
                            className="flex-1 bg-gray-700/80 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-transparent border border-gray-600 placeholder-gray-400 text-xs transition-all duration-200"
                        />
                        <button 
                            onClick={sendMessage}
                            disabled={!newMessage.trim()}
                            className="w-8 h-8 flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-lg transition-all duration-200 cursor-pointer shadow-md hover:shadow-blue-500/20 text-xs disabled:cursor-not-allowed">
                            <FontAwesomeIcon icon={faPaperPlane} />
                        </button>
                    </div>
                </div>
            </section>                              
        </>
    );
}
