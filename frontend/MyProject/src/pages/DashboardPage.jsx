import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import PostCard from '../components/PostCard';
import api from '../Api/api.jsx';
import { getVotingContestTop } from '../Api/api';

const DashboardPage = () => {
  // State to hold posts
  const [posts, setPosts] = useState([]);
  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showAllPosts, setShowAllPosts] = useState(true);
  // Replace dashboardImages and carousel logic with a single dashboardImage
  const [dashboardImages, setDashboardImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef();

  // Carousel state for dashboard images
  const [currentIndex, setCurrentIndex] = useState(0);
  // Auto-scroll effect
  useEffect(() => {
    if (!dashboardImages || dashboardImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % dashboardImages.length);
    }, 3000); // 3 seconds
    return () => clearInterval(interval);
  }, [dashboardImages]);

  // Manual controls
  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + dashboardImages.length) % dashboardImages.length);
  };
  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % dashboardImages.length);
  };

  // Fetch dashboard images from backend
  const fetchDashboardImages = async () => {
    try {
      const res = await api.get('/dashboard-images');
      setDashboardImages(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setDashboardImages([]);
    }
  };

  // Helper function to construct full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    // Use the new image serving endpoint
    if (imagePath.startsWith('/images/')) {
      return `http://localhost:8080/api/files${imagePath.substring(7)}`;
    }
    return `http://localhost:8080${imagePath}`;
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
        // Fetch dashboard images
        await fetchDashboardImages();
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const [topContestants, setTopContestants] = useState([]);
  const [votingEndedAt, setVotingEndedAt] = useState(null);
  const [showTopContestants, setShowTopContestants] = useState(false);

  useEffect(() => {
    const fetchTopContestants = async () => {
      try {
        const res = await getVotingContestTop();
        setTopContestants(res.data.topContestants || []);
        setVotingEndedAt(res.data.votingEndedAt);
        if (res.data.votingEndedAt) {
          const end = new Date(res.data.votingEndedAt);
          const now = new Date();
          const diff = (now - end) / (1000 * 60 * 60 * 24); // days
          setShowTopContestants(diff >= 0 && diff <= 2);
        } else {
          setShowTopContestants(false);
        }
      } catch {
        setShowTopContestants(false);
      }
    };
    fetchTopContestants();
  }, []);

  // Carousel controls
  const nextSlide = () => {
    if (dashboardImages === null) return;
    // No carousel, so no next/prev logic needed here
  };
  const prevSlide = () => {
    if (dashboardImages === null) return;
    // No carousel, so no next/prev logic needed here
  };

  // Admin: handle image upload
  const handleAddImageClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };
  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    if (files.length > 4) {
      alert('You can upload a maximum of 4 images. Only the first 4 will be used.');
    }
    setUploading(true);
    try {
      const formData = new FormData();
      files.slice(0, 4).forEach(file => formData.append('files', file));
      await api.post('/dashboard-images/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await fetchDashboardImages();
    } catch (err) {
      alert('Failed to upload image(s)');
    } finally {
      setUploading(false);
    }
  };
  // Admin: handle image delete
  const handleDeleteImage = async (id) => {
    if (!window.confirm('Delete this image?')) return;
    try {
      await api.delete(`/dashboard-images/${id}`);
      await fetchDashboardImages();
    } catch (err) {
      alert('Failed to delete image');
    }
  };

  // Sort posts by creation date (latest first)
  const sortedPosts = [...posts].sort((a, b) => {
    return new Date(b.createdAt || b.id) - new Date(a.createdAt || a.id);
  });

  const [previewPosition, setPreviewPosition] = useState('center');
  useEffect(() => {
    if (dashboardImages.length > 0) {
      setPreviewPosition(dashboardImages[currentIndex].position || 'center');
    }
  }, [currentIndex, dashboardImages]);

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 min-h-screen">
      {/*Incoming Updates By Naveen Banwala*/}
      <div className="max-w-6xl mx-auto">
        {/* Voting Contest Top 3 Section */}
        {showTopContestants && topContestants.length > 0 && (
          <div className="mb-8 bg-white rounded-lg shadow-md p-6 flex flex-col items-center shadow-[0_8px_48px_0_rgba(50,168,109,0.45)]">
            <h2 className="text-2xl font-bold text-[#32a86d] mb-4">Top 3 Contestants</h2>
            <div className="flex flex-wrap justify-center gap-8">
              {topContestants.map((c, idx) => (
                <div key={c.id} className="flex flex-col items-center">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#32a86d] mb-2">
                    <img src={c.imageUrl} alt={c.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="font-bold text-lg">{c.name}</div>
                  <div className="text-gray-500">Votes: {c.votes}</div>
                  <div className="text-sm text-gray-400 mt-1">#{idx + 1}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Voting Contest Card: Side-by-side image and apply area */}
        <div className="flex justify-center mb-10">
          <div className="w-full max-w-6xl bg-white rounded-xl shadow-lg flex flex-col md:flex-row overflow-hidden shadow-[0_8px_48px_0_rgba(50,168,109,0.45)]">
            {/* Left: Dashboard image with carousel and caption */}
            <div className="relative flex flex-col items-center justify-center p-4 md:w-1/2">
              <div className="relative w-full h-60 flex items-center justify-center rounded-lg shadow">
                {dashboardImages.length > 0 ? (
                  <>
                    <img
                      src={getImageUrl(dashboardImages[currentIndex].url)}
                      alt={`dashboard-${currentIndex}`}
                      className="w-full h-60 object-cover rounded-lg"
                      style={{ maxHeight: '15rem', objectFit: 'cover' }}
                    />
                    {dashboardImages.length > 1 && (
                      <>
                        <button
                          onClick={handlePrev}
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gray-700 bg-opacity-60 text-white rounded-full w-8 h-8 flex items-center justify-center z-10 hover:bg-gray-900"
                          aria-label="Previous image"
                        >
                          &#8592;
                        </button>
                        <button
                          onClick={handleNext}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-700 bg-opacity-60 text-white rounded-full w-8 h-8 flex items-center justify-center z-10 hover:bg-gray-900"
                          aria-label="Next image"
                        >
                          &#8594;
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">No dashboard image</div>
                )}
              </div>
              {/* Caption/label below image */}
              <div className="mt-3 w-full text-center font-semibold text-lg text-gray-700">
                Mission : Friend Request
              </div>
            </div>
            {/* Right: Text and Apply button */}
            <div className="flex flex-col items-center justify-center p-8 md:w-1/2">
              <div className="mb-6 text-lg text-center text-gray-700 font-medium">Ready to stand out? <br/> <span className='text-[#32a86d] font-bold'>Apply now and let your friends vote for you!</span></div>
              <Link to="/voting-contest/apply">
                <button
                  className="bg-gradient-to-r from-[#32a86d] to-[#43e97b] text-white px-6 py-2 rounded-full font-bold text-base shadow flex items-center gap-2 transition-transform duration-200 hover:scale-105 hover:shadow-xl focus:outline-none"
                >
                  <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' /></svg>
                  Apply
                </button>
              </Link>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 shadow-[0_8px_48px_0_rgba(50,168,109,0.45)]">
          <h2 className="text-3xl font-bold mb-2 text-[#32a86d]">Welcome back, {user?.username || 'User'}!</h2>
          <p className="text-gray-600">Manage your profile, projects, and stay connected with the community.</p>
        </div>
        {/* Posts Feed Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 shadow-[0_8px_48px_0_rgba(50,168,109,0.45)]">
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