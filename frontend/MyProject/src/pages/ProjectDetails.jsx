import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../Api/api';

const ProjectDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Helper function to construct full image URL
    const getImageUrl = (imagePath) => {
        if (!imagePath) return '/default-project.png';
        if (imagePath.startsWith('http')) return imagePath;
        // Use the new image serving endpoint
        if (imagePath.startsWith('/images/')) {
            return `http://localhost:8080/api/files${imagePath.substring(7)}`;
        }
        return `http://localhost:8080${imagePath}`;
    };

    useEffect(() => {
        const fetchProject = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/projects/${id}`);
                setProject(res.data);
                console.log('Fetched project:', res.data);
            } catch (err) {
                console.error('Failed to fetch project:', err);
                setError('Failed to load project details');
            } finally {
                setLoading(false);
            }
        };

        fetchProject();
    }, [id]);

    if (loading) return <div className="p-6">Loading project details...</div>;
    if (error) return <div className="p-6 text-red-600">{error}</div>;
    if (!project) return <div className="p-6">Project not found</div>;

    // Split image URLs if they are comma-separated
    const imageUrls = project.imageUrl ? project.imageUrl.split(',').map(url => url.trim()) : [];

    return (
        <div className="p-8 bg-gray-100 min-h-screen">
            <div className="bg-white rounded shadow p-6 max-w-4xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="mb-4 text-[#32a86d] hover:underline flex items-center gap-2"
                >
                    ← Back
                </button>

                {/* Project Images */}
                {imageUrls.length > 0 && (
                    <div className="mb-6">
                        {imageUrls.length === 1 ? (
                            <img
                                src={getImageUrl(imageUrls[0])}
                                alt={project.title}
                                className="w-full h-64 object-cover rounded mb-4"
                                onError={(e) => {
                                    e.target.src = '/default-project.png';
                                }}
                            />
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                {imageUrls.map((imageUrl, index) => (
                                    <img
                                        key={index}
                                        src={getImageUrl(imageUrl)}
                                        alt={`${project.title} - Image ${index + 1}`}
                                        className="w-full h-48 object-cover rounded"
                                        onError={(e) => {
                                            e.target.src = '/default-project.png';
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Title & Description */}
                <h1 className="text-3xl font-bold text-[#32a86d] mb-4">{project.title}</h1>
                <p className="text-gray-700 mb-6 text-lg leading-relaxed">{project.description}</p>

                {/* Project Stats */}
                <div className="flex items-center gap-6 mb-6 p-4 bg-gray-50 rounded">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-[#32a86d]">{project.likeCount || 0}</div>
                        <div className="text-sm text-gray-600">Likes</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-[#32a86d]">{imageUrls.length}</div>
                        <div className="text-sm text-gray-600">Images</div>
                    </div>
                </div>

                {/* Author Info */}
                <div className="mt-6 p-4 bg-gray-50 rounded">
                    <h3 className="text-lg font-semibold text-[#32a86d] mb-2">Project Details</h3>
                    <div className="text-sm text-gray-600">
                        <p>
                            <strong>Created by:</strong>{' '}
                            <Link
                                to={`/profile/${project.user?.id || project.owner?.id}`}
                                className="text-[#32a86d] hover:underline"
                            >
                                {project.user?.username || project.owner?.name || 'Unknown'}
                            </Link>
                        </p>
                        {project.user?.resumeUrl || project.owner?.resumeUrl ? (
                            <p className="mt-2">
                                <strong>Resume:</strong>{' '}
                                <a
                                    href={project.user?.resumeUrl || project.owner?.resumeUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                >
                                    View Resume
                                </a>
                            </p>
                        ) : null}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex gap-4">
                    <button className="bg-[#32a86d] text-white px-6 py-2 rounded hover:bg-[#2c915d] transition">
                        Like Project
                    </button>
                    <button
                        onClick={() => navigate(-1)}
                        className="bg-gray-200 text-gray-700 px-6 py-2 rounded hover:bg-gray-300 transition"
                    >
                        Back to Profile
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProjectDetails;
