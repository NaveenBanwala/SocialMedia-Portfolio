import React, { useEffect, useState } from 'react';
import AdminUserRow from '../components/AdminUserRow';
import AdminProjectRow from '../components/AdminProjectRow';
import api from '../Api/api.jsx';

const AdminPanel = () => {
  // State for users and projects
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch users and projects on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, projectRes] = await Promise.all([
          api.get('/admin/users'), // Adjust endpoint if needed
          api.get('/admin/projects'), // Adjust endpoint if needed
        ]);
        setUsers(userRes.data);
        setProjects(projectRes.data);
      } catch (err) {
        setError('Error loading admin data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Handle user delete
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(users.filter(u => u.id !== userId));
    } catch (err) {
      alert('Error deleting user.');
    }
  };

  // Handle project delete
  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await api.delete(`/admin/projects/${projectId}`);
      setProjects(projects.filter(p => p.id !== projectId));
    } catch (err) {
      alert('Error deleting project.');
    }
  };

  if (loading) return <div className="p-6">Loading admin data...</div>;

  return (
    <div className="p-6 min-h-screen bg-white">
      <h1 className="text-2xl font-bold text-[#32a86d] border-b-2 border-[#32a86d] pb-2 mb-6">Admin Panel</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {/* Users Table */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-[#32a86d] mb-2">Users</h2>
        <table className="w-full border-2 border-[#32a86d] rounded-xl bg-white">
          <thead>
            <tr className="bg-[#32a86d] text-white">
              <th className="p-2">Username</th>
              <th className="p-2">Email</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <AdminUserRow key={user.id} user={user} onDelete={handleDeleteUser} />
            ))}
          </tbody>
        </table>
        {users.length === 0 && <div className="text-gray-500 mt-2">No users found.</div>}
      </div>
      {/* Projects Table */}
      <div>
        <h2 className="text-xl font-semibold text-[#32a86d] mb-2">Projects</h2>
        <table className="w-full border-2 border-[#32a86d] rounded-xl bg-white">
          <thead>
            <tr className="bg-[#32a86d] text-white">
              <th className="p-2">Title</th>
              <th className="p-2">Owner Email</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map(project => (
              <AdminProjectRow key={project.id} project={project} onDelete={handleDeleteProject} />
            ))}
          </tbody>
        </table>
        {projects.length === 0 && <div className="text-gray-500 mt-2">No projects found.</div>}
      </div>
    </div>
  );
};

export default AdminPanel;