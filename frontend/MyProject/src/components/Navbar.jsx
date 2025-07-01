import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../Api/AuthContext.jsx';
import api from '../Api/api.jsx';

function Navbar() {
  const { isAuthenticated, logout, isAdmin, user } = useAuth();
  const navigate = useNavigate();
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (user && user.id) {
        try {
          const res = await api.get(`/users/${user.id}/notifications`);
          // Count only unread notifications
          setNotifCount(res.data.filter(n => !n.read).length);
        } catch (err) {
          setNotifCount(0);
        }
      }
    };
    fetchNotifications();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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
  const hasValidProfilePic = user?.profilePicUrl && user.profilePicUrl.trim() !== '';

  // Default profile image component
  const DefaultProfileImage = ({ username, size = "w-10 h-10" }) => (
    <div className={`${size} rounded-full bg-[#32a86d] flex items-center justify-center text-white text-sm font-bold`}>
      {username ? username.charAt(0).toUpperCase() : 'U'}
    </div>
  );

  return (
    <header className="bg-white text-[#32a86d] px-6 py-4 flex justify-between items-center shadow-md">
      {/* Left: Profile + Search */}
      <div className="flex items-center gap-4">
        {/* Profile Circle */}
        <Link
          to="/profile/me"
          className="w-10 h-10 flex items-center justify-center rounded-full bg-[#32a86d] text-white text-sm font-semibold hover:opacity-90 transition overflow-hidden relative"
        >
          {hasValidProfilePic ? (
            <img
              src={getImageUrl(user.profilePicUrl)}
              alt="Profile"
              className="w-full h-full object-cover"
              onError={(e) => {
                // Hide the broken image and show default initials
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <DefaultProfileImage 
            username={user?.username} 
            style={{ display: hasValidProfilePic ? 'none' : 'flex' }}
          />
        </Link>

        {/* Search Button */}
        <Link to="/search">
          <button className="bg-white text-[#32a86d] font-semibold px-4 py-2 rounded hover:bg-gray-200 hover:border hover:border-[#32a86d] hover:rounded-lg transition">
            Search
          </button>
        </Link>

        {/* Create Post Button - Only show for authenticated users */}
        {isAuthenticated && (
          <Link to="/create-post">
            <button className="bg-[#32a86d] text-white font-semibold px-4 py-2 rounded hover:bg-[#2c915d] transition">
              Create Post
            </button>
          </Link>
        )}

        {/* Admin Panel Link */}
        {isAdmin && (
          <Link to="/admin">
            <button className="bg-white border-2 border-[#32a86d] text-[#32a86d] font-semibold px-4 py-2 rounded hover:bg-[#32a86d] hover:text-white transition ml-2">
              Admin Panel
            </button>
          </Link>
        )}

        {/* Inbox Link */}
        <Link to="/inbox" className="relative ml-4">
          <span className="material-icons">inbox</span>
          {notifCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">{notifCount}</span>
          )}
        </Link>
      </div>

      {/* Center: Logo */}
      <div className="text-2xl font-bold cursor-pointer">
        <Link to="/dashboard" className="text-[#32a86d] hover:opacity-80 transition">
          {/* <img
          src="/images/logo.png"
          alt="Logo"
        className="h-10 w-40 object-contain" 
          /> */}
          {!isAdmin ? "Social Portfolio" : "WELCOME NAVEEN"}
        </Link>
      </div>

      {/* Right: Login/Register or Logout */}
      <div className="flex gap-4 items-center">
        {isAuthenticated ? (
          <>
            <button
              onClick={handleLogout}
              className="bg-white text-[#32a86d] font-semibold px-4 py-2 rounded hover:bg-gray-200 hover:border hover:border-[#32a86d] hover:rounded-lg transition"
            >
              LogOut
            </button>
          </>
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



