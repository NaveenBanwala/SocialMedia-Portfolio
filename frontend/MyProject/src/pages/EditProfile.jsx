import React, { useState, useEffect } from 'react';
import api from '../Api/api.jsx';
import { useNavigate } from 'react-router-dom';

const EditProfile = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({
    location: '',
    bio: '',
    skills: '',
    });
    const [profilePic, setProfilePic] = useState(null);
    const [resume, setResume] = useState(null);

    useEffect(() => {
    api.get('/users/me').then((res) => {
        const { location, bio, skills } = res.data;
        setForm({
        location: location || '',
        bio: bio || '',
        skills: skills ? skills.join(', ') : '',
        });
    });
    }, []);

    const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('location', form.location);
    formData.append('bio', form.bio);
    formData.append('skills', form.skills); // comma-separated
    if (profilePic) formData.append('profilePic', profilePic);
    if (resume) formData.append('resume', resume);

    await api.put('/users/update', formData);
    navigate('/profile/me');
    };

    return (
    <div className="p-8 max-w-2xl mx-auto bg-white shadow rounded mt-10">
        <h2 className="text-2xl font-bold text-[#32a86d] mb-4">Edit Your Profile</h2>
        <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
        <input
            type="text"
            placeholder="Location"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="w-full px-4 py-2 border rounded"
        />
        <textarea
            placeholder="Your Bio"
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            className="w-full px-4 py-2 border rounded"
        />
        <input
            type="text"
            placeholder="Skills (comma separated)"
            value={form.skills}
            onChange={(e) => setForm({ ...form, skills: e.target.value })}
            className="w-full px-4 py-2 border rounded"
        />
        <div>
            <label className="block mb-1 font-medium">Profile Picture</label>
            <input type="file" onChange={(e) => setProfilePic(e.target.files[0])} />
        </div>
        <div>
            <label className="block mb-1 font-medium">Resume PDF</label>
            <input type="file" accept=".pdf" onChange={(e) => setResume(e.target.files[0])} />
        </div>
        <button
            type="submit"
            className="bg-[#32a86d] text-white px-6 py-2 rounded hover:bg-[#2c915d]"
        >
            Save Profile
        </button>
        </form>
    </div>
    );
};

export default EditProfile;
