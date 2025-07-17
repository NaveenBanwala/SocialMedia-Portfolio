import { useEffect, useState } from 'react';
import api from '../Api/api.jsx';
import { useAuth } from '../Api/AuthContext.jsx';

function AdminResponsePage() {
  const { user } = useAuth();
  const [adminReply, setAdminReply] = useState('');
  const [loading, setLoading] = useState(true);
  const [noReply, setNoReply] = useState(false);

  useEffect(() => {
    const fetchLatest = async () => {
      setLoading(true);
      try {
        let res;
        if (user && user.id) {
          res = await api.get(`/support?userId=${user.id}`);
        }
        const messages = res?.data || [];
        const latest = messages.length > 0 ? messages[messages.length - 1] : null;
        if (latest && latest.adminReply) {
          setAdminReply(latest.adminReply);
          setNoReply(false);
        } else {
          setNoReply(true);
        }
      } catch {
        setNoReply(true);
      } finally {
        setLoading(false);
      }
    };
    fetchLatest();
  }, [user]);

  return (
    <div className="flex min-h-screen max-w-full bg-gray-100 justify-center items-start py-10">
      <div className="bg-white shadow rounded p-8 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-[#32a86d] mb-2">Admin Response</h1>
        {loading ? (
          <div>Loading...</div>
        ) : adminReply ? (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            <b>Admin Reply:</b> {adminReply}
          </div>
        ) : noReply ? (
          <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
            No admin response yet.
          </div>
        ) : null}
      </div>
    </div>
  );
}
export default AdminResponsePage; 