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
  // State for image upload and preview
  const [images, setImages] = useState([]);
  const [current, setCurrent] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);

  const fileInputRef = useRef(null);

  const handleUpload = (e) => {
    const files = Array.from(e.target.files);
    const urls = files.map(file => URL.createObjectURL(file));
    setImages(urls);
    setCurrent(0);
  };

  const nextImage = () => {
    if (images.length === 0) return;
    setCurrent((prev) => (prev + 1) % images.length);
  };

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % images.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);

  const handleAddImageClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImages((prev) => [...prev, ev.target.result]);
      };
      reader.readAsDataURL(file);
    }
  };

  // Fetch posts and user data from backend on mount
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
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Sort posts by creation date (latest first)
  const sortedPosts = [...posts].sort((a, b) => {
    return new Date(b.createdAt || b.id) - new Date(a.createdAt || a.id);
  });

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 bg-blue-50 min-h-screen">
      {/*Incoming Updates By Naveen Banwala*/}

      <div className="max-w-6xl mx-auto ">
        {/* Welcome Section */}
        <div className="relative mb-6">
          {/* Left arrow */}
          <button onClick={prevSlide} className="absolute left-2 top-1/2 z-10 bg-white rounded-full shadow p-2">&#8592;</button>
          {/* Image */}
          <img src={images[currentSlide]} alt="slide" className="w-full h-64 object-cover rounded" />
          {/* Right arrow */}
          <button onClick={nextSlide} className="absolute right-2 top-1/2 z-10 bg-white rounded-full shadow p-2">&#8594;</button>
          {/* Show add/update button only for admin */}
          {user?.roles?.includes('ROLE_ADMIN') && (
            <>
              <button onClick={handleAddImageClick} className="absolute bottom-2 right-2 bg-blue-500 text-white px-4 py-2 rounded">Add/Update Image</button>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
            </>
          )}
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-3xl font-bold mb-2 text-[#32a86d]">Welcome back, {user?.username || 'User'}!</h2>
          <p className="text-gray-600">Manage your profile, projects, and stay connected with the community.</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-20 mb-8">
          {/* Create Post */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-[#32a86d] rounded-full flex items-center justify-center text-white font-bold text-lg">
                ✍️
              </div>
              <h3 className="text-lg font-semibold ml-3 text-[#32a86d]">Create Post</h3>
            </div>
            <p className="text-gray-600 mb-4">Share your thoughts and updates with the community.</p>
            <Link to="/create-post">
              <button className="w-full bg-[#32a86d] text-white py-2 px-4 rounded hover:bg-[#2c915d] transition">
                Create Post
              </button>
            </Link>
          </div>

          {/* Upload Profile Picture */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-[#32a86d] rounded-full flex items-center justify-center text-white font-bold text-lg">
                👤
              </div>
              <h3 className="text-lg font-semibold ml-3 text-[#32a86d]">Profile Picture</h3>
            </div>
            <p className="text-gray-600 mb-4">Upload a new profile picture to make your profile stand out.</p>
            <Link to="/profile/me">
              <button className="w-full bg-[#32a86d] text-white py-2 px-4 rounded hover:bg-[#2c915d] transition">
                Manage Profile
              </button>
            </Link>
          </div>

          {/* Add New Project */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-[#32a86d] rounded-full flex items-center justify-center text-white font-bold text-lg">
                📁
              </div>
              <h3 className="text-lg font-semibold ml-3 text-[#32a86d]">New Project</h3>
            </div>
            <p className="text-gray-600 mb-4">Showcase your work by adding a new project with images.</p>
            <Link to="/add-project">
              <button className="w-full bg-[#32a86d] text-white py-2 px-4 rounded hover:bg-[#2c915d] transition">
                Add Project
              </button>
            </Link>
          </div>

          {/* Edit Profile */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-[#32a86d] rounded-full flex items-center justify-center text-white font-bold text-lg">
                ⚙️
              </div>
              <h3 className="text-lg font-semibold ml-3 text-[#32a86d]">Edit Profile</h3>
            </div>
            <p className="text-gray-600 mb-4">Update your bio, skills, location, and resume.</p>
            <Link to="/edit-profile">
              <button className="w-full bg-[#32a86d] text-white py-2 px-4 rounded hover:bg-[#2c915d] transition">
                Edit Profile
              </button>
            </Link>
          </div>
        </div>

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