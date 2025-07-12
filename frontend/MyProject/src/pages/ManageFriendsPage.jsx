import { useState, useEffect } from "react";
import api from '../Api/api.jsx';
import { useAuth } from '../Api/AuthContext.jsx';

function ManageFriendsPage() {
    const { user } = useAuth();

    const [follower, setFollower] = useState([]);
    const [following,setFollowing] = useState([]);


    useEffect(() => {
        const showFollowers = async () => {
            if (user && user.id) {
                try {
                    const response = await api.get(`/users/${user.id}/followers`);
                    setFollower((followers)=>[...followers ,...response.data]); // Assuming response.data is an array of friends
                } catch (error) {
                    console.error("Error fetching friends:", error);
                }
            }
        };

        showFollowers();
    }, [user]);

    useEffect(() => {
        const showFollowing = async () => {

            if (user && user.id) {
                try {
                    const response = await api.get(`/users/${user.id}/following`);
                    setFollowing(prevFriends => [...prevFriends, ...response.data]); // Append following to existing friends
                } catch (error) {
                    console.error("Error fetching following:", error);
                }
            }
        }
    }, [user]);

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Manage Friends</h1>
            {follower && follower.length > 0 ? (
                <ul className="list-disc pl-5">
                    {follower.map((friend, index) => (
                        <li key={friend.id || index} className="mb-2">
                            {friend.name} ({friend.email})
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No friends found.</p>
            )}
        </div>
    );
}

export default ManageFriendsPage;
