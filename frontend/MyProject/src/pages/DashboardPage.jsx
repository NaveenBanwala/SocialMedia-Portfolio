import React, { useEffect, useState } from 'react';
import PostCard from '../components/PostCard';
import api from '../Api/api.jsx';

const DashboardPage = () => {
  // State to hold posts
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch posts from backend on mount
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await api.get('/posts'); // Adjust endpoint if needed
        setPosts(res.data);
      } catch (err) {
        console.error('Error fetching posts:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  if (loading) return <div className="p-6">Loading posts...</div>;

  return (
    <div className="p-6 bg-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-[#32a86d] border-b-2 border-[#32a86d] pb-2">Dashboard</h1>
      {/* Render posts */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="text-gray-500">No posts to display.</div>
        ) : (
          posts.map(post => <PostCard key={post.id} post={post} />)
        )}
      </div>
    </div>
  );
};

export default DashboardPage;