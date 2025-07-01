import React, { useEffect, useState } from 'react';
import { useAuth } from '../Api/AuthContext.jsx';
import api from '../Api/api.jsx';

const Inbox = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [friendRequests, setFriendRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingRequests, setLoadingRequests] = useState(true);

    useEffect(() => {
        const fetchNotifications = async () => {
            if (!user || !user.id) return;
            setLoading(true);
            try {
                const res = await api.get(`/users/${user.id}/notifications`);
                setNotifications(res.data);
            } catch (err) {
                setNotifications([]);
            } finally {
                setLoading(false);
            }
        };
        fetchNotifications();
    }, [user]);

    useEffect(() => {
        const fetchFriendRequests = async () => {
            if (!user) return;
            setLoadingRequests(true);
            try {
                const res = await api.get('/users/me/friend-requests');
                setFriendRequests(res.data);
            } catch (err) {
                setFriendRequests([]);
            } finally {
                setLoadingRequests(false);
            }
        };
        fetchFriendRequests();
    }, [user]);

    const markAsRead = async (notifId) => {
        try {
            await api.patch(`/notifications/${notifId}/read`);
            setNotifications(notifications => notifications.map(n => n.id === notifId ? { ...n, read: true } : n));
        } catch (err) {}
    };

    const handleAccept = async (fromUserId) => {
        try {
            await api.post(`/users/${fromUserId}/friend-request/accept`);
            // Also follow each other
            await api.post(`/users/${user.id}/follow?followerId=${fromUserId}`);
            // Remove from pending list
            setFriendRequests(reqs => reqs.filter(r => r.fromUserId !== fromUserId));
            // Optionally, refresh followers/following elsewhere
        } catch (err) {
            alert('Failed to accept friend request.');
        }
    };

    const handleDecline = async (fromUserId) => {
        try {
            await api.post(`/users/${fromUserId}/friend-request/decline`);
            setFriendRequests(reqs => reqs.filter(r => r.fromUserId !== fromUserId));
        } catch (err) {
            alert('Failed to decline friend request.');
        }
    };

    return (
        <div className="max-w-2xl mx-auto mt-8 p-4 bg-white rounded shadow">
            <h2 className="text-2xl font-bold mb-4 text-[#32a86d]">Inbox / Notifications</h2>
            <h3 className="text-lg font-semibold mb-2">Friend Requests</h3>
            {loadingRequests ? (
                <div>Loading friend requests...</div>
            ) : friendRequests.length === 0 ? (
                <div className="text-gray-500 mb-4">No pending friend requests.</div>
            ) : (
                <ul className="space-y-3 mb-6">
                    {friendRequests.map((req) => (
                        <li key={req.id} className="p-3 rounded border bg-green-50 border-[#32a86d] flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                {req.fromProfilePicUrl && (
                                    <img src={req.fromProfilePicUrl} alt="Profile" className="w-8 h-8 rounded-full object-cover border-2 border-[#32a86d]" />
                                )}
                                <span className="font-semibold">{req.fromUsername}</span> sent you a friend request.
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleAccept(req.fromUserId)} className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">Accept</button>
                                <button onClick={() => handleDecline(req.fromUserId)} className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">Decline</button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
            <h3 className="text-lg font-semibold mb-2">Other Notifications</h3>
            {loading ? (
                <div>Loading...</div>
            ) : notifications.length === 0 ? (
                <div className="text-gray-500">No notifications yet.</div>
            ) : (
                <ul className="space-y-3">
                    {notifications.map((notif) => (
                        <li key={notif.id} className={`p-3 rounded border ${notif.read ? 'bg-gray-100' : 'bg-green-50 border-[#32a86d]'}`}>
                            <div className="flex justify-between items-center">
                                <span>{notif.message}</span>
                                <span className="text-xs text-gray-400">{new Date(notif.createdAt).toLocaleString()}</span>
                            </div>
                            {!notif.read && (
                                <button onClick={() => markAsRead(notif.id)} className="text-xs text-blue-500 mt-1">Mark as read</button>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Inbox;
