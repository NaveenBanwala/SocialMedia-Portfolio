import React from 'react';

const AdminProjectRow = ({ project, onDelete }) => (
    <tr>
    <td className="border p-2">{project.title}</td>
    <td className="border p-2">{project.ownerEmail}</td>
    <td className="border p-2">
        <button onClick={() => onDelete(project.id)} className="text-red-500 hover:underline">Delete</button>
    </td>
    </tr>
);

export default AdminProjectRow;