import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../Api/api.jsx';
import ProjectImageUploader from '../components/ProjectImageUploader.jsx';

const EditProjectPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        title: '',
        description: '',
    });
    const [images, setImages] = useState([]); // new images
    const [currentImages, setCurrentImages] = useState([]); // existing image URLs
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Get current user info
        api.get('/users/me').then((res) => {
            setUser(res.data);
        });
        // Fetch project info
        const fetchProject = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/projects/${id}`);
                setForm({
                    title: res.data.title || '',
                    description: res.data.description || '',
                });
                setCurrentImages(res.data.imageUrl ? res.data.imageUrl.split(',').map(url => url.trim()) : []);
            } catch (err) {
                setError('Failed to load project data');
            } finally {
                setLoading(false);
            }
        };
        fetchProject();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title || !form.description) {
            alert('Please fill in all required fields');
            return;
        }
        if (images.length === 0 && currentImages.length === 0) {
            alert('Please upload at least one project image');
            return;
        }
        if (images.length > 2) {
            alert('You can upload a maximum of 2 images per project');
            return;
        }
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('title', form.title);
            formData.append('description', form.description);
            // Only send new images; backend will replace all images if any are sent
            images.forEach((image) => {
                formData.append('images', image);
            });
            await api.put(`/projects/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            alert('Project updated successfully!');
            navigate(`/project/${id}`);
        } catch (error) {
            setError('Failed to update project. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = (files) => {
        setImages(files);
    };

    const removeCurrentImage = (index) => {
        // Remove image from preview only; actual removal happens if new images are uploaded
        setCurrentImages(currentImages.filter((_, i) => i !== index));
    };

    return (
        <div className="p-8 max-w-2xl mx-auto bg-white shadow rounded mt-10">
            <h2 className="text-2xl font-bold text-[#32a86d] mb-6">Edit Project</h2>
            {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block mb-2 font-medium text-gray-700">Project Title *</label>
                    <input
                        type="text"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#32a86d]"
                        placeholder="Enter project title"
                        required
                    />
                </div>
                <div>
                    <label className="block mb-2 font-medium text-gray-700">Project Description *</label>
                    <textarea
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#32a86d]"
                        rows={4}
                        placeholder="Describe your project..."
                        required
                    />
                </div>
                <div>
                    <label className="block mb-2 font-medium text-gray-700">Project Images *</label>
                    <ProjectImageUploader onUpload={handleImageUpload} />
                    <p className="text-sm text-gray-500 mt-1">
                        Upload images from your device. You can select up to 2 images. Uploading new images will replace all current images.
                    </p>
                </div>
                {/* Preview current images */}
                {currentImages.length > 0 && (
                    <div>
                        <label className="block mb-2 font-medium text-gray-700">Current Images</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {currentImages.map((url, index) => (
                                <div key={index} className="relative">
                                    <img
                                        src={url.startsWith('http') ? url : `http://localhost:8080${url}`}
                                        alt={`Current ${index + 1}`}
                                        className="w-full h-32 object-cover rounded border"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeCurrentImage(index)}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">To remove all current images, upload new images.</p>
                    </div>
                )}
                {/* Preview new images */}
                {images.length > 0 && (
                    <div>
                        <label className="block mb-2 font-medium text-gray-700">New Images</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {images.map((image, index) => (
                                <div key={index} className="relative">
                                    <img
                                        src={URL.createObjectURL(image)}
                                        alt={`Preview ${index + 1}`}
                                        className="w-full h-32 object-cover rounded border"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                <div className="flex gap-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-[#32a86d] text-white px-6 py-2 rounded hover:bg-[#2c915d] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Saving...' : 'Update Project'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate(`/project/${id}`)}
                        className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditProjectPage; 