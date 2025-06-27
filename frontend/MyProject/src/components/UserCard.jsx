const UserCard = ({ user }) => (
  <div className="border rounded-xl p-4 shadow-md bg-white">
    <img src={user.profilePic} alt="Profile" className="w-16 h-16 rounded-full" />
    <h3 className="mt-2 font-semibold">{user.username}</h3>
    <p className="text-gray-500">{user.email}</p>
  </div>
);

export default UserCard;