import React from 'react';

const ProfilePictureUploader = ({ onChange }) => (
    <input
    type="file"
    accept="image/*"
    onChange={(e) => onChange(e.target.files[0])}
    className="mt-2 block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-[#32a86d] file:text-white hover:file:bg-[#278b59]"
    />
);

export default ProfilePictureUploader;