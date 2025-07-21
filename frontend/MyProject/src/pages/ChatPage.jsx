import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../Api/AuthContext.jsx';
import api from '../Api/api.jsx';
// Required: npm install sockjs-client @stomp/stompjs
import SockJS from 'sockjs-client/dist/sockjs';
import { CompatClient, Stomp } from '@stomp/stompjs';

const ChatPage = () => {
  const { userId } = useParams(); // The user to chat with
  const { user } = useAuth(); // Current logged-in user
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const stompClient = useRef(null);
  const messagesEndRef = useRef(null);

  // Fetch chat history
  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/chat/history/${user.id}/${userId}`);
        setMessages(res.data);
      } catch (err) {
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };
    if (user && userId) fetchHistory();
  }, [user, userId]);

  // WebSocket setup
  useEffect(() => {
    if (!user) return;
    const socket = new SockJS('http://localhost:8080/ws');
    stompClient.current = Stomp.over(socket);
    stompClient.current.connect({}, () => {
      stompClient.current.subscribe(
        `/user/${user.id}/queue/messages`,
        (msg) => {
          const body = JSON.parse(msg.body);
          // Only add if from or to the current chat
          if (
            (body.senderId === user.id && body.receiverId === Number(userId)) ||
            (body.senderId === Number(userId) && body.receiverId === user.id)
          ) {
            setMessages((prev) => [...prev, body]);
          }
        }
      );
    });
    return () => {
      if (stompClient.current) stompClient.current.disconnect();
    };
  }, [user, userId]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim() || !stompClient.current) return;
    const msg = {
      senderId: user.id,
      receiverId: Number(userId),
      content: input.trim(),
    };
    stompClient.current.send('/app/chat.send', {}, JSON.stringify(msg));
    setInput('');
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="w-full max-w-2xl h-[80vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center gap-3 bg-[#32a86d]">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#32a86d] font-bold text-xl border-2 border-[#32a86d]">
            <span>💬</span>
          </div>
          <h2 className="text-xl font-bold text-white">Chat</h2>
        </div>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2 bg-gray-50">
          {loading ? (
            <div>Loading chat...</div>
          ) : messages.length === 0 ? (
            <div className="text-gray-500 text-center">No messages yet.</div>
          ) : (
            messages.map((msg, idx) => {
              const isMe = msg.senderId === user.id;
              return (
                <div
                  key={msg.id || idx}
                  className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  {/* Avatar for received messages */}
                  {!isMe && (
                    <div className="w-8 h-8 rounded-full bg-[#32a86d] flex items-center justify-center text-white font-bold text-lg border-2 border-[#32a86d]">
                      {msg.senderName ? msg.senderName.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                  <div
                    className={`px-4 py-2 rounded-2xl max-w-[70%] shadow-md break-words relative text-base ${
                      isMe
                        ? 'bg-gradient-to-br from-green-400 to-[#32a86d] text-white rounded-br-none'
                        : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                    }`}
                  >
                    <span>{msg.content}</span>
                    <div className={`text-xs mt-1 ${isMe ? 'text-green-100 text-right' : 'text-gray-400 text-left'}`}>
                      {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : ''}
                    </div>
                  </div>
                  {/* Spacer for sent messages */}
                  {isMe && <div className="w-8" />}
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
        {/* Input */}
        <div className="px-4 py-3 border-t bg-white flex gap-2 items-center">
          <input
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#32a86d] bg-gray-50"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..."
            autoFocus
          />
          <button
            className="bg-[#32a86d] hover:bg-[#278a57] text-white px-6 py-2 rounded-full font-semibold shadow transition"
            onClick={sendMessage}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage; 