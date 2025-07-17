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
    <div className=" mx-auto mt-8 p-4 bg-white rounded shadow flex flex-col h-[80vh] w-[80vh]">
      <h2 className="text-2xl font-bold mb-4 text-[#32a86d]">Chat</h2>
      <div className="flex-1 overflow-y-auto mb-4 border rounded p-2 bg-gray-50">
        {loading ? (
          <div>Loading chat...</div>
        ) : messages.length === 0 ? (
          <div className="text-gray-500">No messages yet.</div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id || Math.random()}
              className={`mb-2 flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`px-3 py-2 rounded-lg max-w-xs break-words ${
                  msg.senderId === user.id
                    ? 'bg-green-200 text-right'
                    : 'bg-gray-200 text-left'
                }`}
              >
                <span>{msg.content}</span>
                <div className="text-xs text-gray-500 mt-1">
                  {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : ''}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex gap-2">
        <input
          className="flex-1 border rounded px-3 py-2"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
        />
        <button
          className="bg-[#32a86d] text-white px-4 py-2 rounded hover:bg-[#278a57]"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatPage; 