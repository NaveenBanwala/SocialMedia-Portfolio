import React, { useState } from 'react';
import api from '../Api/api.jsx';

const SearchUserPage = () => {
  // State for search input and results
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle search form submit
  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/search?name=${encodeURIComponent(query)}`); // Use 'name' param for backend
      setResults(res.data);
    } catch (err) {
      setError('Error searching users.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 min-h-screen bg-white">
      <h1 className="text-2xl font-bold mb-4 text-[#32a86d] border-b-2 border-[#32a86d] pb-2">Search Users</h1>
      {/* Search form */}
      <form onSubmit={handleSearch} className="mb-6 flex gap-2">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Enter username or email..."
          className="border-2 border-[#32a86d] rounded px-4 py-2 w-full focus:outline-none"
        />
        <button
          type="submit"
          className="bg-[#32a86d] text-white px-4 py-2 rounded hover:bg-[#2c915d] font-semibold"
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>
      {/* Error message */}
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {results.map(user => (
          <div key={user.id} className="border-2 border-[#32a86d] rounded-xl p-4 bg-white flex items-center gap-4">
            <img
              src={user.profilePicUrl || '/default-profile.png'}
              alt="Profile"
              className="w-16 h-16 rounded-full object-cover border-2 border-[#32a86d]"
            />
            <div>
              <div className="font-semibold text-[#32a86d]">{user.name}</div>
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
