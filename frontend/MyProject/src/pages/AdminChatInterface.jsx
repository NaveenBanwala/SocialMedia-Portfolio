import { useEffect, useState, useRef } from 'react';
import api from '../Api/api.jsx';
import { useAuth } from '../Api/AuthContext.jsx';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

function AdminChatInterface() {
  const { isAdmin } = useAuth();
  const [messages, setMessages] = useState([]);
  const [replies, setReplies] = useState({});
  const stompClient = useRef(null);

  // Fetch initial messages
  useEffect(() => {
    if (isAdmin) {
      api.get('/support')
      .then(res => setMessages(res.data));
    }
  }, [isAdmin]);

  // WebSocket setup
  useEffect(() => {
    if (!isAdmin) return;
    const socket = new SockJS('http://localhost:8080/ws');
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe('/topic/support', (msg) => {
          const newMsg = JSON.parse(msg.body);
          setMessages(prev => {
            // If message exists, update it; else, add it
            const idx = prev.findIndex(m => m.id === newMsg.id);
            if (idx !== -1) {
              const updated = [...prev];
              updated[idx] = newMsg;
              return updated;
            } else {
              return [...prev, newMsg];
            }
          });
        });
      },
    });
    client.activate();
    stompClient.current = client;
    return () => {
      client.deactivate();
    };
  }, [isAdmin]);

  const handleReply = async (id) => {
    try {
      await api.post(`/support/${id}/reply`, { reply: replies[id] });
      setReplies(r => ({ ...r, [id]: '' }));
    } catch (err) {
      alert('Failed to send reply.');
    }
  };

  return (
    <div className="p-8 min-h-screen bg-gray-100">
      <div className="bg-white shadow rounded p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-[#32a86d] mb-4">Support Messages</h1>
        {messages.length === 0 ? (
          <div className="text-gray-500">No support messages found.</div>
        ) : (
          messages.map(msg => (
            <div key={msg.id} className="mb-6 border-b pb-4">
              <div className="font-semibold text-[#32a86d]">{msg.username || 'Unknown User'} ({msg.email})</div>
              <div className="text-gray-700 mb-2">{msg.message}</div>
              <div className="text-sm text-gray-500 mb-2">Sent: {msg.createdAt ? new Date(msg.createdAt).toLocaleString() : ''}</div>
              <div>
                <b>Admin Reply:</b> {msg.adminReply ? (
                  <span className="text-green-700 ml-2">{msg.adminReply}</span>
                ) : (
                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      value={replies[msg.id] || ''}
                      onChange={e => setReplies(r => ({ ...r, [msg.id]: e.target.value }))}
                      className="border px-2 py-1 rounded w-64"
                      placeholder="Type your reply..."
                    />
                    <button
                      onClick={() => handleReply(msg.id)}
                      className="bg-[#32a86d] text-white px-4 py-1 rounded hover:bg-[#2c915d]"
                    >
                      Send
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
export default AdminChatInterface;