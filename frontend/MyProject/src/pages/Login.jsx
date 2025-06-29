import { useState, useEffect } from 'react';
import { useNavigate, Navigate, useLocation } from 'react-router-dom';
import api from '../Api/api';
import { useAuth } from '../Api/AuthContext.jsx';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
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
        setError('');
    }, [location]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await api.post('/auth/login', { email, password });
            
            if (res.data && res.data.token) {
                login(res.data.token);
                setEmail('');
                setPassword('');
                navigate('/dashboard');
            } else {
                setError('Invalid response from server - no token received');
            }
        } catch (err) {
            if (err.response) {
                if (err.response.status === 401) {
                    setError('Invalid email or password. Please check your credentials and try again.');
                } else if (err.response.status === 500) {
                    setError('Server error. Please try again later.');
                } else {
                    setError(`Login failed: ${err.response.data || err.response.statusText}`);
                }
            } else if (err.request) {
                setError('Network error. Please check your connection and try again.');
            } else {
                setError(`Login failed: ${err.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-[#32a86d]">
            <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-[#32a86d]">Login</h2>
                
                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleLogin} className="space-y-4" autoComplete="on">
                    <input
                        type="email"
                        name="email"
                        id="email"
                        placeholder="Email"
                        className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#32a86d]"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                        autoComplete="email"
                    />
                    <input
                        type="password"
                        name="password"
                        id="password"
                        placeholder="Password"
                        className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#32a86d]"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                        autoComplete="current-password"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#32a86d] text-white py-2 rounded font-semibold hover:bg-[#2c915d] transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
                
                <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600">
                        Don't have an account?{' '}
                        <button
                            onClick={() => navigate('/register')}
                            className="text-[#32a86d] hover:underline"
                        >
                            Register here
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
