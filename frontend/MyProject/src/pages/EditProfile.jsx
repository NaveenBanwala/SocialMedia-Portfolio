import React, { useState, useEffect } from 'react';
import api from '../Api/api.jsx';
import { useNavigate } from 'react-router-dom';

const levelOrder = ['Basic', 'Moderate', 'Professional'];
const levelColors = {
  Basic: 'bg-green-200 text-green-800',
  Moderate: 'bg-yellow-200 text-yellow-800',
  Professional: 'bg-blue-200 text-blue-800',
};

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
  const [skillsArr, setSkillsArr] = useState([]); // [{ name, level }]
  const [showSkillInput, setShowSkillInput] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [profilePic, setProfilePic] = useState(null);

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
        if (res.data.skills) {
          setSkillsArr(res.data.skills.map(s => ({ name: s.name, level: s.level || 'Basic' })));
        }
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
  const handleProfilePicChange = (e) => {
    setProfilePic(e.target.files[0]);
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

  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    setSkillsArr([...skillsArr, { name: newSkill.trim(), level: 'Basic' }]);
    setNewSkill('');
    setShowSkillInput(false);
  };
  const handleRemoveSkill = (idx) => {
    setSkillsArr(skillsArr.filter((_, i) => i !== idx));
  };
  const handleLevelChange = (idx) => {
    setSkillsArr(skillsArr.map((s, i) => i === idx ? { ...s, level: levelOrder[(levelOrder.indexOf(s.level) + 1) % levelOrder.length] } : s));
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
      await api.put(`/users/${user.id}`, {
        username,
        email,
        location,
        bio,
        skills: skillsArr.map(s => ({ name: s.name, level: s.level })),
        // Optionally: skillLevels: skillsArr.map(s => ({ name: s.name, level: s.level })),
      });
      if (profilePic) {
        const formData = new FormData();
        formData.append('file', profilePic);
        await api.post(`/users/${user.id}/upload`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
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
        {/* Profile Picture Section */}
        <div>
          <label className="block mb-1 font-medium">Change Profile Picture</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleProfilePicChange}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#32a86d]"
          />
        </div>
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
          <div
            className="flex flex-row flex-nowrap gap-6 mb-2 overflow-x-auto"
            style={{
              whiteSpace: 'nowrap',
              minHeight: 140,
              maxWidth: '100%',
              borderBottom: '2px solid #e5e7eb',
              paddingBottom: 8,
              scrollbarColor: '#a0aec0 #edf2f7',
              scrollbarWidth: 'auto',
            }}
          >
            {skillsArr.map((skill, i) => (
              <div key={i} className="flex flex-col items-center mx-2">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-gray-300">
                  {/* Placeholder SVG */}
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="20" cy="20" r="18" stroke="#32a86d" strokeWidth="3" fill="#e5e7eb" />
                    <text x="50%" y="55%" textAnchor="middle" fill="#32a86d" fontSize="16" fontWeight="bold" dy=".3em">S</text>
                  </svg>
                </div>
                <div className="mt-2 text-xs font-semibold text-center">{skill.name}</div>
                <button
                  type="button"
                  className={`mt-1 px-2 py-1 rounded-full text-xs font-bold w-28 text-center ${levelColors[skill.level]} border border-gray-300`}
                  onClick={() => handleLevelChange(i)}
                >
                  {skill.level}
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(i)}
                  className="text-gray-400 hover:text-red-400 text-xs font-bold mt-1"
                  title="Remove skill"
                >
                  x
                </button>
              </div>
            ))}
            {/* Remove the skillsArr.length < 5 limit so Add Skill is always shown */}
            <div className="flex flex-col items-center mx-2">
              <button
                type="button"
                onClick={() => setShowSkillInput(true)}
                className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center border-2 border-blue-300 text-3xl text-blue-500 hover:bg-blue-200"
              >
                +
              </button>
              <div className="mt-2 text-xs font-semibold text-center text-blue-500">Add Skill</div>
            </div>
          </div>
          {showSkillInput && (
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newSkill}
                onChange={e => setNewSkill(e.target.value)}
                placeholder="Enter skill name"
                className="flex-1 text-sm px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#32a86d]"
                onKeyPress={e => e.key === 'Enter' && handleAddSkill()}
              />
              <button
                type="button"
                onClick={handleAddSkill}
                disabled={!newSkill.trim()}
                className="text-sm bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => { setShowSkillInput(false); setNewSkill(''); }}
                className="text-sm bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          )}
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