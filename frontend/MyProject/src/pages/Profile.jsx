import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../Api/api.jsx';
import { useAuth } from '../Api/AuthContext.jsx';

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
        ...user,
        skills: [...(user.skills || []), newSkill.trim()]
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
        ...user,
        skills: updatedSkills
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
      console.log('Fetching posts for user ID:', userId);
      // Use /posts/me endpoint instead of /posts/user/{userId} to avoid the 500 error
      const response = await api.get('/posts/me');
      console.log('Posts API response:', response);
      setUserPosts(response.data);
      console.log('User posts fetched successfully:', response.data);
      console.log('Fetched user posts:', response.data);
    } catch (error) {
      console.error('Error fetching user posts:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
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
        
        setUser(res.data);
        setIsOwnProfile(id === 'me');
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
  }, [id, navigate]);

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
    // Fetch friend status
    const fetchFriendStatus = async () => {
      if (!user?.id || !currentUser || user.id === currentUser.id) return;
      try {
        const res = await api.get(`/users/${user.id}/friend-request/status`);
        setFriendStatus(res.data ? res.data.status : null);
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

  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!user) return <div className="p-6">Loading...</div>;

  // Helper function to safely get skill name
  const getSkillName = (skill) => {
    if (typeof skill === 'string') return skill;
    if (skill && typeof skill === 'object' && skill.skillName) return skill.skillName;
    if (skill && typeof skill === 'object' && skill.name) return skill.name;
    return String(skill);
  };

  // Show profile as usual
  return (
    <div className="p-8 min-h-screen bg-gray-100">
      <div className="bg-white shadow rounded p-6 max-w-4xl mx-auto">
        {/* Header with Profile Photo Management */}
        <div className="flex items-center gap-6 mb-6 relative">
          <div className="relative">
            {user.profilePicUrl && getImageUrl(user.profilePicUrl) ? (
          <img
                src={getImageUrl(user.profilePicUrl)}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover border-2 border-[#32a86d]"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : (
              <DefaultProfileImage username={user.username} />
            )}
            
            {isOwnProfile && (
              <div className="absolute -bottom-2 -right-2 flex gap-1">
                <button
                  onClick={triggerFileInput}
                  disabled={uploadingPhoto}
                  className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-blue-600 disabled:opacity-50"
                  title="Upload new photo"
                >
                  {uploadingPhoto ? '⏳' : '+'}
                </button>
                {user.profilePicUrl && (
                  <button
                    onClick={removeProfilePicture}
                    disabled={loading}
                    className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 disabled:opacity-50"
                    title="Remove profile picture"
                  >
                    ×
                  </button>
                )}
              </div>
            )}
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
          
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-[#32a86d]">{user.username}</h1>
            <p className="text-sm text-gray-600">{user.email}</p>
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
          
          {isOwnProfile && (
            <div className="absolute top-0 right-0 flex gap-2">
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Refresh
              </button>
            <button
                onClick={() => navigate('/edit-profile')}
                className="bg-[#32a86d] text-white px-4 py-2 rounded hover:bg-[#2c915d]"
            >
              Edit Profile
            </button>
              <button
                onClick={() => navigate('/add-project')}
                className="bg-[#32a86d] text-white px-4 py-2 rounded hover:bg-[#2c915d]"
              >
                Add Project
              </button>
            </div>
          )}
          {currentUser && user && user.id !== currentUser.id && (
            <button
              onClick={handleFriend}
              disabled={friendLoading}
              className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition ${friendStatus === 'ACCEPTED' ? 'bg-green-200 text-green-700 border-green-300' : friendStatus === 'PENDING' ? 'bg-gray-200 text-gray-600 border-gray-300' : 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600'}`}
            >
              {friendStatus === 'ACCEPTED' ? 'Friends' : friendStatus === 'PENDING' ? 'Pending' : 'Add Friend'}
            </button>
          )}
        </div>

        {/* Personal Information Section */}
        <div className="mb-6 p-4 bg-gray-50 rounded">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold text-[#32a86d]">📋 Personal Information</h2>
            {isOwnProfile && (
              <button
                onClick={() => navigate('/edit-profile')}
                className="text-sm bg-[#32a86d] text-white px-3 py-1 rounded hover:bg-[#2c915d]"
              >
                Edit
              </button>
            )}
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
            {user.location && (
              <div>
                <p className="text-sm text-gray-600">Location</p>
                <p className="font-medium">{user.location}</p>
              </div>
            )}
            {user.bio && (
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600">Bio</p>
                <p className="font-medium">{user.bio}</p>
              </div>
            )}
          </div>
        </div>

        {/* Resume Section */}
        <div className="mb-6 p-4 bg-gray-50 rounded">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold text-[#32a86d]">📄 Resume</h2>
            {isOwnProfile && (
              <div className="flex gap-2">
                <button
                  onClick={triggerResumeInput}
                  disabled={uploadingResume}
                  className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {uploadingResume ? 'Uploading...' : 'Upload Resume'}
                </button>
                {user.resumeUrl && (
                  <>
                    <button
                      onClick={downloadResume}
                      className="text-sm bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                    >
                      Download
                    </button>
                    <button
                      onClick={removeResume}
                      className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
          {user.resumeUrl ? (
            <p className="text-sm text-gray-600">Resume uploaded ✓</p>
          ) : (
            <p className="text-sm text-gray-500">No resume uploaded yet.</p>
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

        {/* Skills Section */}
        <div className="mb-6 p-4 bg-gray-50 rounded">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold text-[#32a86d]">🛠️ Skills</h2>
            {isOwnProfile && (
              <button
                onClick={() => setShowSkillInput(true)}
                className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
              >
                Add Skill
              </button>
            )}
          </div>
          
          {/* Skills Management Box */}
          <div className="bg-white p-4 rounded border">
            {showSkillInput && isOwnProfile && (
              <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
                <h3 className="text-sm font-medium text-blue-800 mb-2">Add New Skill</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Enter skill name (e.g., JavaScript, React, Python)"
                    className="flex-1 text-sm px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#32a86d]"
                    onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                  />
                  <button
                    onClick={addSkill}
                    disabled={!newSkill.trim()}
                    className="text-sm bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => {
                      setShowSkillInput(false);
                      setNewSkill('');
                    }}
                    className="text-sm bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            
          <div className="flex flex-wrap gap-2">
              {user.skills && Array.isArray(user.skills) && user.skills.length > 0 ? (
                user.skills.map((skill, i) => {
                  const skillName = getSkillName(skill);
                  return (
                    <span key={i} className="bg-[#32a86d] text-white px-3 py-1 rounded text-sm flex items-center gap-1">
                      {skillName}
                      {isOwnProfile && (
                        <button
                          onClick={() => removeSkill(skillName)}
                          className="text-white hover:text-red-200 text-xs font-bold"
                          title="Remove skill"
                        >
                          ×
                        </button>
                      )}
              </span>
                  );
                })
              ) : (
                <p className="text-gray-500">No skills listed yet.</p>
              )}
            </div>
            
            {isOwnProfile && user.skills && user.skills.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-600">
                  💡 Click the × button on any skill to remove it
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Projects Section */}
        <div className="p-4 bg-gray-50 rounded">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold text-[#32a86d]">💼 Projects</h2>
            {isOwnProfile && (
              <button
                onClick={() => navigate('/add-project')}
                className="bg-[#32a86d] text-white px-4 py-2 rounded hover:bg-[#2c915d] text-sm"
              >
                Add Project
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {user && user.projects && Array.isArray(user.projects) && user.projects.length > 0 ? (
              user.projects.map((project) => (
                <div key={project.id || project.title} className="bg-white p-4 rounded shadow relative">
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
        <div className="mb-6 p-4 bg-gray-50 rounded">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold text-[#32a86d]">📝 Posts</h2>
            <div className="flex gap-2">
              {isOwnProfile && (
                <button
                  onClick={() => user.id && fetchUserPosts(user.id)}
                  disabled={loadingPosts}
                  className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 disabled:opacity-50"
                  title="Refresh posts"
                >
                  {loadingPosts ? '⏳' : '🔄'}
                </button>
              )}
            </div>
          </div>
          
          {loadingPosts ? (
            <div className="text-center py-4">
              <p className="text-gray-500">Loading posts...</p>
            </div>
          ) : userPosts && userPosts.length > 0 ? (
            <div className="space-y-4">
              {/* console.log('Rendering user posts:', userPosts); */}
              {userPosts.map((post) => (
                <div key={post.id} className="bg-white p-4 rounded shadow border-l-4 border-[#32a86d]">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">
                        {new Date(post.createdAt).toLocaleString()}
                      </span>
                    </div>
                    {isOwnProfile && (
                      <button
                        onClick={async () => {
                          if (window.confirm('Are you sure you want to delete this post?')) {
                            try {
                              await api.delete(`/posts/${post.id}`);
                              window.location.reload();
                            } catch (error) {
                              alert('Failed to delete post: ' + (error.response?.data || error.message));
                            }
                          }
                        }}
                        className="text-red-500 hover:text-red-700 text-sm"
                        title="Delete post"
                      >
                        ×
                      </button>
                    )}
                  </div>
                  <p className="text-gray-800 leading-relaxed">{post.content}</p>
                </div>
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
