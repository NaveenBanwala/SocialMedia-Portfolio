import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../Api/AuthContext.jsx';

function Navbar() {
  const { isAuthenticated, logout, isAdmin, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white text-[#32a86d] px-6 py-4 flex justify-between items-center shadow-md">
      {/* Left: Profile + Search */}
      <div className="flex items-center gap-4">
        {/* Profile Circle */}
        <Link
          to="/profile/me"
          className="w-10 h-10 flex items-center justify-center rounded-full bg-[#32a86d] text-white text-sm font-semibold hover:opacity-90 transition"
        >
          {/* Optionally show user initial or icon here */}
          {user && user.name ? user.name[0].toUpperCase() : ''}
        </Link>

        {/* Search Button */}
        <Link to="/search">
          <button className="bg-white text-[#32a86d] font-semibold px-4 py-2 rounded hover:bg-gray-200 hover:border hover:border-[#32a86d] hover:rounded-lg transition">
            Search
          </button>
        </Link>
        {/* Admin Panel Link */}
        {isAdmin && (
          <Link to="/admin">
            <button className="bg-white border-2 border-[#32a86d] text-[#32a86d] font-semibold px-4 py-2 rounded hover:bg-[#32a86d] hover:text-white transition ml-2">
              Admin Panel
            </button>
          </Link>
        )}
      </div>

      {/* Center: Logo */}
      <div className="text-2xl font-bold cursor-pointer">
        <Link to="/dashboard" className="text-[#32a86d] hover:opacity-80 transition">
          LOGO
        </Link>
        {isAdmin && <span className="ml-2 px-2 py-1 text-xs bg-[#32a86d] text-white rounded">ADMIN</span>}
      </div>

      {/* Right: Login/Register or Logout */}
      <div className="flex gap-4 items-center">
        {isAuthenticated ? (
          <button
            onClick={handleLogout}
            className="bg-white text-[#32a86d] font-semibold px-4 py-2 rounded hover:bg-gray-200 hover:border hover:border-[#32a86d] hover:rounded-lg transition"
          >
            LogOut
          </button>
        ) : (
          <>
            <Link to="/login">
              <button className="bg-white text-[#32a86d] font-semibold px-4 py-2 rounded hover:bg-gray-200 hover:border hover:border-[#32a86d] hover:rounded-lg transition">
                Login
              </button>
            </Link>
            <Link to="/register">
              <button className="bg-white text-[#32a86d] font-semibold px-4 py-2 rounded hover:bg-gray-200 hover:border hover:border-[#32a86d] hover:rounded-lg transition">
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



