import React, { useState } from 'react';
import api from '../Api/api.jsx';

const LikeButton = ({ postId, initialLiked = false, initialLikes = 0 }) => {
  // State for like status and count
  const [liked, setLiked] = useState(initialLiked);
  const [likes, setLikes] = useState(initialLikes);
  const [loading, setLoading] = useState(false);

  // Toggle like status and update backend
  const toggleLike = async () => {
    setLoading(true);
    try {
      if (!liked) {
        await api.post(`/posts/${postId}/like`);
        setLikes(likes + 1);
      } else {
        await api.post(`/posts/${postId}/unlike`);
        setLikes(likes - 1);
      }
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
