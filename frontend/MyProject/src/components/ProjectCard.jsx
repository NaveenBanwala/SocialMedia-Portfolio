import React from 'react';

const ProjectCard = ({ project }) => {
    return (
    <div className="bg-white shadow rounded-2xl p-4">
        <h2 className="text-xl font-semibold text-[#32a86d]">{project.title}</h2>
        <p className="text-gray-700 mt-2">{project.description}</p>
    </div>
    );
};

export default ProjectCard;