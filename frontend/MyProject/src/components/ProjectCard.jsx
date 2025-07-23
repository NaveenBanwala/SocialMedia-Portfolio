import React, { useState } from 'react';
import { useAuth } from '../Api/AuthContext.jsx';

const ProjectCard = ({ project, onDelete }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const { user: currentUser } = useAuth();
    const isOwner = currentUser && project.userId === currentUser.id;

    // Helper to get the correct image URL (unified with ProjectDetails)
    const getImageUrl = (url) => {
      if (!url) return '/default-project.png';
      if (url.startsWith('http')) return url;
      if (url.startsWith('/images/')) {
        return `http://localhost:8080/api/files${url.substring(7)}`;
      }
      return `http://localhost:8080${url.startsWith('/') ? url : '/uploads/projects/' + url}`;
    };

    // Get like count from project.likeCount, project.likes, or 0
    const likeCount = project.likeCount !== undefined ? project.likeCount : (project.likes !== undefined ? project.likes : 0);

    return (
    <div className="shadow-[0_8px_48px_0_rgba(50,168,109,0.45)] rounded-3xl border-2 border-[#32a86d] p-6 relative bg-white">
      {isOwner && (
        <>
          <button
            className="absolute top-2 right-2 text-gray-800 hover:text-black text-3xl font-bold focus:outline-none"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="More options"
          >
            &#x22EE;
          </button>
          {menuOpen && (
            <div className="absolute top-10 right-2 bg-white border rounded shadow z-10">
              <button
                className="block px-4 py-2 text-red-600 hover:bg-red-50 w-full text-left"
                onClick={() => {
                  setMenuOpen(false);
                  if (window.confirm('Are you sure you want to delete this project?')) {
                    if (onDelete) onDelete(project.id);
                  }
                }}
              >
                Delete Project
              </button>
            </div>
          )}
        </>
      )}
      <img
        src={getImageUrl(project.imageUrl)}
        alt={project.title}
        className="w-full h-40 object-cover rounded mb-2"
        onError={(e) => {
          if (!e.target.src.includes('default-project.png')) {
            e.target.src = '/default-project.png';
          }
        }}
      />
      <h2 className="text-xl font-semibold text-[#32a86d]">{project.title}</h2>
      <p className="text-gray-700 mt-2">{project.description}</p>
      <div className="flex items-center gap-2 mt-2">
        <span className="text-xs text-pink-600 font-semibold">
          ❤️ {likeCount}
        </span>
      </div>
      <button
        onClick={() => window.location.href = `/project/${project.id}`}
        className="text-sm bg-[#32a86d] text-white px-3 py-1 rounded hover:bg-[#2c915d] mt-2"
      >
        View Project
      </button>
    </div>
    );
};

export default ProjectCard;