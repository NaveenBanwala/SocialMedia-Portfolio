// Navbar.jsx
// import React from 'react';
// import { Link } from 'react-router-dom';

// const Navbar = () => {
//   return (
//     <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
//       <Link to="/" className="text-2xl font-bold text-[#32a86d]">MyPortfolio</Link>
//       <div className="space-x-4">
//         <Link to="/projects" className="text-gray-700 hover:text-[#32a86d]">Projects</Link>
//         <Link to="/posts" className="text-gray-700 hover:text-[#32a86d]">Posts</Link>
//         <Link to="/profile" className="text-gray-700 hover:text-[#32a86d]">Profile</Link>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;

// Footer.jsx
// import React from 'react';

// const Footer = () => (
//   <footer className="bg-gray-100 text-center py-4 mt-8 text-sm text-gray-500">
//     &copy; 2025 MyPortfolio. All rights reserved.
//   </footer>
// );
// export default Footer;

// ProjectCard.jsx
// import React from 'react';

// const ProjectCard = ({ project }) => {
//   return (
//     <div className="bg-white shadow rounded-2xl p-4">
//       <h2 className="text-xl font-semibold text-[#32a86d]">{project.title}</h2>
//       <p className="text-gray-700 mt-2">{project.description}</p>
//     </div>
//   );
// };

// export default ProjectCard;

// UserCard.jsx
import React from 'react';

// const UserCard = ({ user }) => (
//   <div className="border rounded-xl p-4 shadow-md bg-white">
//     <img src={user.profilePic} alt="Profile" className="w-16 h-16 rounded-full" />
//     <h3 className="mt-2 font-semibold">{user.username}</h3>
//     <p className="text-gray-500">{user.email}</p>
//   </div>
// );

// export default UserCard;

// PostCard.jsx
// import React from 'react';
// import LikeButton from './LikeButton';

// const PostCard = ({ post }) => (
//   <div className="border rounded-xl p-4 shadow bg-white">
//     <p className="text-gray-800">{post.content}</p>
//     {post.image && <img src={post.image} alt="Post" className="mt-2 rounded" />}
//     <LikeButton postId={post.id} />
//   </div>
// );

// export default PostCard;

// LikeButton.jsx
// import React, { useState } from 'react';

// const LikeButton = ({ postId }) => {
//   const [liked, setLiked] = useState(false);

//   const toggleLike = () => {
//     setLiked(!liked);
//     // Make API call here
//   };

//   return (
//     <button
//       onClick={toggleLike}
//       className={`mt-2 px-3 py-1 rounded-full text-sm font-medium ${liked ? 'bg-[#32a86d] text-white' : 'bg-gray-200 text-gray-700'}`}
//     >
//       {liked ? 'Liked' : 'Like'}
//     </button>
//   );
// };

// export default LikeButton;

// ResumeDownload.jsx
// import React from 'react';

// const ResumeDownload = ({ url }) => (
//   <a
//     href={url}
//     download
//     className="bg-[#32a86d] text-white px-4 py-2 rounded shadow hover:bg-[#278b59]"
//   >
//     Download Resume
//   </a>
// );

// export default ResumeDownload;

// ProjectImageUploader.jsx
// import React from 'react';

// const ProjectImageUploader = ({ onUpload }) => (
//   <input
//     type="file"
//     multiple
//     accept="image/*"
//     onChange={(e) => onUpload([...e.target.files])}
//     className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-[#32a86d] file:text-white hover:file:bg-[#278b59]"
//   />
// );

// export default ProjectImageUploader;

// ProfileEditor.jsx
// import React, { useState } from 'react';

// const ProfileEditor = ({ currentProfile, onSave }) => {
//   const [bio, setBio] = useState(currentProfile.bio);
//   const [location, setLocation] = useState(currentProfile.location);

//   const handleSave = () => {
//     onSave({ bio, location });
//   };

//   return (
//     <div className="p-4">
//       <textarea
//         value={bio}
//         onChange={(e) => setBio(e.target.value)}
//         className="w-full border p-2 rounded"
//         placeholder="Your bio"
//       />
//       <input
//         type="text"
//         value={location}
//         onChange={(e) => setLocation(e.target.value)}
//         className="w-full mt-2 border p-2 rounded"
//         placeholder="Location"
//       />
//       <button onClick={handleSave} className="mt-3 bg-[#32a86d] text-white px-4 py-2 rounded">
//         Save
//       </button>
//     </div>
//   );
// };

// export default ProfileEditor;

// ProfilePictureUploader.jsx
// import React from 'react';

// const ProfilePictureUploader = ({ onChange }) => (
//   <input
//     type="file"
//     accept="image/*"
//     onChange={(e) => onChange(e.target.files[0])}
//     className="mt-2 block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-[#32a86d] file:text-white hover:file:bg-[#278b59]"
//   />
// );

// export default ProfilePictureUploader;

// AdminUserRow.jsx
// import React from 'react';

// const AdminUserRow = ({ user, onDelete }) => (
//   <tr>
//     <td className="border p-2">{user.username}</td>
//     <td className="border p-2">{user.email}</td>
//     <td className="border p-2">
//       <button onClick={() => onDelete(user.id)} className="text-red-500 hover:underline">Delete</button>
//     </td>
//   </tr>
// );

// export default AdminUserRow;

// AdminProjectRow.jsx
// import React from 'react';

// const AdminProjectRow = ({ project, onDelete }) => (
//   <tr>
//     <td className="border p-2">{project.title}</td>
//     <td className="border p-2">{project.ownerEmail}</td>
//     <td className="border p-2">
//       <button onClick={() => onDelete(project.id)} className="text-red-500 hover:underline">Delete</button>
//     </td>
//   </tr>
// );

// export default AdminProjectRow;

// ProtectedRoute.jsx
// import React from 'react';
// import { Navigate } from 'react-router-dom';

// const ProtectedRoute = ({ children }) => {
//   const token = localStorage.getItem('token');
//   return token ? children : <Navigate to="/login" />;
// };

// export default ProtectedRoute;
