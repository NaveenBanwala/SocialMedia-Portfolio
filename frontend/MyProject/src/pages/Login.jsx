import { useState, useEffect } from 'react';
import { useNavigate, Navigate, useLocation } from 'react-router-dom';
import api from '../Api/api';
import { useAuth } from '../Api/AuthContext.jsx';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, login } = useAuth();

    // Redirect if already authenticated
    if (isAuthenticated) {
        return <Navigate to="/dashboard" />;
    }

    useEffect(() => {
        setEmail('');
        setPassword('');
    }, [location]);

    const handleLogin = async (e) => {
    e.preventDefault();
    try {
        const res = await api.post('/auth/login', { email, password });
        login(res.data.token); // Use context login
        setEmail(''); // Clear input
        setPassword(''); // Clear input
        navigate('/dashboard');
    } catch (err) {
        console.error('Login error:', err.response?.data || err.message); 
        alert('Invalid credentials');
    }
    };
    

    return (
    <div className="flex justify-center items-center min-h-screen bg-[#32a86d]">
        <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-[#32a86d]">Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
            <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-2 border rounded focus:outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            />
            <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2 border rounded focus:outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            />
            <button
            type="submit"
            className="w-full bg-[#32a86d] text-white py-2 rounded font-semibold hover:bg-[#2c915d] transition"
            >
            Login
            </button>
        </form>
        </div>
    </div>
    );
};

export default Login;
