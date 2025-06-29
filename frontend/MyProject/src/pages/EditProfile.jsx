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
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await api.get('/users/me');
                const userData = res.data;
                
                // Ensure we have a proper user ID
                if (!userData.id || isNaN(Number(userData.id))) {
                    // Try to resolve the user ID by searching
                    if (userData.email) {
                        const searchRes = await api.get(`/search?name=${encodeURIComponent(userData.email)}`);
                        const foundUser = Array.isArray(searchRes.data) 
                            ? searchRes.data.find(u => u.email === userData.email)
                            : null;
                        if (foundUser && foundUser.id) {
                            userData.id = foundUser.id;
                        }
                    }
                }
                
                setUser(userData);
                setForm({
                    location: userData.location || '',
                    bio: userData.bio || '',
                    skills: userData.skills ? userData.skills.join(', ') : '',
                });
                console.log('Loaded user data:', userData);
            } catch (err) {
                console.error('Error fetching user:', err);
                setError('Failed to load user data');
            }
        };
        
        fetchUser();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (!user || !user.id) {
                throw new Error('User ID not found. Please try refreshing the page.');
            }

            console.log('Starting profile update for user ID:', user.id);

            // First upload profile image if selected
            if (profilePic) {
                console.log('Uploading profile image...');
                const formData = new FormData();
                formData.append('file', profilePic);
                
                const uploadRes = await api.post(`/users/${user.id}/upload`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                console.log('Image upload response:', uploadRes.data);
            }

            // Then update profile data
            const profileData = {
                location: form.location,
                bio: form.bio,
                skills: form.skills.split(',').map(s => s.trim()).filter(s => s),
            };

            console.log('Updating profile data:', profileData);
            await api.put(`/${user.id}`, profileData);
            
            console.log('Profile updated successfully');
            navigate('/profile/me');
        } catch (error) {
            console.error('Error updating profile:', error);
            setError('Failed to update profile: ' + (error.response?.data || error.message));
        } finally {
            setLoading(false);
        }
    };

    if (error) {
        return (
            <div className="p-8 max-w-2xl mx-auto bg-white shadow rounded mt-10">
                <div className="text-red-600 mb-4">{error}</div>
                <button 
                    onClick={() => window.location.reload()} 
                    className="bg-[#32a86d] text-white px-4 py-2 rounded"
                >
                    Refresh Page
                </button>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="p-8 max-w-2xl mx-auto bg-white shadow rounded mt-10">
                <div>Loading user data...</div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-2xl mx-auto bg-white shadow rounded mt-10">
            <h2 className="text-2xl font-bold text-[#32a86d] mb-4">Edit Your Profile</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block mb-1 font-medium">Username</label>
                    <input
                        type="text"
                        value={user.username || ''}
                        disabled
                        className="w-full px-4 py-2 border rounded bg-gray-100"
                    />
                    <p className="text-sm text-gray-500">Username cannot be changed</p>
                </div>
                
                <div>
                    <label className="block mb-1 font-medium">Location</label>
                    <input
                        type="text"
                        placeholder="Your location"
                        value={form.location}
                        onChange={(e) => setForm({ ...form, location: e.target.value })}
                        className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#32a86d]"
                    />
                </div>
                
                <div>
                    <label className="block mb-1 font-medium">Bio</label>
                    <textarea
                        placeholder="Tell us about yourself"
                        value={form.bio}
                        onChange={(e) => setForm({ ...form, bio: e.target.value })}
                        rows="4"
                        className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#32a86d]"
                    />
                </div>
                
                <div>
                    <label className="block mb-1 font-medium">Skills</label>
                    <input
                        type="text"
                        placeholder="JavaScript, React, Spring Boot (comma separated)"
                        value={form.skills}
                        onChange={(e) => setForm({ ...form, skills: e.target.value })}
                        className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#32a86d]"
                    />
                    <p className="text-sm text-gray-500">Separate skills with commas</p>
                </div>
                
                <div>
                    <label className="block mb-1 font-medium">Profile Picture</label>
                    <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => setProfilePic(e.target.files[0])}
                        className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#32a86d]"
                    />
                    <p className="text-sm text-gray-500 mt-1">Upload a new profile picture from your device</p>
                    {profilePic && (
                        <p className="text-sm text-green-600 mt-1">
                            Selected: {profilePic.name} ({(profilePic.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                    )}
                </div>
                
                <div>
                    <label className="block mb-1 font-medium">Resume PDF</label>
                    <input 
                        type="file" 
                        accept=".pdf"
                        onChange={(e) => setResume(e.target.files[0])}
                        className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#32a86d]"
                    />
                    <p className="text-sm text-gray-500 mt-1">Upload your resume PDF file</p>
                </div>
                
                <div className="flex gap-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-[#32a86d] text-white px-6 py-2 rounded hover:bg-[#2c915d] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Saving...' : 'Save Profile'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/profile/me')}
                        className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditProfile;
