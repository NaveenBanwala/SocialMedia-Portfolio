import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <header className="bg-[#32a86d] text-white px-6 py-4 flex justify-between items-center shadow-md">
      {/* ▼ Brand + primary links */}
      <div className="flex items-center gap-6">
        <Link to="/" className="text-2xl font-bold hover:underline">
          Naveen
        </Link>
        <Link to="/" className="hover:underline">
          Home
        </Link>
        <Link to="/profile/me" className="hover:underline">
          Profile
        </Link>
      </div>

      <Link
        to="/search"
        className="mx-6 bg-white text-[#32a86d] font-semibold px-4 py-2 rounded hover:bg-gray-200 transition"
      >
        Search
      </Link>

      {/* ▼ Auth buttons */}
      <div className="flex gap-4">
        {token ? (
          <button
            onClick={handleLogout}
            className="bg-white text-[#32a86d] font-semibold px-4 py-2 rounded hover:bg-gray-200 transition"
          >
            Logout
          </button>
        ) : (
          <>
            <Link to="/login">
              <button className="bg-white text-[#32a86d] font-semibold px-4 py-2 rounded hover:bg-gray-200 transition">
                Login
              </button>
            </Link>
            <Link to="/register">
              <button className="bg-white text-[#32a86d] font-semibold px-4 py-2 rounded hover:bg-gray-200 transition">
                Register
              </button>
            </Link>
          </>
        )}
      </div>
    </header>
  );
}

export default Navbar;


