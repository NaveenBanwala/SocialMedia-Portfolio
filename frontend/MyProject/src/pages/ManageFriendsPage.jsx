import { useState, useEffect } from "react";
import api from '../Api/api.jsx';
import { useAuth } from '../Api/AuthContext.jsx';

function ManageFriendsPage() {
    const { user } = useAuth();

    const [follower, setFollower] = useState([]);
    const [following,setFollowing] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);


    async function removeUnfollow(followedFriendId) {
        try{
            const response = await api.delete(`/users/${followedFriendId}/unfollow`);
            if (response.status === 200) {
                // Remove the unfollowed friend from the following list
                setFollowing(following.filter(friend => friend.id !== followedFriendId));
            }
        }catch (error) {
            console.error("Error unfollowing user:", error);
            setError(`Error unfollowing user: ${error.response?.data || error.message}`);
        }
    }

    async function removeFollower(followerId) {
        try {
            const response = await api.delete(`/users/${followerId}/remove-follower`);
            if (response.status === 200) {
                setFollower(follower.filter(friend => friend.id !== followerId));
            }
        } catch (error) {
            setError(`Error removing follower: ${error.response?.data || error.message}`);
        }
    }


    useEffect(() => {
        const showFollowers = async () => {
            if (user && user.id) {
                setLoading(true);
                setError(null);
                try {
                    const response = await api.get(`/users/${user.id}/followers`);
                    setFollower(response.data);
                } catch (error) {
                    console.error("Error fetching followers:", error);
                    setError(`Error fetching followers: ${error.message}`);
                } finally {
                    setLoading(false);
                }
            } else {
                setError("User not found or not authenticated");
            }
        };

        showFollowers();
    }, [user]);

    useEffect(() => {
        const showFollowing = async () => {
            if (user && user.id) {
                try {
                    // Use the new endpoint to get following with status
                    const response = await api.get(`/users/${user.id}/following-with-status`);
                    setFollowing(response.data);
                } catch (error) {
                    console.error("Error fetching following:", error);
                    setError(`Error fetching following: ${error.message}`);
                }
            }
        };

        showFollowing();
    }, [user]);

    async function cancelFriendRequest(friendId) {
        try {
            const response = await api.delete(`/users/${friendId}/cancel-friend-request`);
            if (response.status === 200) {
                setFollowing(following.filter(friend => friend.id !== friendId));
            }
        } catch (error) {
            setError(`Error cancelling friend request: ${error.response?.data || error.message}`);
        }
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Manage Friends</h1>
            
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}
            
            {loading && (
                <div className="text-center py-4">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-2">Loading...</p>
                </div>
            )}
            

            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Followers Section */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Followers ({follower.length})</h2>
                    {follower && follower.length > 0 ? (
                        <ul className="space-y-2">
                            {follower.map((friend, index) => (
                                <li key={friend.id || index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                                    <div className="flex-1">
                                        <div className="font-medium">{friend.username || friend.name}</div>
                                        <div className="text-sm text-gray-600">{friend.email}</div>
                                    </div>
                                    <button className="bg-red-300 text-white p-2 border-1 ml-4" onClick={() => removeFollower(friend.id)}>Remove</button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500">No followers found.</p>
                    )}
                </div>

                {/* Following Section */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Following ({following.length})</h2>
                    {following && following.length > 0 ? (
                        <ul className="space-y-2">
                            {following.map((friend, index) => (
                                <li key={friend.id || index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                                    <div className="flex-1 space-y-2">
                                        <div className="font-medium">{friend.username || friend.name}</div>
                                        <div className="text-sm text-gray-600">{friend.email}</div>
                                    </div>
                                    {friend.status === "PENDING" ? (
                                        <button className="bg-yellow-400 text-white p-2 border-1" onClick={() => cancelFriendRequest(friend.id)}>
                                            Cancel Request
                                        </button>
                                    ) : (
                                        <button className="bg-red-300 text-white p-2 border-1" onClick={()=>removeUnfollow(friend.id)}>
                                            Unfollow
                                        </button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500">Not following anyone.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ManageFriendsPage;
