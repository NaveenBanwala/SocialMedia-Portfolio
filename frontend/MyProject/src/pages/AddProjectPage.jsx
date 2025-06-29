import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../Api/api.jsx';
import ProjectImageUploader from '../components/ProjectImageUploader.jsx';

const AddProjectPage = () =>{
    const navigate = useNavigate();
    const [form, setForm] = useState({
        title: '',
        description: '',
    });
    const [images, setImages] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Get current user info
        api.get('/users/me').then((res) => {
            setUser(res.data);
        });
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!form.title || !form.description) {
            alert('Please fill in all required fields');
            return;
        }

        if (images.length === 0) {
            alert('Please upload at least one project image');
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('title', form.title);
            formData.append('description', form.description);
            formData.append('userId', user.id);
            
            // Append all images
            images.forEach((image, index) => {
                formData.append('images', image);
            });

            await api.post('/projects/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            alert('Project uploaded successfully!');
            navigate('/profile/me');
        } catch (error) {
            console.error('Error uploading project:', error);
            alert('Failed to upload project. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = (files) => {
        setImages(files);
    };

    const removeImage = (index) => {
        setImages(images.filter((_, i) => i !== index));
    };

    return (
        <div className="p-8 max-w-2xl mx-auto bg-white shadow rounded mt-10">
            <h2 className="text-2xl font-bold text-[#32a86d] mb-6">Add New Project</h2>
            
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
                        Upload images from your device. You can select multiple images.
                    </p>
                </div>

                {/* Preview uploaded images */}
                {images.length > 0 && (
                    <div>
                        <label className="block mb-2 font-medium text-gray-700">Preview Images</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {images.map((image, index) => (
                                <div key={index} className="relative">
                                    <img
                                        src={URL.createObjectURL(image)}
                                        alt={`Preview ${index + 1}`}
                                        className="w-full h-32 object-cover rounded border"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                                    >
                                        ×
                                    </button>
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
                        {loading ? 'Uploading...' : 'Upload Project'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/profile/me')}
                        className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddProjectPage; 