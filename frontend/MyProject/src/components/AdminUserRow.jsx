import React from 'react';

const AdminUserRow = ({ user, onDelete, onUpdateUser, onRemoveProfilePic }) => {
  // Helper function to construct full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
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
  const DefaultProfileImage = ({ username, size = "w-10 h-10" }) => (
    <div className={`${size} rounded-full bg-[#32a86d] flex items-center justify-center text-white text-sm font-bold`}>
      {username ? username.charAt(0).toUpperCase() : 'U'}
    </div>
  );

  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50">
      <td className="border p-2">
        <div className="flex items-center gap-3">
          <div className="relative">
            {hasValidProfilePic(user.profilePicUrl) ? (
              <img
                src={getImageUrl(user.profilePicUrl)}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover border-2 border-[#32a86d]"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            {!hasValidProfilePic(user.profilePicUrl) && (
              <DefaultProfileImage username={user.username || user.name} />
            )}
          </div>
          <div>
            <div className="font-semibold text-[#32a86d]">{user.username || user.name}</div>
            <div className="text-xs text-gray-500">ID: {user.id}</div>
          </div>
        </div>
      </td>
      <td className="border p-2">{user.email}</td>
      <td className="border p-2">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded text-xs font-semibold ${
            user.roles?.includes('ROLE_ADMIN') 
              ? 'bg-red-100 text-red-800' 
              : 'bg-green-100 text-green-800'
          }`}>
            {user.roles?.includes('ROLE_ADMIN') ? 'Admin' : 'User'}
          </span>
        </div>
      </td>
      <td className="border p-2">
        <div className="flex gap-2 flex-wrap">
          <button 
            onClick={() => window.location.href = `/profile/${user.id}`}
            className="text-blue-500 hover:underline text-sm"
          >
            View Profile
          </button>
          {hasValidProfilePic(user.profilePicUrl) && (
            <button 
              onClick={() => onRemoveProfilePic && onRemoveProfilePic(user.id)}
              className="text-orange-500 hover:underline text-sm"
            >
              Remove Pic
            </button>
          )}
          <button 
            onClick={() => onDelete(user.id)} 
            className="text-red-500 hover:underline text-sm"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
};

export default AdminUserRow;