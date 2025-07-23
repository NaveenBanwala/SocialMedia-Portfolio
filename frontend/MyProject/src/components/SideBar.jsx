import { useState, useEffect, useRef, useContext } from 'react';
import { useAuth } from '../Api/AuthContext.jsx';
import { Link, useNavigate } from 'react-router-dom';
import api from '../Api/api.jsx';
import SockJS from 'sockjs-client/dist/sockjs';
import { CompatClient, Stomp } from '@stomp/stompjs';
import React, { createContext } from 'react';
import { ChatModalContext } from '../contexts/ChatModalContext.jsx';

const SidebarOverlay = ({ openChatFromNavbar, onChatModalOpened }) => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const { showChat, setShowChat, selectedUser, setSelectedUser } = useContext(ChatModalContext);
    const [isOpen, setIsOpen] = useState(false);
    const [chatUsers, setChatUsers] = useState([]);
    const [messages, setMessages] = useState([]);
    const [chatLoading, setChatLoading] = useState(false);
    const [input, setInput] = useState('');
    const [modalView, setModalView] = useState('chat'); // 'chat' or 'adminResponse'
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
            // If admin, fetch all users
            if (user.roles && (user.roles.includes('ROLE_ADMIN') || user.roles.some?.(r => r === 'ROLE_ADMIN' || r.name === 'ROLE_ADMIN'))) {
                try {
                    const res = await api.get('/admin/users');
                    setChatUsers(res.data.filter(u => u.id !== user.id)); // Exclude self
                } catch (err) {
                    setChatUsers([]);
                }
                return;
            }
            // Regular user: fetch friends/followers/following
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

    useEffect(() => {
      if (openChatFromNavbar) {
        setModalView('chat');
        setShowChat(true);
        if (onChatModalOpened) onChatModalOpened();
      }
    }, [openChatFromNavbar]);

    const sendMessage = () => {
        if (!input.trim() || !stompClient.current || !selectedUser) return;
        const msg = {
            senderId: user.id,
            receiverId: selectedUser.id,
            content: input.trim(),
            timestamp: new Date().toISOString(), // Add timestamp for instant display
        };
        // Instantly add the message to the UI
        setMessages(prev => [...prev, msg]);
        // Send to server
        stompClient.current.send('/app/chat.send', {}, JSON.stringify(msg));
        setInput('');
    };

    return (
    <div className="bg-gray-100 h-10 ">
      {/* Toggle Button on right */}
        <button
        onClick={toggleSidebar}
        className="m-4 p-2 bg-[#32a86d] text-white rounded hover:bg-[#2c915d] top-0 right-5 fixed z-50 shadow-lg transition-transform duration-300 ease-in-out"
        style={{ right: 20, left: 'auto', position: 'fixed' }}
        >
        {isOpen ? 'Close Menu' : 'Open Menu'}
        </button>
        {isOpen && (
          <div className="fixed top-0 left-0 w-64 h-full  shadow-2xl z-40 flex flex-col p-6 gap-4 overflow-y-auto bg-green-200">
            <h2 className="text-2xl font-bold mb-6 text-center text-black">Social Portfolio</h2>


            {/* Admin-only Create Contest link at the top */}
            {user && (user.role === "ADMIN" || user.roles?.includes("ROLE_ADMIN") || user.roles?.some?.(r => r === "ROLE_ADMIN" || r.name === "ROLE_ADMIN")) && (
              <button
              
                className="w-full py-2 px-4 rounded font-semibold bg-white text-green-700 hover:bg-blue-100 text-blue-700 font-semibold mb-2 no-underline font-semibold text-center" onClick={()=>
                  navigate('/admin/create-contest')
                }
              >
                Create-Contest
              </button>
            )}


            {/* Show only Messages for admin, Admin Response for regular users */}
            {user && (user.roles?.includes('ROLE_ADMIN') || user.roles?.some?.(r => r === 'ROLE_ADMIN' || r.name === 'ROLE_ADMIN')) ? (
              <button
                className="w-full py-2 px-4 rounded font-semibold bg-white text-[#32a86d] hover:bg-[#278a57] hover:text-white transition mb-2"
                title="Open Chat System"
                onClick={() => { setModalView('chat');
                  setShowChat(true); }}
              >
                Messages
              </button>
            ) : (
              <button
                className="w-full py-2 px-4 rounded font-semibold bg-white text-[#32a86d] hover:bg-[#278a57] hover:text-white transition mb-2"
                title="Open Admin Response"
                onClick={() => { setModalView('adminResponse'); setShowChat(true); }}
              >
                Admin Response
              </button>
            )}
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
            {/* Remove Messages button from here */}
          </div>
        )}
        {/* Chat Modal Centered */}
        {showChat && (
          <div className="fixed left-0 right-0 top-0 flex items-center justify-center z-50 bg-black bg-opacity-40 min-h-screen min-w-full">
            {modalView === 'chat' ? (
              <div className="bg-white rounded-2xl shadow-2xl border-2 border-[#32a86d] flex flex-col w-full max-w-5xl h-[85vh] p-0 overflow-hidden">
                {/* Chat System UI (copied from previous chat modal) */}
                <div className="flex items-center justify-between p-4 border-b bg-[#f7fdf9]">
                  <h2 className="text-3xl font-bold text-[#32a86d]">Messages</h2>
                  <button className="text-gray-500 hover:text-red-500 text-xl font-semibold" onClick={() => { setShowChat(false); setSelectedUser(null); }}>Close</button>
                </div>
                <div className="flex flex-1 min-h-0">
                  {/* User List */}
                  <div className="w-[30%] border-r overflow-y-auto min-w-[180px] h-full flex flex-col bg-[#f7fdf9]">
                    <ul className="space-y-3 p-4 flex-1 overflow-y-auto">
                      {chatUsers.length === 0 ? (
                        <li className="text-gray-500 text-lg">No friends or followers to chat with.</li>
                      ) : (
                        chatUsers.map(u => (
                          <li key={u.id}>
                            <button
                              className={`w-full text-left px-4 py-3 rounded-xl hover:bg-green-100 text-lg ${selectedUser && selectedUser.id === u.id ? 'bg-green-200 font-bold' : ''}`}
                              onClick={() => setSelectedUser(u)}
                            >
                              <span className="flex items-center gap-3">
                                {u.profilePicUrl ? (
                                  <img
                                    src={u.profilePicUrl.startsWith('http') ? u.profilePicUrl : `http://localhost:8080${u.profilePicUrl}`}
                                    alt="Profile"
                                    className="w-8 h-8 rounded-full object-cover border border-[#32a86d]"
                                    onError={e => { e.target.style.display = 'none'; }}
                                  />
                                ) : (
                                  <span className="w-8 h-8 rounded-full bg-[#32a86d] flex items-center justify-center text-white font-bold text-base border border-[#32a86d]">
                                    {u.username ? u.username.charAt(0).toUpperCase() : 'U'}
                                  </span>
                                )}
                                <span
                                  className="font-semibold cursor-pointer hover:underline"
                                  onClick={e => {
                                    e.stopPropagation();
                                    window.location.href = `/profile/${u.id}`;
                                  }}
                                >
                                  {u.username || u.name}
                                </span>
                              </span>
                              <span className="ml-2 text-base text-gray-500">{u.email}</span>
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
                        <div className="flex items-center gap-2 p-4 border-b bg-white">
                          <span className="font-bold text-2xl text-[#32a86d]">Chat with {selectedUser.username || selectedUser.name}</span>
                          <button className="ml-auto text-lg text-gray-500 hover:underline" onClick={() => setSelectedUser(null)}>Back</button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 bg-gray-50" style={{ minHeight: '200px' }}>
                          {chatLoading ? (
                            <div className="text-lg">Loading chat...</div>
                          ) : messages.length === 0 ? (
                            <div className="text-gray-500 text-lg">No messages yet.</div>
                          ) : (
                            messages.map((msg, idx) => {
                              const isSent = msg.senderId === user.id;
                              return (
                                <div
                                  key={msg.id || idx}
                                  className={`mb-5 flex ${isSent ? 'justify-end' : 'justify-start'}`}
                                >
                                  <div
                                    className={`px-5 py-3 rounded-2xl max-w-2xl break-words shadow-lg text-lg flex flex-col ${
                                      isSent
                                        ? 'bg-green-200 text-right items-end ml-6' // Sent: right
                                        : 'bg-white border border-gray-300 text-left items-start mr-6' // Received: left
                                    }`}
                                  >
                                    <span className="block text-lg">{msg.content}</span>
                                    <div className="text-xs text-gray-500 mt-2">
                                      {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : ''}
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          )}
                          <div ref={messagesEndRef} />
                        </div>
                        <div className="flex gap-3 p-4 border-t bg-white">
                          <input
                            className="flex-1 border-2 border-[#32a86d] rounded-full px-5 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-[#32a86d] bg-gray-50"
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && sendMessage()}
                            placeholder="Type a message..."
                          />
                          <button
                            className="bg-[#32a86d] text-white px-8 py-3 rounded-full text-lg font-bold hover:bg-[#278a57] shadow-lg"
                            onClick={sendMessage}
                          >
                            Send
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400 text-2xl">Select a user to start chatting</div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-2xl border-2 border-[#32a86d] flex flex-col w-full max-w-2xl h-[60vh] p-0 overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b bg-[#f7fdf9]">
                  <h2 className="text-3xl font-bold text-[#32a86d]">Admin Response</h2>
                  <button className="text-gray-500 hover:text-red-500 text-xl font-semibold" onClick={() => { setShowChat(false); setSelectedUser(null); }}>Close</button>
                </div>
                <AdminResponseModal user={user} />
              </div>
            )}
          </div>
        )}
    </div>
    );
};

function AdminResponseModal({ user }) {
  const [adminReply, setAdminReply] = useState('');
  const [loading, setLoading] = useState(true);
  const [noReply, setNoReply] = useState(false);

  useEffect(() => {
    const fetchLatest = async () => {
      setLoading(true);
      try {
        let res;
        if (user && user.id) {
          res = await api.get(`/support?userId=${user.id}`);
        }
        const messages = res?.data || [];
        const latest = messages.length > 0 ? messages[messages.length - 1] : null;
        if (latest && latest.adminReply) {
          setAdminReply(latest.adminReply);
          setNoReply(false);
        } else {
          setNoReply(true);
        }
      } catch {
        setNoReply(true);
      } finally {
        setLoading(false);
      }
    };
    fetchLatest();
  }, [user]);

  return (
    <div className="flex flex-1 bg-gray-100 justify-center items-start py-10 overflow-auto">
      <div className="bg-white shadow rounded p-8 w-full max-w-xl mx-auto my-auto">
        {loading ? (
          <div>Loading...</div>
        ) : adminReply ? (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded text-lg">
            <b>Admin Reply:</b> {adminReply}
          </div>
        ) : noReply ? (
          <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded text-lg">
            No admin response yet.
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default SidebarOverlay;
