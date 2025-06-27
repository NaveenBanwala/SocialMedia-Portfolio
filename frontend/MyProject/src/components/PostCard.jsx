import React from 'react';
import LikeButton from './LikeButton';

const PostCard = ({ post }) => (
  <div className="border-2 border-[#32a86d] rounded-xl p-4 shadow bg-white">
    {/* Username and time */}
    <div className="flex items-center justify-between mb-2">
      <span className="font-semibold text-[#32a86d]">{post.username}</span>
      <span className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleString()}</span>
    </div>
    {/* Post content */}
    <p className="text-gray-800 mb-2">{post.content}</p>
    {/* Optional image */}
    {post.image && <img src={post.image} alt="Post" className="mt-2 rounded" />}
    {/* Like button */}
    <LikeButton postId={post.id} initialLiked={post.liked} initialLikes={post.likesCount} />
  </div>
);

export default PostCard;