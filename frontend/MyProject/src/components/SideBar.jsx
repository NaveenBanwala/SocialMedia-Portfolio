import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../Api/AuthContext.jsx';
import { Link, useNavigate } from 'react-router-dom';
import api from '../Api/api.jsx';
import SockJS from 'sockjs-client/dist/sockjs';
import { CompatClient, Stomp } from '@stomp/stompjs';

const SidebarOverlay = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [chatUsers, setChatUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [chatLoading, setChatLoading] = useState(false);
    const [input, setInput] = useState('');
    const stompClient = useRef(null);
    const messagesEndRef = useRef(null);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const toggleSidebar = () => setIsOpen(!isOpen);

    // Auto-close sidebar/menu button on scroll
    useEffect(() => {
        const handleScroll = () => {
            setIsOpen(false);
        };
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    // Fetch chat users (friends/following/followers)
    useEffect(() => {
        const fetchChatUsers = async () => {
            if (!user || !user.id) return;
            try {
                const [followersRes, followingRes] = await Promise.all([
                    api.get(`/users/${user.id}/followers`),
                    api.get(`/users/${user.id}/following`)
                ]);
                const allUsers = [...followersRes.data, ...followingRes.data];
                const uniqueUsers = [];
                const seen = new Set();
                for (const u of allUsers) {
                    if (u.id !== user.id && !seen.has(u.id)) {
                        uniqueUsers.push(u);
                        seen.add(u.id);
                    }
                }
                setChatUsers(uniqueUsers);
            } catch (err) {
                setChatUsers([]);
            }
        };
        fetchChatUsers();
    }, [user]);

    // Fetch chat history when selectedUser changes
    useEffect(() => {
        const fetchHistory = async () => {
            if (!user || !selectedUser) return;
            setChatLoading(true);
            try {
                const res = await api.get(`/chat/history/${user.id}/${selectedUser.id}`);
                setMessages(res.data);
            } catch (err) {
                setMessages([]);
            } finally {
                setChatLoading(false);
            }
        };
        if (selectedUser) fetchHistory();
    }, [user, selectedUser]);

    // WebSocket setup for chat
    useEffect(() => {
        if (!user || !selectedUser) return;
        const socket = new SockJS('http://localhost:8080/ws');
        stompClient.current = Stomp.over(socket);
        stompClient.current.connect({}, () => {
            stompClient.current.subscribe(
                `/user/${user.id}/queue/messages`,
                (msg) => {
                    const body = JSON.parse(msg.body);
                    if (
                        (body.senderId === user.id && body.receiverId === selectedUser.id) ||
                        (body.senderId === selectedUser.id && body.receiverId === user.id)
                    ) {
                        setMessages((prev) => [...prev, body]);
                    }
                }
            );
        });
        return () => {
            if (stompClient.current) stompClient.current.disconnect();
        };
    }, [user, selectedUser]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = () => {
        if (!input.trim() || !stompClient.current || !selectedUser) return;
        const msg = {
            senderId: user.id,
            receiverId: selectedUser.id,
            content: input.trim(),
        };
        console.log('Sending message:', msg); // Debug log
        stompClient.current.send('/app/chat.send', {}, JSON.stringify(msg));
        setInput('');
    };

    return (
    <div className="bg-gray-100 h-10">
      {/* Toggle Button on right */}
        <button
        onClick={toggleSidebar}
        className="m-4 p-2 bg-[#32a86d] text-white rounded hover:bg-[#2c915d] top-0 right-5 fixed z-50 shadow-lg transition-transform duration-300 ease-in-out"
        style={{ right: 20, left: 'auto', position: 'fixed' }}
        >
        {isOpen ? 'Close Menu' : 'Open Menu'}
        </button>
        {isOpen && (
          <div className="fixed top-0 left-0 w-64 h-full bg-[#32a86d] shadow-2xl z-40 flex flex-col p-6 gap-4">
            <h2 className="text-2xl font-bold mb-6 text-center text-white">Social Portfolio</h2>
            <Link to="/dashboard" className="w-full">
              <button className="w-full py-2 px-4 rounded font-semibold bg-white text-[#32a86d] hover:bg-[#2c915d] hover:text-white transition mb-2">Home</button>
            </Link>
            <button
              className="w-full py-2 px-4 rounded font-semibold bg-white text-[#32a86d] hover:bg-[#2c915d] hover:text-white transition mb-2"
              onClick={() => navigate('/support')}
            >
              Support
            </button>
            <div className="w-full mb-2">
              <button
                onClick={() => navigate('/manage-friends')}
                className="w-full py-2 px-4 rounded font-semibold bg-white text-[#32a86d] border-2 border-white hover:border-[#2c915d] transition mb-2"
            >
                Manage Friends
            </button>
            </div>
            <button
                onClick={() => navigate('/manage-account')}
                className="w-full py-2 px-4 rounded font-semibold bg-white text-[#32a86d] border-2 border-white hover:border-[#2c915d] transition mb-2"
            >
                Manage Account
            </button>
            <div className="w-full mb-2">
              <button
                onClick={handleLogout}
                className="w-full py-2 px-4 rounded font-semibold bg-red-500 text-white hover:bg-red-600 transition"
              >
                Logout
              </button>
            </div>
            {/* Chat System Button */}
            <button
              className="w-full py-2 px-4 rounded font-semibold bg-white text-[#32a86d] hover:bg-[#278a57] hover:text-white transition mb-2"
              title="Open Chat"
              onClick={() => setShowChat(true)}
            >
              Messages
            </button>
          </div>
        )}
        {/* Chat Modal Centered */}
        {showChat && (
          <div className="fixed left-0 right-0 top-8 flex items-start justify-center z-50 bg-black bg-opacity-30 min-h-screen">
            <div className="w-[55vw] h-[60vh] mt-0 bg-white shadow-2xl flex flex-col border rounded-xl">
              <div className="flex items-center justify-between p-2 border-b">
                <h2 className="text-lg font-bold text-[#32a86d]">Messages</h2>
                <button className="text-gray-500 hover:text-red-500 text-base" onClick={() => { setShowChat(false); setSelectedUser(null); }}>Close</button>
              </div>
              <div className="flex flex-1 min-h-0">
                {/* User List */}
                <div className="w-[35%] border-r overflow-y-auto min-w-[120px] h-full flex flex-col">
                  <ul className="space-y-2 p-2 flex-1 overflow-y-auto">
                    {chatUsers.length === 0 ? (
                      <li className="text-gray-500 text-sm">No friends or followers to chat with.</li>
                    ) : (
                      chatUsers.map(u => (
                        <li key={u.id}>
                          <button
                            className={`w-full text-left px-2 py-2 rounded hover:bg-green-100 text-sm ${selectedUser && selectedUser.id === u.id ? 'bg-green-200 font-bold' : ''}`}
                            onClick={() => setSelectedUser(u)}
                          >
                            <span className="font-semibold">{u.username || u.name}</span>
                            <span className="ml-1 text-xs text-gray-500">{u.email}</span>
                          </button>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
                {/* Chat Window */}
                <div className="flex-1 flex flex-col min-w-0 h-full">
                  {selectedUser ? (
                    <div className="flex flex-col h-full">
                      <div className="flex items-center gap-2 p-2 border-b">
                        <span className="font-bold text-base text-[#32a86d]">Chat with {selectedUser.username || selectedUser.name}</span>
                        <button className="ml-auto text-xs text-gray-500 hover:underline" onClick={() => setSelectedUser(null)}>Back</button>
                      </div>
                      <div className="flex-1 overflow-y-auto p-2 bg-gray-50" style={{ minHeight: '100px' }}>
                        {chatLoading ? (
                          <div>Loading chat...</div>
                        ) : messages.length === 0 ? (
                          <div className="text-gray-500 text-sm">No messages yet.</div>
                        ) : (
                          messages.map((msg, idx) => {
                            const isSent = msg.senderId === user.id;
                            return (
                              <div
                                key={msg.id || idx}
                                className={`mb-3 flex ${isSent ? 'justify-end' : 'justify-start'}`}
                              >
                                <div
                                  className={`px-3 py-2 rounded-xl max-w-xs break-words shadow text-sm flex flex-col ${
                                    isSent
                                      ? 'bg-green-200 text-right items-end ml-4' // Sent: right
                                      : 'bg-white border border-gray-300 text-left items-start mr-4' // Received: left
                                  }`}
                                >
                                  <span className="block text-sm">{msg.content}</span>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : ''}
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                        <div ref={messagesEndRef} />
                      </div>
                      <div className="flex gap-2 p-2 border-t bg-white">
                        <input
                          className="flex-1 border border-[#32a86d] rounded px-3 py-2 text-sm focus:outline-none"
                          type="text"
                          value={input}
                          onChange={e => setInput(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && sendMessage()}
                          placeholder="Type a message..."
                        />
                        <button
                          className="bg-[#32a86d] text-white px-4 py-2 rounded text-sm font-semibold hover:bg-[#278a57]"
                          onClick={sendMessage}
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 text-base">Select a user to start chatting</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
    );
};

export default SidebarOverlay;
