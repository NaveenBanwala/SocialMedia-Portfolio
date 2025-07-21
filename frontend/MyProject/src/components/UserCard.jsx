import { useAuth } from '../Api/AuthContext.jsx';
import api from '../Api/api.jsx';
import { useState, useEffect } from 'react';

const UserCard = ({ user }) => {
  const { user: currentUser } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [profileLiked, setProfileLiked] = useState(false);
  const [profileLikeCount, setProfileLikeCount] = useState(0);
  const [friendStatus, setFriendStatus] = useState(null);
  const [friendLoading, setFriendLoading] = useState(false);
  const [imgError, setImgError] = useState(false); // Track image load error

  useEffect(() => {
    const fetchFollowers = async () => {
      try {
        const res = await api.get(`/users/${user.id}/followers`);
        setFollowers(res.data);
        setFollowersCount(res.data.length);
        if (currentUser) {
          setIsFollowing(res.data.some(f => f.id === currentUser.id));
        }
      } catch (err) {
        setFollowers([]);
        setFollowersCount(0);
      }
    };
    const fetchFollowing = async () => {
      try {
        const res = await api.get(`/users/${user.id}/following`);
        setFollowing(res.data);
      } catch (err) {
        setFollowing([]);
      }
    };
    // Fetch profile like count and status
    const fetchProfileLike = async () => {
      if (!user.id || !currentUser) return;
      try {
        const countRes = await api.get(`/likes/profile/${user.id}/count`);
        setProfileLikeCount(countRes.data);
        const statusRes = await api.get(`/likes/profile/${user.id}/status?likedById=${currentUser.id}`);
        setProfileLiked(statusRes.data.liked);
      } catch (err) {
        setProfileLikeCount(0);
        setProfileLiked(false);
      }
    };
    // Fetch friend status in both directions
    const fetchFriendStatus = async () => {
      if (!user.id || !currentUser || user.id === currentUser.id) return;
      try {
        // 1. Current user -> card user
        const res1 = await api.get(`/users/${user.id}/friend-request/status`);
        // 2. Card user -> current user
        const res2 = await api.get(`/users/${currentUser.id}/friend-request/status`, { params: { otherUserId: user.id } });
        const status1 = res1.data ? res1.data.status : null;
        const status2 = res2.data ? res2.data.status : null;
        if (status1 === 'ACCEPTED' || status2 === 'ACCEPTED') {
          setFriendStatus('ACCEPTED');
        } else if (status1 === 'PENDING' || status2 === 'PENDING') {
          setFriendStatus('PENDING');
        } else {
          setFriendStatus(null);
        }
      } catch (err) {
        setFriendStatus(null);
      }
    };
    if (user.id) {
      fetchFollowers();
      fetchFollowing();
      fetchProfileLike();
      fetchFriendStatus();
    }
  }, [user.id, currentUser]);

  const handleFollow = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      if (!isFollowing) {
        await api.post(`/users/${user.id}/follow?followerId=${currentUser.id}`);
        setIsFollowing(true);
        setFollowersCount(followersCount + 1);
      } else {
        await api.post(`/users/${user.id}/unfollow?followerId=${currentUser.id}`);
        setIsFollowing(false);
        setFollowersCount(followersCount - 1);
      }
    } catch (err) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleProfileLike = async () => {
    if (!currentUser) return;
    try {
      if (!profileLiked) {
        await api.post(`/likes/profile/${user.id}?likedById=${currentUser.id}`);
        setProfileLiked(true);
        setProfileLikeCount(profileLikeCount + 1);
      } else {
        await api.post(`/likes/profile/${user.id}/unlike?likedById=${currentUser.id}`);
        setProfileLiked(false);
        setProfileLikeCount(profileLikeCount - 1);
      }
    } catch (err) {}
  };

  const handleFriend = async () => {
    if (!currentUser || user.id === currentUser.id) return;
    setFriendLoading(true);
    try {
      if (friendStatus === 'ACCEPTED') {
        if (window.confirm('Are you sure you want to unfriend this user?')) {
          await api.post(`/users/${user.id}/unfriend`, { userId: currentUser.id });
          setFriendStatus(null);
        }
      } else if (!friendStatus) {
        await api.post(`/users/${user.id}/friend-request`);
        setFriendStatus('PENDING');
      }
    } catch (err) {}
    setFriendLoading(false);
  };

  // Helper function to construct full image URL
  const getImageUrl = (imagePath) =>{
    if (!imagePath) return '/default-profile.png';
    if (imagePath.startsWith('http')) return imagePath;

    // Use the new image serving endpoint
    if (imagePath.startsWith('/images/')){
      return `http://localhost:8080/api/files${imagePath.substring(7)}`;
    }
    return `http://localhost:8080${imagePath}`;
  };

  return (
    <div className="border rounded-xl p-4 shadow-md bg-white">
      {user.profilePicUrl && getImageUrl(user.profilePicUrl) && !imgError ? (
        <img 
          src={getImageUrl(user.profilePicUrl)} 
          alt="Profile" 
          className="w-16 h-16 rounded-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <DefaultProfileImage username={user.username} />
      )}
      <h3 className="mt-2 font-semibold">{user.username}</h3>
      <p className="text-gray-500">{user.email}</p>
      <div className="flex items-center gap-2 mt-2">
        <span className="text-xs text-gray-600 cursor-pointer" onClick={() => setShowFollowers(true)}>
          Followers: <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">{user.followersCount ?? 0}</span>
        </span>
        <span className="text-xs text-gray-600 cursor-pointer" onClick={() => setShowFollowing(true)}>
          Following: <span className="inline-block bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-semibold">{user.followingCount ?? 0}</span>
        </span>
        {/* Profile like button and count */}
        {currentUser && user.id !== currentUser.id && (
          <button
            onClick={handleProfileLike}
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border-2 transition ${profileLiked ? 'bg-pink-100 text-pink-600 border-pink-300' : 'bg-white text-pink-600 border-pink-300 hover:bg-pink-50'}`}
          >
            {profileLiked ? '❤️' : '🤍'} {profileLikeCount}
          </button>
        )}
        {/* Friend/Unfriend button */}
        {currentUser && user.id !== currentUser.id && (
          <button
            onClick={handleFriend}
            disabled={friendLoading}
            className={`px-3 py-1 rounded-full text-xs font-medium border-2 transition ${friendStatus === 'ACCEPTED' ? 'bg-green-200 text-green-700 border-green-300' : friendStatus === 'PENDING' ? 'bg-gray-200 text-gray-600 border-gray-300' : 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600'}`}
          >
            {friendStatus === 'ACCEPTED' ? 'Friends' : friendStatus === 'PENDING' ? 'Pending' : 'Add Friend'}
          </button>
        )}
      </div>
      {showFollowers && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow max-w-xs w-full">
            <h3 className="font-bold mb-2">Followers</h3>
            <ul className="max-h-40 overflow-y-auto">
              {followers.length === 0 ? <li className="text-gray-500">No followers</li> : followers.map(f => <li key={f.id}>{f.username}</li>)}
            </ul>
            <button className="mt-3 px-4 py-1 bg-[#32a86d] text-white rounded" onClick={() => setShowFollowers(false)}>Close</button>
          </div>
        </div>
      )}
      {showFollowing && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow max-w-xs w-full">
            <h3 className="font-bold mb-2">Following</h3>
            <ul className="max-h-40 overflow-y-auto">
              {following.length === 0 ? <li className="text-gray-500">Not following anyone</li> : following.map(f => <li key={f.id}>{f.username}</li>)}
            </ul>
            <button className="mt-3 px-4 py-1 bg-[#32a86d] text-white rounded" onClick={() => setShowFollowing(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserCard;