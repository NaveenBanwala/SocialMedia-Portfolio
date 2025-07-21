import React, { useState } from 'react';

const ProjectCard = ({ project, onDelete }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    return (
    <div className="shadow-[0_8px_48px_0_rgba(50,168,109,0.45)] rounded-2xl p-4 relative">
      <button
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl focus:outline-none"
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
              if (onDelete) onDelete(project.id);
            }}
          >
            Delete Post
          </button>
        </div>
      )}
      <h2 className="text-xl font-semibold text-[#32a86d]">{project.title}</h2>
      <p className="text-gray-700 mt-2">{project.description}</p>
    </div>
    );
};

export default ProjectCard;