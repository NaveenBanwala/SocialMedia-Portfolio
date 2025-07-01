import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../Api/api.jsx';
import { useAuth } from '../Api/AuthContext.jsx';

const ProjectDetailsPage = () => {
    const { projectId } = useParams();
    const { user: currentUser } = useAuth();
    const [project, setProject] = useState(null);
    const [likeCount, setLikeCount] = useState(0);
    const [liked, setLiked] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const res = await api.get(`/projects/${projectId}`);
                setProject(res.data);
            } catch (err) {
                setProject(null);
            }
        };
        const fetchLike = async () => {
            try {
                const countRes = await api.get(`/projects/${projectId}/likes`);
                setLikeCount(countRes.data.likeCount);
                if (currentUser) {
                    const statusRes = await api.get(`/projects/${projectId}/like-status`, { headers: { Authorization: localStorage.getItem('token') } });
                    setLiked(statusRes.data.liked);
                }
            } catch (err) {
                setLikeCount(0);
                setLiked(false);
            }
        };
        fetchProject();
        fetchLike();
    }, [projectId, currentUser]);

    const handleLike = async () => {
        console.log('Like button clicked', { currentUser, liked, loading });
        if (!currentUser) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            if (!liked) {
                await api.post(`/projects/${projectId}/like`, {}, { headers });
                setLiked(true);
                setLikeCount(likeCount + 1);
            } else {
                await api.post(`/projects/${projectId}/unlike`, {}, { headers });
                setLiked(false);
                setLikeCount(likeCount - 1);
            }
        } catch (err) {
            console.error('Error in handleLike:', err);
        }
        setLoading(false);
    };

    if (!project) return <div className="p-6">Project not found.</div>;

    return (
        <div className="p-6">
            <h2 className="text-xl font-bold mb-2">{project.title}</h2>
            <div className="text-gray-500 mb-2">Created by: <span className="font-semibold">{project.username}</span></div>
            <p className="mb-4 text-gray-700">{project.description}</p>
            <div className="flex items-center gap-3 mb-4">
                <button
                    onClick={handleLike}
                    disabled={loading}
                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border-2 transition ${liked ? 'bg-pink-100 text-pink-600 border-pink-300' : 'bg-white text-pink-600 border-pink-300 hover:bg-pink-50'} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {liked ? '❤️' : '🤍'} {likeCount}
                </button>
            </div>
            {/* Add more project details here if needed */}
        </div>
    );
};

export default ProjectDetailsPage;