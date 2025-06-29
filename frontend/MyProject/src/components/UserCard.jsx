const UserCard = ({ user }) => {
  // Helper function to construct full image URL
  const getImageUrl = (imagePath) =>{
    if (!imagePath) return '/default-profile.png';
    if (imagePath.startsWith('http')) return imagePath;

    // Use the new image serving endpoint
    if (imagePath.startsWith('/images/')){
      return `http://localhost:8080/api/files${imagePath.substring(7)}`;
    }
    return `http://localhost:8080${imagePath}`;
  };

  return (
    <div className="border rounded-xl p-4 shadow-md bg-white">
      <img 
        src={getImageUrl(user.profilePic || user.profilePicUrl)} 
        alt="Profile" 
        className="w-16 h-16 rounded-full object-cover"
        onError={(e) => {
          e.target.src = '/default-profile.png';
        }}
      />
      <h3 className="mt-2 font-semibold">{user.username}</h3>
      <p className="text-gray-500">{user.email}</p>
    </div>
  );
};

export default UserCard;