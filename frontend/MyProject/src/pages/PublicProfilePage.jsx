import React from 'react';
import { useParams } from 'react-router-dom';

const PublicProfilePage = () => {
    const { id } = useParams();
  // Fetch user by id
    return (
    <div className="p-6">
        <h2 className="text-xl font-semibold">Public Profile of User #{id}</h2>
    </div>
    );
};

export default PublicProfilePage;