import React, { useState, useEffect } from 'react';
import { useAuth } from '../Api/AuthContext.jsx';
import api from '../Api/api.jsx';
import { useNavigate } from 'react-router-dom';

const PostCard = ({ post, onDelete }) => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [friendRequestSent, setFriendRequestSent] = useState(false);
  const [friendRequestStatus, setFriendRequestStatus] = useState(null);
  const [showLikeCount, setShowLikeCount] = useState(true);
  const [imgError, setImgError] = useState(false); // Track image load error
  const [menuOpen, setMenuOpen] = useState(false);

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

  // Default profile image component
  const DefaultProfileImage = ({ username, size = "w-10 h-10" }) => (
    <div className={`${size} rounded-full bg-[#32a86d] flex items-center justify-center text-white text-sm font-bold`}>
      {username ? username.charAt(0).toUpperCase() : 'U'}
    </div>
  );

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else {
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  useEffect(() => {
    const fetchLikeStatus = async () => {
      try {
        if (!currentUser) return;
        // Get like count
        const countRes = await api.get(`/likes/post/${post.id}/count`);
        setLikeCount(countRes.data);
        // Check if user liked (use backend endpoint for status)
        const statusRes = await api.get(`/likes/post/${post.id}/status?userId=${currentUser.id}`);
        setLiked(statusRes.data.liked);
      } catch (error) {
        console.error('Error fetching like status:', error);
      }
    };
    if (post.id && currentUser) {
      fetchLikeStatus();
    }
  }, [post.id, currentUser]);

  useEffect(() => {
    const fetchFriendRequestStatus = async () => {
      if (!currentUser || !post.user?.id || post.user.id === currentUser.id) return;
      try {
        const res = await api.get(`/users/${post.user.id}/friend-request/status`);
        setFriendRequestStatus(res.data ? res.data.status : null);
      } catch (err) {
        setFriendRequestStatus(null);
      }
    };
    fetchFriendRequestStatus();
  }, [currentUser, post.user?.id]);

  const handleLike = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      if (!liked) {
        await api.post(`/likes/post/${post.id}?userId=${currentUser.id}`);
      } else {
        await api.post(`/likes/post/${post.id}/unlike?userId=${currentUser.id}`);
      }
      // Always fetch the latest count and status after like/unlike
      const countRes = await api.get(`/likes/post/${post.id}/count`);
      setLikeCount(countRes.data);
      const statusRes = await api.get(`/likes/post/${post.id}/status?userId=${currentUser.id}`);
      setLiked(statusRes.data.liked);
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setLoading(false);
    }
  };

  // Send friend request
  const handleFriendRequest = async () => {
    if (!currentUser || post.user.id === currentUser.id) return;
    try {
      await api.post(`/users/${post.user.id}/friend-request`);
      setFriendRequestStatus('PENDING');
      alert('Friend request sent successfully!');
    } catch (error) {
      alert('Failed to send friend request: ' + (error.response?.data || error.message));
    }
  };

  const handleCancelRequest = async () => {
    if (!currentUser || post.user.id === currentUser.id) return;
    try {
      await api.delete(`/users/${post.user.id}/cancel-friend-request`);
      setFriendRequestStatus(null);
    } catch (error) {
      alert('Failed to cancel friend request: ' + (error.response?.data || error.message));
    }
  };

  // Add unfriend handler
  const handleUnfriend = async () => {
    if (!currentUser || post.user.id === currentUser.id) return;
    try {
      await api.delete(`/users/${post.user.id}/unfollow`);
      setFriendRequestStatus(null);
      alert('Unfriended successfully!');
    } catch (error) {
      alert('Failed to unfriend: ' + (error.response?.data || error.message));
    }
  };

  return (
    <div className="border-2 border-[#32a86d] rounded-xl p-4 shadow bg-white relative">
      {/* 3-dots menu */}
      {currentUser && post.user?.id === currentUser.id && (
        <>
          <button
            className="absolute top-2 right-2 text-gray-800 hover:text-black text-3xl font-bold focus:outline-none"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="More options"
          >
            &#x22EE;
          </button>
          {menuOpen && (
            <div className="absolute top-10 right-2 bg-white border rounded shadow z-10">
              <button
                className="block px-4 py-2 text-red-600 hover:bg-red-50 w-full text-left"
                onClick={async () => {
                  setMenuOpen(false);
                  if (window.confirm('Are you sure you want to delete this post?')) {
                    try {
                      await api.delete(`/posts/${post.id}`);
                      if (onDelete) onDelete(post.id);
                    } catch (e) {
                      alert('Failed to delete post.');
                    }
                  }
                }}
              >
                Delete Post
              </button>
            </div>
          )}
        </>
      )}
      {/* User info header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Profile picture */}
          <div className="relative cursor-pointer" onClick={() => navigate(`/profile/${post.user?.id}`)}>
            {post.user?.profilePicUrl && getImageUrl(post.user.profilePicUrl) && !imgError ? (
              <img
                src={getImageUrl(post.user.profilePicUrl)}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover border-2 border-[#32a86d]"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#32a86d] flex items-center justify-center text-white text-sm font-bold border-2 border-[#32a86d]">
                {post.user?.username ? post.user.username.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#32a86d] text-lg cursor-pointer" onClick={() => navigate(`/profile/${post.user?.id}`)}>
                {post.user?.username || 'Unknown User'}
              </span>
              {post.user?.location && (
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  📍 {post.user.location}
                </span>
              )}
            </div>
            <span className="text-xs text-gray-500">
              {formatDate(post.createdAt)}
            </span>
          </div>
        </div>
        {/* Post author indicator */}
        {currentUser && post.user?.id === currentUser.id && (
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            Your Post
          </span>
        )}
      </div>

    {/* Post content */}
      <p className="text-gray-800 mb-3 leading-relaxed">{post.content}</p>

    {/* Optional image */}
      {post.image && (
        <img 
          src={getImageUrl(post.image)} 
          alt="Post" 
          className="mt-2 rounded w-full max-h-64 object-cover"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      )}

      {/* Action buttons */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
        <div className="flex items-center gap-3">
          {/* Like button */}
          <button
            onClick={handleLike}
            disabled={loading}
            onMouseEnter={() => setShowLikeCount(false)}
            onMouseLeave={() => setShowLikeCount(true)}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border-2 transition
              ${liked ? 'bg-white text-red-500 border-red-500 hover:border-red-700' : 'bg-white text-[#32a86d] border-[#32a86d] hover:border-[#2c915d]'}
              ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span className={liked ? 'text-red-500' : 'text-[#32a86d]'}>{liked ? '❤️' : '🤍'}</span>
            {showLikeCount !== false && likeCount > 0 && <span>{likeCount}</span>}
          </button>
          {/* Friend action button */}
          {currentUser && post.user?.id !== currentUser.id && (
            <>
              {friendRequestStatus === null && (
                <button
                  onClick={handleFriendRequest}
                  className="px-3 py-1 rounded-full text-sm font-medium border-2 border-blue-500 text-blue-500 bg-white hover:border-blue-700 transition"
                >
                  Add Friend
                </button>
              )}
              {friendRequestStatus === 'PENDING' && (
                <button
                  onClick={handleCancelRequest}
                  className="px-3 py-1 rounded-full text-sm font-medium border-2 border-yellow-500 text-yellow-500 bg-white hover:border-yellow-600 transition"
                >
                  Cancel Request
                </button>
              )}
              {friendRequestStatus === 'ACCEPTED' && (
                <button
                  onClick={handleUnfriend}
                  className="px-3 py-1 rounded-full text-sm font-medium border-2 border-red-500 text-red-500 bg-white hover:border-red-600 transition"
                >
                  Unfriend
                </button>
              )}
            </>
          )}
        </div>

        {/* Post author indicator */}
        {currentUser && post.user?.id === currentUser.id && (
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            Your Post
          </span>
        )}
      </div>
  </div>
);
};

export default PostCard;