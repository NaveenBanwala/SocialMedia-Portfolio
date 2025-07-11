import React from 'react';

const ProjectImageUploader = ({ onUpload }) => (
    <input
    type="file"
    multiple
    accept="image/*"
    onChange={(e) => {
        const files = [...e.target.files];
        if (files.length > 2) {
            alert('You can upload a maximum of 2 images per project. Only the first 2 will be used.');
            onUpload(files.slice(0, 2));
        } else {
            onUpload(files);
        }
    }}
    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-[#32a86d] file:text-white hover:file:bg-[#278b59]"
    />
);

export default ProjectImageUploader;