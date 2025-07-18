import React, { useState, useEffect } from 'react';
import api from '../Api/api.jsx';

const SearchUserPage = () => {
  // State for search input and results
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // Add state for image error for each user
  const [imgErrors, setImgErrors] = useState({});

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

  // Check if profile picture URL is valid
  const hasValidProfilePic = (profilePicUrl) => {
    return profilePicUrl && profilePicUrl.trim() !== '';
  };

  // Default profile image component
  const DefaultProfileImage = ({ username, size = "w-16 h-16" }) => (
    <div className={`${size} rounded-full bg-[#32a86d] flex items-center justify-center text-white text-xl font-bold border-2 border-[#32a86d]`}>
      {username ? username.charAt(0).toUpperCase() : 'U'}
    </div>
  );

  // Real-time search as user types (debounced)
  useEffect(() => {
    if (!query) {
      setResults([]);
      setError('');
      return;
    }
    const delayDebounce = setTimeout(async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get(`/search?name=${encodeURIComponent(query)}`);
        setResults(res.data);
      } catch (err) {
        setError('Error searching users.');
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400); // 400ms debounce
    return () => clearTimeout(delayDebounce);
  }, [query]);

  return (
    <div className="p-6 min-h-screen bg-white">
      <h1 className="text-2xl font-bold mb-4 text-[#32a86d] border-b-2 border-[#32a86d] pb-2">Search Users</h1>
      {/* Search form */}
      <div className="mb-6 flex gap-2">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Enter username or email..."
          className="border-2 border-[#32a86d] rounded px-4 py-2 w-full focus:outline-none"
        />
      </div>
      {/* Error message */}
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {results.map(user => (
          <div key={user.id} className="border-2 border-[#32a86d] rounded-xl p-4 bg-white flex items-center gap-4">
            <div className="relative">
              {hasValidProfilePic(user.profilePicUrl) && !imgErrors[user.id] ? (
                <img
                  src={getImageUrl(user.profilePicUrl)}
                  alt="Profile"
                  className="w-16 h-16 rounded-full object-cover border-2 border-[#32a86d]"
                  onError={() => setImgErrors(prev => ({ ...prev, [user.id]: true }))}
                />
              ) : (
                <DefaultProfileImage username={user.username || user.name} />
              )}
            </div>
            <div>
              <div className="font-semibold text-[#32a86d]">{user.name || user.username}</div>
              <div className="text-sm text-gray-600">{user.email}</div>
              <button
                onClick={() => window.location.href = `/profile/${user.id}`}
                className="mt-2 px-3 py-1 rounded bg-white text-[#32a86d] border-2 border-[#32a86d] hover:bg-[#32a86d] hover:text-white transition"
              >
                View Profile
              </button>
            </div>
          </div>
        ))}
      </div>
      {/* No results message */}
      {results.length === 0 && !loading && query && !error && (
        <div className="text-gray-500 mt-4">No users found.</div>
      )}
    </div>
  );
};

export default SearchUserPage;
