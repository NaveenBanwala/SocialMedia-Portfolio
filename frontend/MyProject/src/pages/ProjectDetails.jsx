import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../Api/api';

const ProjectDetails = () => {
    const { id } = useParams();
    const [project, setProject] = useState(null);

    useEffect(() => {
    const fetchProject = async () => {
        try {
        const res = await api.get(`/projects/${id}`);
        setProject(res.data);
        } catch (err) {
        console.error('Failed to fetch project:', err);
        }
    };

    fetchProject();
    }, [id]);

    if (!project) return <div className="p-6">Loading...</div>;

    return (
    <div className="p-8 bg-gray-100 min-h-screen">
        <div className="bg-white rounded shadow p-6 max-w-4xl mx-auto">
        {/* Project Image */}
        <img
            src={project.imageUrl}
            alt={project.title}
            className="w-full h-64 object-cover rounded mb-4"
        />

        {/* Title & Description */}
        <h1 className="text-3xl font-bold text-[#32a86d] mb-2">{project.title}</h1>
        <p className="text-gray-700 mb-4">{project.description}</p>

        {/* Skills Used */}
        <div className="flex flex-wrap gap-2 mb-4">
            {project.skills.map((skill, index) => (
            <span
                key={index}
                className="bg-[#32a86d] text-white px-3 py-1 text-sm rounded"
            >
                {skill}
            </span>
            ))}
        </div>

        {/* Author Info */}
        <div className="mt-4 text-sm text-gray-600">
            <p>
            Created by:{' '}
            <Link
                to={`/profile/${project.owner.id}`}
                className="text-[#32a86d] hover:underline"
            >
                {project.owner.name}
            </Link>
            </p>
        </div>

        {/* Like / Resume */}
        <div className="mt-6 flex gap-4">
            <button className="bg-[#32a86d] text-white px-4 py-2 rounded hover:bg-[#2c915d]">
            Like 
            </button>
            <a
            href={project.owner.resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gray-200 px-4 py-2 rounded text-sm"
            >
            View Resume
            </a>
        </div>
        </div>
    </div>
    );
};

export default ProjectDetails;
