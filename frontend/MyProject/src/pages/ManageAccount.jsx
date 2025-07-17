import React, { useState } from 'react';
import { useAuth } from '../Api/AuthContext.jsx';
import api from '../Api/api.jsx';
import { useNavigate } from 'react-router-dom';

const ManageAccount = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      // Replace with your actual API endpoint
      await api.post(`/auth/change-password`, {
        email: user.email,
        oldPassword: passwords.oldPassword,
        newPassword: passwords.newPassword,
      });
      setSuccess('Password changed successfully!');
      setPasswords({ oldPassword: '', newPassword: '' });
    } catch (err) {
      setError('Failed to change password.');
    }
    setLoading(false);
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      // Replace with your actual API endpoint
      await api.delete(`/users/${user.id}`);
      setSuccess('Account deleted successfully.');
      logout();
      navigate('/register');
    } catch (err) {
      setError('Failed to delete account.');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-6 text-center text-[#32a86d]">Manage Account</h2>
      <div className="space-y-6">
        <button
          className="w-full bg-[#32a86d] text-white py-2 rounded hover:bg-[#278b59]"
          onClick={() => setShowChangePassword((v) => !v)}
        >
          Change Password
        </button>
        {showChangePassword && (
          <form onSubmit={handleChangePassword} className="space-y-4 mt-2">
            <input
              type="password"
              placeholder="Old Password"
              className="w-full border p-2 rounded"
              value={passwords.oldPassword}
              onChange={e => setPasswords({ ...passwords, oldPassword: e.target.value })}
              required
            />
            <input
              type="password"
              placeholder="New Password"
              className="w-full border p-2 rounded"
              value={passwords.newPassword}
              onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })}
              required
            />
            <button
              type="submit"
              className="w-full bg-[#32a86d] text-white py-2 rounded hover:bg-[#278b59]"
              disabled={loading}
            >
              {loading ? 'Changing...' : 'Change Password'}
            </button>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            {success && <div className="text-green-600 text-sm">{success}</div>}
          </form>
        )}
        <button
          className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600"
          onClick={() => setShowDeleteAccount((v) => !v)}
        >
          Delete Account
        </button>
        {showDeleteAccount && (
          <div className="mt-2">
            <p className="text-red-600 mb-2">This action is irreversible. All your data will be lost.</p>
            <button
              className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700"
              onClick={handleDeleteAccount}
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Confirm Delete Account'}
            </button>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            {success && <div className="text-green-600 text-sm">{success}</div>}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageAccount; 