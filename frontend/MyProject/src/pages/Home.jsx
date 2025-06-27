import { Navigate } from 'react-router-dom';

function Home() {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" />;
  return <Navigate to="/dashboard" />;
}

export default Home;