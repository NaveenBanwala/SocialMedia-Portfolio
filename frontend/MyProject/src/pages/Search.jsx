import React, { useState } from 'react';
import api from '../Api/api'; // your axios client
import { Link } from 'react-router-dom';

const Search = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);

    const handleSearch = async () => {
    try {
      const res = await api.get(`/users/search?query=${query}`);
      setResults(res.data);
    } catch (err) {
      console.error('Search failed', err);
    }
  };

  return (
    <div className="p-8 min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold text-[#32a86d] mb-4">Search Developers</h1>

      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by name, skill, or location"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full px-4 py-2 rounded border border-gray-300"
        />
        <button
          onClick={handleSearch}
          className="bg-[#32a86d] text-white px-4 py-2 rounded hover:bg-[#2c915d]"
        >
          Search
        </button>
      </div>

      {/* Result List */}
      <div className="grid gap-4">
        {results.length === 0 && <p>No users found.</p>}
        {results.map((user) => (
          <div
            key={user.id}
            className="bg-white p-4 rounded shadow flex justify-between items-center"
          >
            <div>
              <h2 className="text-lg font-semibold text-[#32a86d]">{user.name}</h2>
              <p className="text-sm text-gray-600">{user.location}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {user.skills.map((skill, i) => (
                  <span
                    key={i}
                    className="bg-[#32a86d] text-white text-xs px-2 py-1 rounded"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <Link
                to={`/profile/${user.id}`}
                className="bg-gray-200 hover:bg-gray-300 text-sm px-3 py-1 rounded"
              >
                View Profile
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Search;
