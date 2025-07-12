

import { useNavigate } from 'react-router-dom';

function ManageFriends() {


    const navigate = useNavigate();

    const handleManageFriends = () => {
        navigate('/manage-friends');
    };

    return (
        <div className="sidebar-item">
            <button
                onClick={handleManageFriends}
                className="block hover:bg-gray-700 px-3 py-2 rounded"
            >
                Manage Friends
            </button>
        </div>
    );
}

export default ManageFriends;