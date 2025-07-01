import api from '../Api/api.jsx';
import { useEffect, useState } from 'react';

const AdminProjectRow = ({ project, onDelete }) => {
  const [likeCount, setLikeCount] = useState(0);
  useEffect(() => {
    const fetchLikeCount = async () => {
      try {
        const res = await api.get(`/likes/project/${project.id}/count`);
        setLikeCount(res.data);
      } catch (err) {
        setLikeCount(0);
      }
    };
    if (project.id) fetchLikeCount();
  }, [project.id]);
  return (
    <tr>
      <td className="border p-2">{project.title}</td>
      <td className="border p-2">{project.ownerEmail}</td>
      <td className="border p-2 text-center">
        <span className="inline-block bg-pink-100 text-pink-800 px-2 py-1 rounded text-xs font-semibold">{likeCount}</span>
      </td>
      <td className="border p-2">
        <button onClick={() => onDelete(project.id)} className="text-red-500 hover:underline">Delete</button>
      </td>
    </tr>
  );
};

export default AdminProjectRow;