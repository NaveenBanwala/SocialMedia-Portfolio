import React, { useEffect, useState } from 'react';
import AdminUserRow from '../components/AdminUserRow';
import AdminProjectRow from '../components/AdminProjectRow';
import api from '../Api/api.jsx';

const AdminPanel = () => {
  // State for users and projects
  const [users, setUsers] = useState([]);
  const [mostFollowed, setMostFollowed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch users and projects on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, mostFollowedRes] = await Promise.all([
          api.get('/admin/users'),
          api.get('/admin/most-followed-users'),
        ]);
        setUsers(userRes.data);
        setMostFollowed(mostFollowedRes.data);
      } catch (err) {
        setError('Error loading admin data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Handle user delete
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(users.filter(u => u.id !== userId));
    } catch (err) {
      alert('Error deleting user.');
    }
  };

  // Handle remove user profile picture
  const handleRemoveUserProfilePic = async (userId) => {
    if (!window.confirm('Are you sure you want to remove this user\'s profile picture?')) return;
    try {
      await api.delete(`/admin/users/${userId}/profile-picture`);
      // Refresh the users list to show updated profile picture
      const userRes = await api.get('/admin/users');
      setUsers(userRes.data);
      alert('Profile picture removed successfully.');
    } catch (err) {
      alert('Error removing profile picture: ' + (err.response?.data || err.message));
    }
  };

  if (loading) return <div className="p-6">Loading admin data...</div>;

  return (
    <div className="p-6 min-h-screen bg-white">
      <h1 className="text-2xl font-bold text-[#32a86d] border-b-2 border-[#32a86d] pb-2 mb-6">Admin Panel</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      
      {/* Users Table */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-[#32a86d] mb-2">Users ({users.length} total)</h2>
        <table className="w-full border-2 border-[#32a86d] rounded-xl bg-white">
          <thead>
            <tr className="bg-[#32a86d] text-white">
              <th className="p-2 text-left">User</th>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Role</th>
              <th className="p-2 text-center">Followers</th>
              <th className="p-2 text-center">Following</th>
              <th className="p-2 text-center">Post Likes</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <AdminUserRow key={user.id} user={user} onDelete={handleDeleteUser} onRemoveProfilePic={handleRemoveUserProfilePic} />
            ))}
          </tbody>
        </table>
        {users.length === 0 && <div className="text-gray-500 mt-2">No users found.</div>}
      </div>
      
      {/* Most Followed Users Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-[#32a86d] mb-2">Most Followed Users</h2>
        <table className="w-full border-2 border-[#32a86d] rounded-xl bg-white">
          <thead>
            <tr className="bg-[#32a86d] text-white">
              <th className="p-2 text-left">User</th>
              <th className="p-2 text-center">Followers</th>
            </tr>
          </thead>
          <tbody>
            {mostFollowed.map(user => (
              <tr key={user.userId}>
                <td className="p-2">{user.username}</td>
                <td className="p-2 text-center">{user.followerCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {mostFollowed.length === 0 && <div className="text-gray-500 mt-2">No data available.</div>}
      </div>
    </div>
  );
};

export default AdminPanel;