import React, { useState, useEffect, useRef } from 'react';
import api from '../Api/api.jsx';
import { useAuth } from '../Api/AuthContext.jsx';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

function Support() {
  const [form, setForm] = useState({ message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [adminReply, setAdminReply] = useState('');
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, user } = useAuth();
  const stompClient = useRef(null);
  const [noReply, setNoReply] = useState(false);

  // WebSocket setup for admin reply
  useEffect(() => {
    const socket = new SockJS('http://localhost:8080/ws');
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe('/user/queue/support', (msg) => {
          const newMsg = JSON.parse(msg.body);
          if (user && newMsg.userId === user.id) {
            if (newMsg.adminReply) setAdminReply(newMsg.adminReply);
          }
        });
      },
    });
    client.activate();
    stompClient.current = client;
    return () => {
      client.deactivate();
    };
    // eslint-disable-next-line
  }, [user]);

  // Fetch latest support message for this user
  useEffect(() => {
    const fetchLatest = async () => {
      setLoading(true);
      try {
        let res;
        if (user && user.id) {
          res = await api.get('/support/my');
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
    // eslint-disable-next-line
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/support', { message: form.message });
      setSubmitted(true);
      setForm({ message: '' });
    } catch (err) {
      alert('Failed to submit support request.');
    }
  };

  return (
    <div className="flex min-h-screen max-w-full bg-gray-100 justify-center items-start py-10">
      <div className="bg-white shadow rounded p-8 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-[#32a86d] mb-2">Support</h1>
        <p className="mb-6 text-gray-600">Need help or have a question? Fill out the form below and our team will get back to you as soon as possible. You can also check the FAQ section for quick answers.</p>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Contact Form - Only Message field shown */}
          <div>
            <label className="block text-sm m-2 font-medium text-gray-700">Message</label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              required
              rows={4}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#32a86d]"
            />
          </div>
          <button
            type="submit"
            className="bg-[#32a86d] text-white px-6 py-2 rounded hover:bg-[#2c915d] transition"
            disabled={submitted}
          >
            {submitted ? 'Submitted!' : 'Submit'}
          </button>
          {submitted && (
            <p className="text-green-600 text-sm mt-2">Thank you for contacting support! We'll get back to you soon.</p>
          )}
        </form>
        {/* FAQ Section inside foam div, after form */}
        <div className="mt-10">
          <h2 className="text-xl font-semibold text-[#32a86d] mb-4">Frequently Asked Questions</h2>
          <div className="space-y-3">
            <div className="bg-gray-50 p-3 rounded">
              <p className="font-medium text-gray-800">How do I reset my password?</p>
              <p className="text-sm text-gray-600">Go to your profile settings and click on 'Change Password'. Follow the instructions to reset your password.</p>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <p className="font-medium text-gray-800">How can I edit or delete my project?</p>
              <p className="text-sm text-gray-600">Navigate to your profile, find your project, and use the 'Edit' or 'Delete' buttons next to each project.</p>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <p className="font-medium text-gray-800">Who can see my posts and projects?</p>
              <p className="text-sm text-gray-600">All registered users can view your public posts and projects. You can manage privacy settings in your profile.</p>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <p className="font-medium text-gray-800">How do I contact support?</p>
              <p className="text-sm text-gray-600">Use the contact form above to send us your query. We typically respond within 24-48 hours.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Support;
