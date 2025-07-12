import { useState } from 'react';

import { useAuth } from '../Api/AuthContext.jsx';
import { Link, useNavigate } from 'react-router-dom';

import ManageFriends from './ManageFriends.jsx';

const SidebarOverlay = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();


        const handleLogout = () => {
        logout();
        navigate('/login');
    }; 

    const [isOpen, setIsOpen] = useState(false);

    const toggleSidebar = () => setIsOpen(!isOpen);

    return (
    <div className="bg-gray-100 h-10">
      {/* Toggle Button */}
        <button
        onClick={toggleSidebar}
        className="m-4 p-2 bg-[#32a86d] text-white rounded hover:bg-[#2c915d] top-0 right-5 fixed z-50 shadow-lg transition-transform duration-300 ease-in-out"
        >
        {isOpen ? 'Close Menu' : 'Open Menu'}
        </button>

      {/* Sidebar Overlay */}
        <div
        className={`fixed top-0 left-0 h-full w-64 bg-gray-800 text-white transform ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out z-50 shadow-2xl`}
        >
        <div className="p-6 space-y-4">
            <h2 className="text-2xl font-bold mb-6">Sidebar</h2>
            <a href="#" className="block hover:bg-gray-700 px-3 py-2 rounded">Home</a>
            <a href="#" className="block hover:bg-gray-700 px-3 py-2 rounded">Profile</a>
            <ManageFriends/>
            <button
                onClick={handleLogout}
                className="bg-white text-[#32a86d] font-semibold px-4 py-2 rounded hover:bg-gray-200 hover:border hover:border-[#32a86d] hover:rounded-lg transition"
            >
                LogOut
            </button> 
        </div>
        </div>

    </div>
    );
};

export default SidebarOverlay;
