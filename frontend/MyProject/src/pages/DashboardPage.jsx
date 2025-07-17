import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import PostCard from '../components/PostCard';
import api from '../Api/api.jsx';

const DashboardPage = () => {
  // State to hold posts
  const [posts, setPosts] = useState([]);
  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showAllPosts, setShowAllPosts] = useState(true);
  // Replace dashboardImages and carousel logic with a single dashboardImage
  const [dashboardImage, setDashboardImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef();

  // Fetch dashboard images from backend
  const fetchDashboardImage = async () => {
    try {
      const res = await api.get('/dashboard-images');
      setDashboardImage(res.data);
    } catch (err) {
      setDashboardImage(null);
    }
  };

  // Fetch posts, user, and dashboard images on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user data
        const userRes = await api.get('/users/me');
        setUser(userRes.data);
        // Fetch user's own posts
        const myPostsRes = await api.get('/posts/me');
        setMyPosts(myPostsRes.data);
        // Fetch all posts
        const allPostsRes = await api.get('/posts/all');
        setPosts(allPostsRes.data);
        // Fetch dashboard image
        await fetchDashboardImage();
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Carousel controls
  const nextSlide = () => {
    if (dashboardImage === null) return;
    // No carousel, so no next/prev logic needed here
  };
  const prevSlide = () => {
    if (dashboardImage === null) return;
    // No carousel, so no next/prev logic needed here
  };

  // Admin: handle image upload
  const handleAddImageClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      await api.post('/dashboard-images/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await fetchDashboardImage();
    } catch (err) {
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };
  // Admin: handle image delete
  const handleDeleteImage = async (id) => {
    if (!window.confirm('Delete this image?')) return;
    try {
      await api.delete(`/dashboard-images/${id}`);
      await fetchDashboardImage();
    } catch (err) {
      alert('Failed to delete image');
    }
  };

  // Sort posts by creation date (latest first)
  const sortedPosts = [...posts].sort((a, b) => {
    return new Date(b.createdAt || b.id) - new Date(a.createdAt || a.id);
  });

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 bg-blue-50 min-h-screen">
      {/*Incoming Updates By Naveen Banwala*/}

      <div className="max-w-6xl mx-auto ">
        {/* Dashboard Image */}
        <div className="relative mb-6">
          {dashboardImage ? (
            <img
              src={dashboardImage.url}
              alt="dashboard"
              className="w-full h-64 object-cover rounded"
            />
          ) : (
            <div className="w-full h-64 flex items-center justify-center bg-gray-200 rounded text-gray-500">No dashboard image</div>
          )}
          {/* Show add/delete buttons only for admin */}
          {user?.roles?.includes('ROLE_ADMIN') && (
            <>
              <button
                onClick={handleAddImageClick}
                className="absolute bottom-2 right-2 bg-blue-500 text-white px-4 py-2 rounded"
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Add Image'}
              </button>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
              {dashboardImage && (
                <button
                  onClick={() => handleDeleteImage(dashboardImage.id)}
                  className="absolute bottom-2 left-2 bg-red-500 text-white px-4 py-2 rounded"
                >
                  Delete Image
                </button>
              )}
            </>
          )}
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-3xl font-bold mb-2 text-[#32a86d]">Welcome back, {user?.username || 'User'}!</h2>
          <p className="text-gray-600">Manage your profile, projects, and stay connected with the community.</p>
        </div>

        {/* Quick Actions */}
        {/* Removed quick action boxes for Create Post, Upload Profile Picture, Add New Project, Edit Profile as per request */}

        {/* Posts Feed Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-4 border-b-2 border-[#32a86d] pb-2">
            <h2 className="text-2xl font-bold text-[#32a86d]">Community Feed</h2>
            <Link to="/create-post">
              <button className="bg-[#32a86d] text-white px-4 py-2 rounded hover:bg-[#2c915d] transition">
                + New Post
              </button>
            </Link>
          </div>

          {/* Filter Controls */}
          <div className="mb-6 flex flex-wrap gap-10 items-center ">
            <div className="flex gap-2">
              <button
                onClick={() => setShowAllPosts(true)}
                className={`px-4 py-2 rounded transition ${
                  showAllPosts 
                    ? 'bg-[#32a86d] text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All Posts
              </button>
              <button
                onClick={() => setShowAllPosts(false)}
                className={`px-4 py-2 rounded transition ${
                  !showAllPosts 
                    ? 'bg-[#32a86d] text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                My Posts
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {(showAllPosts ? sortedPosts : myPosts).length === 0 ? (
              <div className="text-gray-500 text-center py-8">
                <p className="text-lg mb-2">
                  {showAllPosts ? 'No posts to display.' : 'No posts yet.'}
                </p>
                <p className="text-sm mb-4">
                  {showAllPosts 
                    ? 'Be the first to share something with the community!' 
                    : 'Start sharing your thoughts with the community!'
                  }
                </p>
                <Link to="/create-post">
                  <button className="bg-[#32a86d] text-white px-6 py-2 rounded hover:bg-[#2c915d] transition">
                    Create Your First Post
                  </button>
                </Link>
              </div>
            ) : (
              (showAllPosts ? sortedPosts : myPosts).map(post => (
                <PostCard key={post.id} post={post} />
              ))
            )}
          </div>
        </div>

        {/* Quick Stats */}
        {user && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl font-bold text-[#32a86d] mb-2">
                {myPosts.length}
              </div>
              <div className="text-gray-600">Posts</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl font-bold text-[#32a86d] mb-2">
                {user.skills?.length || 0}
              </div>
              <div className="text-gray-600">Skills</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl font-bold text-[#32a86d] mb-2">
                {myPosts.length}
              </div>
              <div className="text-gray-600">My Posts</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl font-bold text-[#32a86d] mb-2">
                {user.resumeUrl ? '✓' : '✗'}
              </div>
              <div className="text-gray-600">Resume</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;