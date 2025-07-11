import React, { useState, useEffect } from 'react';
import api from '../Api/api.jsx';
import { useNavigate } from 'react-router-dom';

const EditProfile = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    email: '',
    location: '',
    bio: '',
    skills: '', // comma separated
  });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resume, setResume] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/users/me');
        setUser(res.data);
        setForm({
          username: res.data.username || '',
          email: res.data.email || '',
          location: res.data.location || '',
          bio: res.data.bio || '',
          skills: res.data.skills ? res.data.skills.join(', ') : '',
        });
      } catch (err) {
        setError('Failed to load user data');
      }
    };
    fetchUser();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleResumeChange = (e) => {
    setResume(e.target.files[0]);
  };
  const handleDownloadResume = async () => {
    if (!user?.resumeUrl) return;
    try {
      const response = await api.get(`/users/${user.id}/resume`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${user.username}_resume.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download resume.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    if (!window.confirm('Are you sure you want to update your profile information?')) {
      setLoading(false);
      return;
    }
    try {
      const { username, email, location, bio, skills } = form;
      await api.put(`/${user.id}`, {
        username,
        email,
        location,
        bio,
        skills: skills.split(',').map(s => s.trim()).filter(s => s),
      });
     if (resume) {
       const formData = new FormData();
       formData.append('file', resume);
       await api.post(`/users/${user.id}/resume/upload`, formData, {
         headers: { 'Content-Type': 'multipart/form-data' },
       });
     }
      setSuccess('Profile updated successfully!');
      setTimeout(() => navigate('/profile/me'), 1000);
    } catch (err) {
      setError('Failed to update profile: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="p-8 max-w-2xl mx-auto bg-white shadow rounded mt-10">Loading user data...</div>;
  }

  return (
    <div className="p-8 max-w-2xl mx-auto bg-white shadow rounded mt-10">
      <h2 className="text-2xl font-bold text-[#32a86d] mb-4">Edit Your Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Username</label>
          <input
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#32a86d]"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#32a86d]"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Location</label>
          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#32a86d]"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Bio</label>
          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            rows="4"
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#32a86d]"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Skills</label>
          <input
            type="text"
            name="skills"
            value={form.skills}
            onChange={handleChange}
            placeholder="JavaScript, React, Spring Boot (comma separated)"
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#32a86d]"
          />
          <p className="text-sm text-gray-500">Separate skills with commas</p>
        </div>
        <div>
          <label className="block mb-1 font-medium">Resume PDF</label>
          <input
            type="file"
            accept=".pdf"
            onChange={handleResumeChange}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#32a86d]"
          />
          <p className="text-sm text-gray-500 mt-1">Upload your resume PDF file</p>
          {resume && (
            <p className="text-sm text-green-600 mt-1">
              Selected: {resume.name} ({(resume.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>
        {error && <div className="text-red-600">{error}</div>}
        {success && <div className="text-green-600">{success}</div>}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-[#32a86d] text-white px-6 py-2 rounded hover:bg-[#2c915d] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/profile/me')}
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProfile; 