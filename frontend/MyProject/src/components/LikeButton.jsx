import React, { useState } from 'react';
import api from '../Api/api.jsx';

const LikeButton = ({ type = 'post', id, initialLiked = false, initialLikes = 0, userId }) => {
  // State for like status and count
  const [liked, setLiked] = useState(initialLiked);
  const [likes, setLikes] = useState(initialLikes);
  const [loading, setLoading] = useState(false);

  // Toggle like status and update backend
  const toggleLike = async () => {
    setLoading(true);
    try {
      console.log('LikeButton clicked:', { type, id, liked });
      if (type === 'post') {
        await api.post(`/posts/${id}/${liked ? 'unlike' : 'like'}`);
      } else if (type === 'project') {
        // For project, like/unlike endpoints may be the same, backend should handle toggle
        await api.post(`/likes/project/${id}`, null, { params: { userId } });
      } else if (type === 'profile') {
        await api.post(`/likes/profile/${id}`, null, { params: { likedById: userId } });
      }
      setLikes(liked ? likes - 1 : likes + 1);
      setLiked(!liked);
    } catch (err) {
      console.error('Error toggling like:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleLike}
      disabled={loading}
      className={`mt-2 px-3 py-1 rounded-full text-sm font-medium border-2 transition 
        ${liked ? 'bg-[#32a86d] text-white border-[#32a86d]' : 'bg-white text-[#32a86d] border-[#32a86d]'}
        ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {liked ? 'Liked' : 'Like'} {likes > 0 && <span>({likes})</span>}
    </button>
  );
};

export default LikeButton;
