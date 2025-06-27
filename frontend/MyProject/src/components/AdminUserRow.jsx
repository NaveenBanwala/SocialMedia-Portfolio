import React from 'react';

const AdminUserRow = ({ user, onDelete }) => (
    <tr>
    <td className="border p-2">{user.username}</td>
    <td className="border p-2">{user.email}</td>
    <td className="border p-2">
        <button onClick={() => onDelete(user.id)} className="text-red-500 hover:underline">Delete</button>
    </td>
    </tr>
);

export default AdminUserRow;