import React from 'react';

const ProjectImageUploader = ({ onUpload }) => (
    <input
    type="file"
    multiple
    accept="image/*"
    onChange={(e) => onUpload([...e.target.files])}
    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-[#32a86d] file:text-white hover:file:bg-[#278b59]"
    />
);

export default ProjectImageUploader;