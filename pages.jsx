// Pages (Main Route-Level Views) -- With Tailwind & Comments

// RegisterPage.jsx
// import React, { useState } from 'react';

// const RegisterPage = () => {
//   const [form, setForm] = useState({ username: '', email: '', password: '' });

//   const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     // Call API to register
//   };

//   return (
//     <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
//       <h2 className="text-2xl font-bold mb-4 text-[#32a86d]">Register</h2>
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <input name="username" placeholder="Username" onChange={handleChange} className="w-full border p-2 rounded" />
//         <input name="email" placeholder="Email" type="email" onChange={handleChange} className="w-full border p-2 rounded" />
//         <input name="password" placeholder="Password" type="password" onChange={handleChange} className="w-full border p-2 rounded" />
//         <button type="submit" className="bg-[#32a86d] text-white px-4 py-2 rounded">Register</button>
//       </form>
//     </div>
//   );
// };

// export default RegisterPage;

// LoginPage.jsx
// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';

// const LoginPage = () => {
//   const [form, setForm] = useState({ email: '', password: '' });
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     // Call login API and store token
//     navigate('/dashboard');
//   };

//   return (
//     <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
//       <h2 className="text-2xl font-bold mb-4 text-[#32a86d]">Login</h2>
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <input name="email" placeholder="Email" type="email" onChange={e => setForm({ ...form, email: e.target.value })} className="w-full border p-2 rounded" />
//         <input name="password" placeholder="Password" type="password" onChange={e => setForm({ ...form, password: e.target.value })} className="w-full border p-2 rounded" />
//         <button type="submit" className="bg-[#32a86d] text-white px-4 py-2 rounded">Login</button>
//       </form>
//     </div>
//   );
// };

// export default LoginPage;

// DashboardPage.jsx
// import React from 'react';

// const DashboardPage = () => (
//   <div className="p-6">
//     <h1 className="text-2xl font-bold mb-4">Your Dashboard</h1>
//     {/* Render stats, posts, resume download, etc. */}
//   </div>
// );

// export default DashboardPage;

// PublicProfilePage.jsx
// import React from 'react';
// import { useParams } from 'react-router-dom';

// const PublicProfilePage = () => {
//   const { id } = useParams();
//   // Fetch user by id
//   return (
//     <div className="p-6">
//       <h2 className="text-xl font-semibold">Public Profile of User #{id}</h2>
//     </div>
//   );
// };

// export default PublicProfilePage;

// ProjectDetailsPage.jsx
// import React from 'react';
// import { useParams } from 'react-router-dom';

// const ProjectDetailsPage = () => {
//   const { projectId } = useParams();
//   // Fetch project by ID
//   return (
//     <div className="p-6">
//       <h2 className="text-xl font-bold">Project #{projectId}</h2>
//     </div>
//   );
// };

// export default ProjectDetailsPage;

// AdminPanel.jsx
// import React from 'react';
// import AdminUserRow from '../components/AdminUserRow';
// import AdminProjectRow from '../components/AdminProjectRow';

// const AdminPanel = () => {
//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold text-[#32a86d]">Admin Panel</h1>
//       {/* Render admin tables */}
//     </div>
//   );
// };

// export default AdminPanel;

// AllUsersPage.jsx
// import React from 'react';

// const AllUsersPage = () => (
//   <div className="p-6">
//     <h2 className="text-xl font-bold">All Registered Users</h2>
//     {/* List all users with UserCard */}
//   </div>
// );

// export default AllUsersPage;

// AllProjectsPage.jsx
// import React from 'react';

// const AllProjectsPage = () => (
//   <div className="p-6">
//     <h2 className="text-xl font-bold">All Projects</h2>
//     {/* List all projects with ProjectCard */}
//   </div>
// );

// export default AllProjectsPage;

// AddProjectPage.jsx
// import React from 'react';
// import ProjectImageUploader from '../components/ProjectImageUploader';

// const AddProjectPage = () => (
//   <div className="p-6 max-w-xl mx-auto">
//     <h2 className="text-xl font-bold mb-4">Add New Project</h2>
//     {/* Project form here */}
//     <ProjectImageUploader onUpload={(files) => console.log(files)} />
//   </div>
// );

// export default AddProjectPage;

// PostManagementPage.jsx
// import React from 'react';

// const PostManagementPage = () => (
//   <div className="p-6">
//     <h2 className="text-xl font-bold">Manage Your Posts</h2>
//     {/* List user posts with PostCard */}
//   </div>
// );

// export default PostManagementPage;

// SearchUsersPage.jsx
// import React, { useState } from 'react';

// const SearchUsersPage = () => {
//   const [query, setQuery] = useState('');
//   return (
//     <div className="p-6">
//       <input
//         value={query}
//         onChange={(e) => setQuery(e.target.value)}
//         placeholder="Search users..."
//         className="border p-2 rounded w-full mb-4"
//       />
//       {/* Render filtered users here */}
//     </div>
//   );
// };

// export default SearchUsersPage;
