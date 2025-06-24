import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../Api/api.jsx';

const Profile = () => {
  const { id } = useParams(); // 'me' or user id
        const navigate = useNavigate();
        const [user, setUser] = useState(null);
        const [isOwnProfile, setIsOwnProfile] = useState(false);

        useEffect(() => {
    const fetchProfile = async () => {
        try {
        const res = id === 'me'
            ? await api.get('/users/me')
            : await api.get(`/users/${id}`);
        setUser(res.data);
        setIsOwnProfile(id === 'me');
        } catch (err) {
        console.error('Error loading profile:', err);
        navigate('/login');
        }
    };

    fetchProfile();
        }, [id, navigate]);

    if (!user) return <div className="p-6">Loading...</div>;

    return (
    <div className="p-8 min-h-screen bg-gray-100">
        <div className="bg-white shadow rounded p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-6 mb-6">
            <img
            src={user.profilePicUrl || '/default-profile.png'}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover border-2 border-[#32a86d]"
            />
            <div>
            <h1 className="text-2xl font-bold text-[#32a86d]">{user.name}</h1>
            <p className="text-sm text-gray-600">{user.email}</p>
            <p className="text-sm text-gray-600">{user.location}</p>
            {user.resumeUrl && (
            <a
                href={user.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
            >
                View Resume
            </a>
            )}
            </div>
            {isOwnProfile && (
            <button
                onClick={() => navigate('/edit-profile')}
                className="ml-auto bg-[#32a86d] text-white px-4 py-2 rounded hover:bg-[#2c915d]"
            >
                Edit Profile
            </button>
            )}
        </div>

        {/* Bio */}
        <p className="mb-4 text-gray-800">{user.bio}</p>

        {/* Skills */}
        <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2 text-[#32a86d]">Skills</h2>
            <div className="flex flex-wrap gap-2">
            {user.skills.map((skill, i) => (
                    <span key={i} className="bg-[#32a86d] text-white px-3 py-1 rounded text-sm">
                {skill}
                </span>
            ))}
            </div>
        </div>

        {/* Projects */}
        <div>
            <h2 className="text-lg font-semibold mb-2 text-[#32a86d]">Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {user.projects.map((project) => (
                <div key={project.id} className="bg-gray-50 p-4 rounded shadow">
                <img
                    src={project.imageUrl}
                    alt={project.title}
                    className="w-full h-40 object-cover rounded mb-2"
                />
                <h3 className="text-lg font-bold text-[#32a86d]">{project.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{project.description}</p>
                <button
                    onClick={() => navigate(`/project/${project.id}`)}
                    className="text-sm bg-[#32a86d] text-white px-3 py-1 rounded hover:bg-[#2c915d]"
                >
                    View Project
                </button>
                </div>
            ))}
            </div>
        </div>
        </div>
    </div>
    );
};

export default Profile;
