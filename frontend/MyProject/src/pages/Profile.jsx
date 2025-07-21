import React, { useEffect, useState, useRef, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../Api/api.jsx';
import { useAuth } from '../Api/AuthContext.jsx';
import PostCard from '../components/PostCard';
import { useState as useReactState } from 'react';
import { ChatModalContext } from '../contexts/ChatModalContext.jsx';

const Profile = () => {
  const { id } = useParams(); // 'me' or user id
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [showSkillInput, setShowSkillInput] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [userPosts, setUserPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const fileInputRef = useRef(null);
  const resumeInputRef = useRef(null);
  const { user: currentUser } = useAuth();
  const [projectLikes, setProjectLikes] = useState({}); // { [projectId]: { liked: bool, count: number } }
  const [friendStatus, setFriendStatus] = useState(null);
  const [friendLoading, setFriendLoading] = useState(false);
  const [skillLevels, setSkillLevels] = useReactState(() => {
    if (user && user.skills) {
      // Default all to 'Easy'
      return Object.fromEntries(user.skills.map(skill => [getSkillName(skill), 'Basic']));
    }
    return {};
  });
  const levelOrder = ['Basic', 'Moderate', 'Professional'];
  const levelColors = {
    Basic: 'bg-green-200 text-green-800',
    Moderate: 'bg-yellow-200 text-yellow-800',
    Professional: 'bg-blue-200 text-blue-800',
  };
  const handleLevelChange = (skillName) => {
    setSkillLevels(prev => {
      const current = prev[skillName] || 'Basic';
      const idx = levelOrder.indexOf(current);
      const next = levelOrder[(idx + 1) % levelOrder.length];
      return { ...prev, [skillName]: next };
    });
  };
  const [imgError, setImgError] = useState(false); // Track image load error

  // Default profile image component
  const DefaultProfileImage = ({ username, size = "w-24 h-24" }) => (
    <div className={`${size} rounded-full bg-[#32a86d] flex items-center justify-center text-white font-bold text-2xl border-2 border-[#32a86d]`}>
      {username ? username.charAt(0).toUpperCase() : 'N'}
    </div>
  );

  // Helper function to construct full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null; // Return null to show default image
    if (imagePath.startsWith('http')) return imagePath;
    // Use the new image serving endpoint
    if (imagePath.startsWith('/images/')) {
      return `http://localhost:8080/api/files${imagePath.substring(7)}`;
    }
    return `http://localhost:8080${imagePath}`;
  };

  // Upload profile photo function
  const uploadProfilePhoto = async (file) => {
    if (!file) return;
    
    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      await api.post(`/users/${user.id}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      // Refresh the profile to show updated picture
      window.location.reload();
    } catch (error) {
      console.error('Error uploading profile photo:', error);
      alert('Failed to upload profile photo: ' + (error.response?.data || error.message));
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Upload resume function
  const uploadResume = async (file) => {
    if (!file) return;
    
    setUploadingResume(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Use the correct endpoint for resume upload
      await api.post(`/users/${user.id}/resume/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      // Refresh the profile to show updated resume
      window.location.reload();
    } catch (error) {
      console.error('Error uploading resume:', error);
      alert('Failed to upload resume: ' + (error.response?.data || error.message));
    } finally {
      setUploadingResume(false);
    }
  };

  // Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      uploadProfilePhoto(file);
    }
  };

  // Handle resume file selection
  const handleResumeSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      uploadResume(file);
    }
  };

  // Trigger file input
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Trigger resume input
  const triggerResumeInput = () => {
    resumeInputRef.current?.click();
  };

  // Add skill function
  const addSkill = async () => {
    if (!newSkill.trim()) return;
    try {
      await api.put(`/${user.id}`, {
        id: user.id,
        username: user.username,
        bio: user.bio,
        location: user.location,
        profilePicUrl: user.profilePicUrl,
        resumeUrl: user.resumeUrl,
        skills: [...(user.skills || []), newSkill.trim()],
        projects: user.projects || [],
        roles: user.roles || [],
      });
      setNewSkill('');
      setShowSkillInput(false);
      window.location.reload();
    } catch (error) {
      console.error('Error adding skill:', error);
      alert('Failed to add skill: ' + (error.response?.data || error.message));
    }
  };

  // Remove skill function
  const removeSkill = async (skillToRemove) => {
    if (!window.confirm(`Are you sure you want to remove the skill "${skillToRemove}"?`)) {
      return;
    }
    try {
      const updatedSkills = user.skills.filter(skill => {
        const skillName = typeof skill === 'string' ? skill : 
                        (skill.skillName || skill.name || String(skill));
        return skillName !== skillToRemove;
      });
      await api.put(`/${user.id}`, {
        id: user.id,
        username: user.username,
        bio: user.bio,
        location: user.location,
        profilePicUrl: user.profilePicUrl,
        resumeUrl: user.resumeUrl,
        skills: updatedSkills,
        projects: user.projects || [],
        roles: user.roles || [],
      });
      window.location.reload();
    } catch (error) {
      console.error('Error removing skill:', error);
      alert('Failed to remove skill: ' + (error.response?.data || error.message));
    }
  };

  // Delete project function
  const deleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return;
    }

    setLoading(true);
    try {
      await api.delete(`/projects/${projectId}`);
      // Refresh the profile to show updated projects
      window.location.reload();
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project: ' + (error.response?.data || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Remove profile picture function
  const removeProfilePicture = async () => {
    if (!window.confirm('Are you sure you want to remove your profile picture?')) {
      return;
    }

    setLoading(true);
    try {
      await api.delete(`/users/${user.id}/profile-picture`);
      // Refresh the profile to show updated picture
      window.location.reload();
    } catch (error) {
      console.error('Error removing profile picture:', error);
      alert('Failed to remove profile picture: ' + (error.response?.data || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Remove resume function
  const removeResume = async () => {
    if (!window.confirm('Are you sure you want to remove your resume?')) {
      return;
    }

    try {
      await api.delete(`/users/${user.id}/resume`);
      window.location.reload();
    } catch (error) {
      console.error('Error removing resume:', error);
      alert('Failed to remove resume: ' + (error.response?.data || error.message));
    }
  };

  // Download resume function
  const downloadResume = async () => {
    if (!user.id) {
      alert('User ID not available');
      return;
    }

    try {
      const response = await api.get(`/users/${user.id}/resume`, {
        responseType: 'blob'
      });
      
      // Create a blob URL and trigger download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${user.username}_resume.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading resume:', error);
      alert('Failed to download resume: ' + (error.response?.data || error.message));
    }
  };

  // Fetch user posts
  const fetchUserPosts = async (userId) => {
    setLoadingPosts(true);
    try {
      let response;
      if (id === 'me' || (currentUser && userId === currentUser.id)) {
        response = await api.get('/posts/me');
      } else {
        response = await api.get(`/posts/user/${userId}`);
      }
      setUserPosts(response.data);
    } catch (error) {
      setUserPosts([]);
    } finally {
      setLoadingPosts(false);
    }
  };

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
                ? res2.data.find(u => u.username === res.data.username)
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
        
        // If this is the user's own profile, also fetch their projects separately
        if (id === 'me' && res.data.id) {
          try {
            const projectsRes = await api.get(`/projects/user/${res.data.id}`);
            res.data.projects = projectsRes.data;
            console.log('Fetched projects:', projectsRes.data);
          } catch (projectError) {
            console.warn('Could not fetch projects:', projectError);
            res.data.projects = [];
          }
        }
        
        // If we came from EditProfile and have updated user info, use it
        setUser(res.data);
        // Fix: Always set isOwnProfile correctly
        if (id === 'me' || (currentUser && res.data && res.data.id === currentUser.id)) {
          setIsOwnProfile(true);
        } else {
          setIsOwnProfile(false);
        }
        setError('');
        console.log('Loaded user data:', res.data);
        console.log('User skills:', res.data.skills);
        console.log('User projects:', res.data.projects);
        
        // Fetch user posts
        if (res.data.id) {
          fetchUserPosts(res.data.id);
        }
      } catch (err) {
        let msg = err.response?.data;
        if (msg && typeof msg === 'object') {
          msg = msg.message || JSON.stringify(msg);
        }
        setError('Failed to load profile: ' + (msg || err.message));
      }
    };
    fetchProfile();
  }, [id, navigate, currentUser]);

  useEffect(() => {
    if (user && user.projects && Array.isArray(user.projects)) {
      user.projects.forEach(async (project) => {
        try {
          const countRes = await api.get(`/projects/${project.id}/likes`);
          let liked = false;
          if (currentUser) {
            const statusRes = await api.get(`/projects/${project.id}/like-status`, { headers: { Authorization: localStorage.getItem('token') } });
            liked = statusRes.data.liked;
          }
          setProjectLikes(prev => ({ ...prev, [project.id]: { liked, count: countRes.data.likeCount } }));
        } catch (err) {
          setProjectLikes(prev => ({ ...prev, [project.id]: { liked: false, count: 0 } }));
        }
      });
    }
  }, [user && user.projects, currentUser]);

  useEffect(() => {
    // Fetch friend status in both directions
    const fetchFriendStatus = async () => {
      if (!user?.id || !currentUser || user.id === currentUser.id) return;
      try {
        // 1. Current user -> profile user
        const res1 = await api.get(`/users/${user.id}/friend-request/status`);
        // 2. Profile user -> current user
        const res2 = await api.get(`/users/${currentUser.id}/friend-request/status`, { params: { otherUserId: user.id } });
        const status1 = res1.data ? res1.data.status : null;
        const status2 = res2.data ? res2.data.status : null;
        if (status1 === 'ACCEPTED' || status2 === 'ACCEPTED') {
          setFriendStatus('ACCEPTED');
        } else if (status1 === 'PENDING' || status2 === 'PENDING') {
          setFriendStatus('PENDING');
        } else {
          setFriendStatus(null);
        }
      } catch (err) {
        setFriendStatus(null);
      }
    };
    fetchFriendStatus();
  }, [user?.id, currentUser]);

  const handleFriend = async () => {
    if (!currentUser || user.id === currentUser.id) return;
    setFriendLoading(true);
    try {
      if (friendStatus === 'ACCEPTED') {
        if (window.confirm('Are you sure you want to unfriend this user?')) {
          await api.post(`/users/${user.id}/unfriend`, { userId: currentUser.id });
          setFriendStatus(null);
        }
      } else if (!friendStatus) {
        await api.post(`/users/${user.id}/friend-request`);
        setFriendStatus('PENDING');
      }
    } catch (err) {}
    setFriendLoading(false);
  };

  const handleCancelRequest = async () => {
    try {
      await api.delete(`/users/${user.id}/cancel-friend-request`);
      setFriendStatus(null);
    } catch (err) {
      alert('Failed to cancel request');
    }
  };

  const handleProjectLike = async (projectId) => {
    if (!currentUser) return;
    const projectLike = projectLikes[projectId] || { liked: false, count: 0 };
    try {
      if (!projectLike.liked) {
        await api.post(`/projects/${projectId}/like`, {}, { headers: { Authorization: localStorage.getItem('token') } });
        setProjectLikes(prev => ({ ...prev, [projectId]: { liked: true, count: projectLike.count + 1 } }));
      } else {
        await api.post(`/projects/${projectId}/unlike`, {}, { headers: { Authorization: localStorage.getItem('token') } });
        setProjectLikes(prev => ({ ...prev, [projectId]: { liked: false, count: projectLike.count - 1 } }));
      }
    } catch (err) {}
  };

  // Helper function to safely get skill name
  const getSkillName = (skill) => {
    if (typeof skill === 'string') return skill;
    if (skill && typeof skill === 'object' && skill.skillName) return skill.skillName;
    if (skill && typeof skill === 'object' && skill.name) return skill.name;
    return String(skill);
  };

  // Render friend button based on status
  const renderFriendButton = () => {
    if (!currentUser || !user || user.id === currentUser.id) return null;
    if (friendStatus === 'ACCEPTED') {
      return (
        <button
          onClick={handleFriend}
          disabled={friendLoading}
          className="px-4 py-2 rounded-full text-sm font-medium border-2 border-green-500 text-green-700 bg-white hover:border-green-600 transition"
        >
          Friends
        </button>
      );
    } else if (friendStatus === 'PENDING') {
      return (
        <button
          onClick={handleCancelRequest}
          disabled={friendLoading}
          className="px-4 py-2 rounded-full text-sm font-medium border-2 border-yellow-500 text-yellow-500 bg-white hover:border-yellow-600 transition"
        >
          Cancel Request
        </button>
      );
    } else {
      return (
        <button
          onClick={handleFriend}
          disabled={friendLoading}
          className="px-4 py-2 rounded-full text-sm font-medium border-2 border-[#32a86d] text-[#32a86d] bg-white hover:border-[#2c915d] transition"
        >
          Add Friend
        </button>
      );
    }
  };

  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!user) return <div className="p-6">Loading...</div>;

  const { setShowChat, setSelectedUser } = useContext(ChatModalContext);

  // Show profile as usual
  return (
    <div className="p-8 min-h-screen">
      <div className="bg-white shadow-[0_8px_48px_0_rgba(50,168,109,0.45)] rounded p-6 max-w-4xl mx-auto">
        {/* Header with Profile Photo Management */}
        <div className="flex items-center gap-6 mb-6 relative">
          <div className="relative">
            {user.profilePicUrl && getImageUrl(user.profilePicUrl) && !imgError ? (
              <img
                src={getImageUrl(user.profilePicUrl)}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-2 border-[#32a86d]"
                onError={() => setImgError(true)}
              />
            ) : (
              <DefaultProfileImage username={user.username} />
            )}
            {/* Removed edit/remove icon overlay buttons here */}
          </div>
          
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-[#32a86d]">{user.username}</h1>
            <p className="text-sm text-gray-600">{user.displayName && user.displayName !== user.username ? user.displayName : ''}</p>
            <p className="text-sm text-gray-600">{user.location}</p>
            {/* Followers/Following counts */}
            <div className="flex gap-4 mt-2">
              <span className="text-sm text-gray-700 font-semibold cursor-pointer">
                Followers: {user.followersCount ?? 0}
              </span>
              <span className="text-sm text-gray-700 font-semibold cursor-pointer">
                Following: {user.followingCount ?? 0}
              </span>
            </div>
          </div>
          
          <div className="absolute top-0 right-0 flex flex-row gap-2 items-center">
            {isOwnProfile && (
              <>
                <button
                  onClick={() => navigate('/edit-profile')}
                  className="bg-[#32a86d] text-white px-4 py-2 rounded hover:bg-[#2c915d] font-bold shadow-lg border-2 border-white"
                >
                  Edit Profile
                </button>
                <button
                  onClick={() => navigate('/add-project')}
                  className="bg-[#32a86d] text-white px-4 py-2 rounded hover:bg-[#2c915d] font-bold shadow-lg border-2 border-white"
                >
                  Add Project
                </button>
              </>
            )}
            {!isOwnProfile && user && (
              <>
                {currentUser && user.id !== currentUser.id && renderFriendButton()}
                <button
                  onClick={() => {
                    if (friendStatus === 'ACCEPTED') {
                      setSelectedUser(user);
                      setShowChat(true);
                    } else {
                      alert('You must be friends to chat.');
                    }
                  }}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 font-bold shadow-lg border-2 border-white ml-2"
                >
                  Message
                </button>
              </>
            )}
          </div>
        </div>

        {/* Personal Information Section */}
        <div className="mb-6 p-4 bg-gray-50 rounded">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold text-[#32a86d]">📋 Personal Information</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Username</p>
              <p className="font-medium">{user.username}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Location</p>
              <p className="font-medium">{user.location}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-600">Bio</p>
              <p className="font-medium">{user.bio}</p>
            </div>
          </div>
        </div>

        {/* Resume Section */}
        <div className="mb-6 p-4 bg-gray-50 rounded">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold text-[#32a86d]">📄 Resume</h2>
            {/* Resume action buttons row */}
            <div className="flex gap-2 justify-end items-center">
              {user.resumeUrl && (
                <button
                  className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
                  style={{ color: 'white' }}
                  onClick={async () => {
                    try {
                      const filename = user.resumeUrl.split('/files/resumes/')[1];
                      const response = await api.get(`/files/resumes/${filename}`, { responseType: 'blob' });
                      const blob = new Blob([response.data], { type: 'application/pdf' });
                      const url = window.URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `${user.username}_uploaded_resume.pdf`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      window.URL.revokeObjectURL(url);
                    } catch (err) {
                      alert('Failed to download uploaded resume.');
                    }
                  }}
                >
                  Download
                </button>
              )}
              <button
                className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
                style={{ color: 'white' }}
                onClick={async () => {
                  try {
                    const response = await api.get(`/users/${user.id}/resume/generated`, { responseType: 'blob' });
                    const blob = new Blob([response.data], { type: 'application/pdf' });
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `${user.username}_profile_resume.pdf`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(url);
                  } catch (err) {
                    alert('Failed to download generated resume.');
                  }
                }}
              >
                Generate
              </button>
              {isOwnProfile && (
                <>
                  <button
                    className="bg-gray-500 text-white px-2 py-1 rounded text-xs hover:bg-gray-600"
                    style={{ color: 'white' }}
                    onClick={triggerResumeInput}
                  >
                    Upload
                  </button>
                  {user.resumeUrl && (
                    <button
                      className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                      style={{ color: 'white' }}
                      onClick={removeResume}
                    >
                      Remove
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {user.resumeUrl ? (
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-600 mb-0">Resume uploaded ✓</p>
              </div>
            ) : (
              <p className="text-sm text-gray-500 mb-0">No resume uploaded yet.</p>
            )}
            {/* Hidden resume input */}
            <input
              ref={resumeInputRef}
              type="file"
              accept=".pdf"
              onChange={handleResumeSelect}
              className="hidden"
            />
          </div>
        </div>

        {/* Skills Section */}
        <div className="mb-6 p-4 bg-gray-50 rounded">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold text-[#32a86d]">🛠️ Skills</h2>
          </div>
          <div className="bg-white p-4 rounded border">
            <div
              className="flex flex-row flex-nowrap gap-6 justify-start overflow-x-auto"
              style={{ whiteSpace: 'nowrap', minHeight: 140, maxWidth: '100%', borderBottom: '2px solid #e5e7eb', paddingBottom: 8, scrollbarColor: '#a0aec0 #edf2f7', scrollbarWidth: 'auto' }}
            >
              {user.skills && Array.isArray(user.skills) && user.skills.length > 0 ? (
                user.skills.map((skill, i) => {
                  const skillName = skill.name || getSkillName(skill);
                  const level = skill.level || 'Basic';
                  return (
                    <div key={i} className="flex flex-col items-center mx-2">
                      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-gray-300">
                        {/* Placeholder SVG */}
                        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="20" cy="20" r="18" stroke="#32a86d" strokeWidth="3" fill="#e5e7eb" />
                          <text x="50%" y="55%" textAnchor="middle" fill="#32a86d" fontSize="16" fontWeight="bold" dy=".3em">S</text>
                        </svg>
                      </div>
                      <div className="mt-2 text-xs font-semibold text-center">{skillName}</div>
                      <span
                        className={`mt-1 px-2 py-1 rounded-full text-xs font-bold w-28 text-center ${levelColors[level]} border border-gray-300`}
                        title={level}
                      >
                        {level}
                      </span>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500">No skills listed yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Projects Section */}
        <div className="p-4 shadow-[0_8px_48px_0_rgba(50,168,109,0.30)]">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold text-[#32a86d]">💼 Projects</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {user && user.projects && Array.isArray(user.projects) && user.projects.length > 0 ? (
              user.projects.map((project) => (
                <div key={project.id || project.title} className="shadow relative">
                  {isOwnProfile && (
                    <button
                      onClick={() => deleteProject(project.id)}
                      disabled={loading}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 disabled:opacity-50"
                      title="Delete project"
                    >
                      ×
                    </button>
                  )}
                  <img
                    src={getImageUrl(project.imageUrl)}
                  alt={project.title}
                  className="w-full h-40 object-cover rounded mb-2"
                    onError={(e) => {
                      e.target.src = '/default-project.png';
                    }}
                />
                <h3 className="text-lg font-bold text-[#32a86d]">{project.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{project.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-pink-600 font-semibold">
                    ❤️ {projectLikes[project.id]?.count || 0}
                  </span>
                </div>
                <button
                  onClick={() => navigate(`/project/${project.id}`)}
                  className="text-sm bg-[#32a86d] text-white px-3 py-1 rounded hover:bg-[#2c915d]"
                >
                  View Project
                </button>
              </div>
              ))
            ) : (
              <div className="col-span-2 text-center py-8 text-gray-500">
                {isOwnProfile ? (
                  <div>
                    <p>No projects yet. Start showcasing your work!</p>
                    <button
                      onClick={() => navigate('/add-project')}
                      className="mt-2 bg-[#32a86d] text-white px-4 py-2 rounded hover:bg-[#2c915d]"
                    >
                      Add Your First Project
                    </button>
                  </div>
                ) : (
                  <p>No projects available.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Posts Section */}
        <div className="mb-6 p-4 shadow-[0_8px_48px_0_rgba(50,168,109,0.30)]">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold text-[#32a86d]">📝 Posts</h2>
            <div className="flex gap-2">
              {isOwnProfile && (
                <>
                  <button
                    onClick={() => user.id && fetchUserPosts(user.id)}
                    disabled={loadingPosts}
                    className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 disabled:opacity-50"
                    title="Refresh posts"
                  >
                    {loadingPosts ? '⏳' : '🔄'}
                  </button>
                </>
              )}
            </div>
          </div>
          
          {loadingPosts ? (
            <div className="text-center py-4">
              <p className="text-gray-500">Loading posts...</p>
            </div>
          ) : userPosts && userPosts.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {userPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {isOwnProfile ? (
                <div>
                  <p>No posts yet. Start sharing your thoughts!</p>
                </div>
              ) : (
                <p>No posts available.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
