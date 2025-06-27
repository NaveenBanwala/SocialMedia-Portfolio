import React, { useState } from 'react';

const ProfileEditor = ({ currentProfile, onSave }) => {
    const [bio, setBio] = useState(currentProfile.bio);
    const [location, setLocation] = useState(currentProfile.location);

    const handleSave = () => {
    onSave({ bio, location });
    };

    return (
    <div className="p-4">
        <textarea
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        className="w-full border p-2 rounded"
        placeholder="Your bio"
        />
        <input
        type="text"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        className="w-full mt-2 border p-2 rounded"
        placeholder="Location"
        />
        <button onClick={handleSave} className="mt-3 bg-[#32a86d] text-white px-4 py-2 rounded">
        Save
        </button>
    </div>
    );
};

export default ProfileEditor;