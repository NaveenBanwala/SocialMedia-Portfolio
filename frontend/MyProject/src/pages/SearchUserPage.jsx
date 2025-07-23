import React, { useState, useEffect } from 'react';
import api from '../Api/api.jsx';
import ProjectCard from '../components/ProjectCard';

const SearchUserPage = () => {
  // State for search input and results
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imgErrors, setImgErrors] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [projects, setProjects] = useState([]);

  // Fetch all projects on mount (latest first)
  useEffect(() => {
    api.get('/projects').then(res => {
      const sorted = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setProjects(sorted);
    });
  }, []);

  // Live search as user types (debounced)
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

  // Helper function to construct full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/images/')) {
      return `http://localhost:8080/api/files${imagePath.substring(7)}`;
    }
    return `http://localhost:8080${imagePath}`;
  };

  const hasValidProfilePic = (profilePicUrl) => {
    return profilePicUrl && profilePicUrl.trim() !== '';
  };

  const DefaultProfileImage = ({ username, size = "w-16 h-16" }) => (
    <div className={`${size} rounded-full bg-[#32a86d] flex items-center justify-center text-white text-xl font-bold border-2 border-[#32a86d]`}>
      {username ? username.charAt(0).toUpperCase() : 'U'}
    </div>
  );

  // Search handler (on button click)
  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/search?name=${encodeURIComponent(query)}`);
      setResults(res.data);
      setShowResults(true);
    } catch (err) {
      setError('Error searching users.');
      setResults([]);
      setShowResults(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 min-h-screen bg-white">
      <h1 className="text-2xl font-bold mb-4 text-[#32a86d] border-b-2 border-[#32a86d] pb-2">Search Users</h1>
      {/* Search form */}
      <div className="mb-6 flex gap-2 justify-center">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Enter username or email..."
          className="border-2 border-[#32a86d] rounded px-4 py-2 w-full max-w-md focus:outline-none"
        />
      </div>
      {/* Error message */}
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {/* Show projects grid if query is empty, else show user search results and random projects */}
      {(!query) ? (
        <>
          <h2 className="text-xl font-semibold mb-2 text-[#32a86d]">Latest Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </>
      ) : (
        <div className="mt-8">
          <div className="p-6 bg-gray-50 rounded shadow mb-8">
            <h2 className="text-xl font-semibold mb-4 text-[#32a86d]">User Search Results</h2>
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
          {/* Random project cards */}
          <div>
            <h2 className="text-xl font-semibold mb-2 text-[#32a86d]">Project Feed</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(() => {
                // Shuffle projects and take 6
                const shuffled = [...projects].sort(() => Math.random() - 0.5);
                return shuffled.slice(0, 6).map(project => (
                  <ProjectCard key={project.id} project={project} />
                ));
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchUserPage;
