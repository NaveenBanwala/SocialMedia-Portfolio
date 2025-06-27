import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../Api/api.jsx';

const Profile = () => {
  const { id } = useParams(); // 'me' or user id
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    username: '',
    bio: '',
    location: '',
    profilePicUrl: '',
    resumeUrl: '',
    skills: '',
    projectTitle: '',
    projectDescription: '',
    projectImageUrl: '',
  });
  const [error, setError] = useState('');

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        let res;
        if (id === 'me') {
          res = await api.get('/users/me');
          // If id is not a number, fetch by email or username to get the real user object
          let realUser = null;
          let searchResult = null;
          if (!res.data.id || isNaN(Number(res.data.id))) {
            if (res.data.email) {
              const res2 = await api.get(`/search?name=${encodeURIComponent(res.data.email)}`);
              console.log('Search by email result:', res2.data);
              searchResult = res2.data;
              realUser = Array.isArray(res2.data)
                ? res2.data.find(u => u.email === res.data.email)
                : null;
            }
            if (!realUser && res.data.username) {
              const res3 = await api.get(`/search?name=${encodeURIComponent(res.data.username)}`);
              console.log('Search by username result:', res3.data);
              searchResult = res3.data;
              realUser = Array.isArray(res3.data)
                ? res3.data.find(u => u.username === res.data.username)
                : null;
            }
            if (!realUser && Array.isArray(searchResult) && searchResult.length > 0) {
              realUser = searchResult[0];
            }
            if (realUser && realUser.id && !isNaN(Number(realUser.id))) {
              res.data.id = realUser.id;
              console.log('Resolved real user id:', realUser.id);
            } else {
              throw new Error('Could not resolve numeric user id from backend');
            }
          }
        } else {
          res = await api.get(`/users/${id}`);
        }
        setUser(res.data);
        setIsOwnProfile(id === 'me');
        setShowForm(false); // Always start in view mode
        if (id === 'me') {
          setForm({
            username: res.data.username || '',
            bio: res.data.bio || '',
            location: res.data.location || '',
            profilePicUrl: res.data.profilePicUrl || '',
            resumeUrl: res.data.resumeUrl || '',
            skills: res.data.skills ? res.data.skills.join(', ') : '',
            projectTitle: res.data.projects && res.data.projects[0] ? res.data.projects[0].title : '',
            projectDescription: res.data.projects && res.data.projects[0] ? res.data.projects[0].description : '',
            projectImageUrl: res.data.projects && res.data.projects[0] ? res.data.projects[0].imageUrl : '',
          });
        }
        setError('');
        console.log('Loaded user:', res.data);
      } catch (err) {
        let msg = err.response?.data;
        if (msg && typeof msg === 'object') {
          msg = msg.message || JSON.stringify(msg);
        }
        setError('Failed to load profile: ' + (msg || err.message));
      }
    };
    fetchProfile();
  }, [id, navigate]);

  // Handle form input change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('user before submit:', user);
    if (!user || !user.id) {
      console.log('No user or user.id:', user);
      return;
    }
    try {
      // Prepare payload for UserProfileDTO
      const payload = {
        username: form.username,
        bio: form.bio,
        location: form.location,
        profilePicUrl: form.profilePicUrl,
        resumeUrl: form.resumeUrl,
        skills: form.skills.split(',').map(s => s.trim()),
        projects: [
          {
            title: form.projectTitle,
            description: form.projectDescription,
            imageUrl: form.projectImageUrl,
          },
        ],
      };
      console.log('About to PUT to:', `/${user.id}`, 'with payload:', payload);
      await api.put(`/${user.id}`, payload); // Always use numeric id
      setShowForm(false);
      // Refetch profile
      console.log('GET /users/' + user.id);
      const res = await api.get(`/users/${user.id}`);
      setUser(res.data);
      setForm({
        username: res.data.username || '',
        bio: res.data.bio || '',
        location: res.data.location || '',
        profilePicUrl: res.data.profilePicUrl || '',
        resumeUrl: res.data.resumeUrl || '',
        skills: res.data.skills ? res.data.skills.join(', ') : '',
        projectTitle: res.data.projects && res.data.projects[0] ? res.data.projects[0].title : '',
        projectDescription: res.data.projects && res.data.projects[0] ? res.data.projects[0].description : '',
        projectImageUrl: res.data.projects && res.data.projects[0] ? res.data.projects[0].imageUrl : '',
      });
    } catch (err) {
      alert('Failed to update profile.');
    }
  };

  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!user) return <div className="p-6">Loading...</div>;

  // Show profile edit form for own profile only when editing
  if (showForm && isOwnProfile && user && user.id) {
    return (
      <div className="p-8 min-h-screen bg-gray-100 flex justify-center items-center">
        <form onSubmit={handleSubmit} className="bg-white shadow rounded p-8 max-w-2xl w-full space-y-6 border-2 border-[#32a86d]">
          <h2 className="text-2xl font-bold text-[#32a86d] mb-4">Edit Your Profile</h2>
          <div className="flex flex-col gap-6">
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
              className="w-full border-2 border-[#32a86d] bg-white rounded px-4 py-2"
              required
            />
            <input
              type="text"
              name="location"
              placeholder="Location"
              value={form.location}
              onChange={handleChange}
              className="w-full border-2 border-[#32a86d] bg-white rounded px-4 py-2"
              required
            />
            <input
              type="text"
              name="skills"
              placeholder="Skills (comma separated)"
              value={form.skills}
              onChange={handleChange}
              className="w-full border-2 border-[#32a86d] bg-white rounded px-4 py-2"
              required
            />
            <input
              type="text"
              name="profilePicUrl"
              placeholder="Profile Picture URL (optional)"
              value={form.profilePicUrl}
              onChange={handleChange}
              className="w-full border-2 border-[#32a86d] bg-white rounded px-4 py-2"
            />
            <input
              type="text"
              name="resumeUrl"
              placeholder="Resume URL (optional)"
              value={form.resumeUrl}
              onChange={handleChange}
              className="w-full border-2 border-[#32a86d] bg-white rounded px-4 py-2"
            />
            <textarea
              name="bio"
              placeholder="Bio"
              value={form.bio}
              onChange={handleChange}
              className="w-full border-2 border-[#32a86d] bg-white rounded px-4 py-2"
              rows={3}
            />
            <h3 className="text-lg font-semibold text-[#32a86d] mt-4">Add Project</h3>
            <input
              type="text"
              name="projectTitle"
              placeholder="Project Title"
              value={form.projectTitle}
              onChange={handleChange}
              className="w-full border-2 border-[#32a86d] bg-white rounded px-4 py-2"
            />
            <input
              type="text"
              name="projectDescription"
              placeholder="Project Description"
              value={form.projectDescription}
              onChange={handleChange}
              className="w-full border-2 border-[#32a86d] bg-white rounded px-4 py-2"
            />
            <input
              type="text"
              name="projectImageUrl"
              placeholder="Project Image URL (optional)"
              value={form.projectImageUrl}
              onChange={handleChange}
              className="w-full border-2 border-[#32a86d] bg-white rounded px-4 py-2"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#32a86d] text-white py-2 rounded font-semibold hover:bg-[#2c915d] transition border-2 border-[#32a86d] mt-4"
          >
            Save Profile
          </button>
        </form>
      </div>
    );
  }

  // Show profile as usual
  return (
    <div className="p-8 min-h-screen bg-gray-100">
      <div className="bg-white shadow rounded p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-6 mb-6 relative">
          <img
            src={user.profilePicUrl || '/default-profile.png'}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover border-2 border-[#32a86d]"
          />
          <div>
            <h1 className="text-2xl font-bold text-[#32a86d]">{user.username}</h1>
            <p className="text-sm text-gray-600">{user.email}</p>
            <p className="text-sm text-gray-600">{user.location}</p>
            {user.resumeUrl && (
              <a
                href={user.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                View Resume
              </a>
            )}
          </div>
          {isOwnProfile && (
            <button
              onClick={() => setShowForm(true)}
              className="absolute top-0 right-0 bg-[#32a86d] text-white px-4 py-2 rounded hover:bg-[#2c915d]"
            >
              Edit Profile
            </button>
          )}
        </div>

        {/* Bio */}
        <p className="mb-4 text-gray-800">{user.bio}</p>

        {/* Skills */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2 text-[#32a86d]">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {user.skills.map((skill, i) => (
              <span key={i} className="bg-[#32a86d] text-white px-3 py-1 rounded text-sm">
                {skill.skillName || skill}
              </span>
            ))}
          </div>
        </div>

        {/* Projects */}
        <div>
          <h2 className="text-lg font-semibold mb-2 text-[#32a86d]">Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {user.projects.map((project) => (
              <div key={project.id || project.title} className="bg-gray-50 p-4 rounded shadow">
                <img
                  src={project.imageUrl}
                  alt={project.title}
                  className="w-full h-40 object-cover rounded mb-2"
                />
                <h3 className="text-lg font-bold text-[#32a86d]">{project.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{project.description}</p>
                <button
                  onClick={() => navigate(`/project/${project.id}`)}
                  className="text-sm bg-[#32a86d] text-white px-3 py-1 rounded hover:bg-[#2c915d]"
                >
                  View Project
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
