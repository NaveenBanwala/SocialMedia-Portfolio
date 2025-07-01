import React, { useState, useEffect } from 'react';
import { useAuth } from '../Api/AuthContext.jsx';
import api from '../Api/api.jsx';

const PostCard = ({ post }) => {
  const { user: currentUser } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [friendRequestSent, setFriendRequestSent] = useState(false);
  const [friendRequestStatus, setFriendRequestStatus] = useState(null);

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
        // Check if user liked
        // (Optional: If you have a hasUserLikedPost endpoint, use it. Otherwise, infer from post.likedBy if available)
        // For now, assume backend returns likedBy array in post (if not, skip this)
        if (post.likedBy && Array.isArray(post.likedBy)) {
          setLiked(post.likedBy.some(u => u.id === currentUser.id));
        } else {
          // Fallback: try to like and catch error if already liked
          // Or skip
        }
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
        setLiked(true);
        setLikeCount(likeCount + 1);
      } else {
        await api.post(`/likes/post/${post.id}/unlike?userId=${currentUser.id}`);
        setLiked(false);
        setLikeCount(likeCount - 1);
      }
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

  return (
    <div className="border-2 border-[#32a86d] rounded-xl p-4 shadow bg-white">
      {/* User info header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Profile picture */}
          <div className="relative">
            {post.user?.profilePicUrl ? (
              <img
                src={getImageUrl(post.user.profilePicUrl)}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover border-2 border-[#32a86d]"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <DefaultProfileImage 
              username={post.user?.username} 
              style={{ display: post.user?.profilePicUrl ? 'none' : 'flex' }}
            />
          </div>
          
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#32a86d] text-lg">
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
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border-2 transition 
              ${liked ? 'bg-[#32a86d] text-white border-[#32a86d]' : 'bg-white text-[#32a86d] border-[#32a86d]'}
              ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#32a86d] hover:text-white'}`}
          >
            {liked ? '❤️' : '🤍'} {likeCount > 0 && <span>({likeCount})</span>}
          </button>

          {/* Friend request button - show for different users */}
          {currentUser && 
            post.user?.id !== currentUser.id && (
            <button
              onClick={handleFriendRequest}
              disabled={friendRequestStatus === 'PENDING' || friendRequestStatus === 'ACCEPTED'}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border-2 transition
                ${friendRequestStatus === 'PENDING' ? 'bg-gray-300 text-gray-600 border-gray-300 cursor-not-allowed' :
                  friendRequestStatus === 'ACCEPTED' ? 'bg-green-200 text-green-700 border-green-300 cursor-not-allowed' :
                  'bg-blue-500 text-white border-blue-500 hover:bg-blue-600'}
              `}
            >
              {friendRequestStatus === 'PENDING' ? '⏳ Pending' :
                friendRequestStatus === 'ACCEPTED' ? '✅ Friends' :
                '👥 Add Friend'}
            </button>
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