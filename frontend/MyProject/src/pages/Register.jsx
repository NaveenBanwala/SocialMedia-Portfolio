import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
    const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    };

const handleRegister = async (e) => {
    e.preventDefault();
    try {
    await axios.post('/api/auth/register', formData);

    // ✅ Save token (if backend returns it) or just redirect
    const loginRes = await axios.post('/api/auth/login', {
        email: formData.email,
        password: formData.password,
    });
    localStorage.setItem('token', loginRes.data.token);

    // ✅ Redirect to edit profile page
    navigate('/edit-profile');
    } catch (err) {
    alert('Registration failed');
    }
};


    return (
    <div className="flex justify-center items-center min-h-screen bg-[#32a86d]">
        <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-[#32a86d]">Register</h2>
        <form onSubmit={handleRegister} className="space-y-4">
            <input
            type="text"
            name="name"
            placeholder="Full Name"
            className="w-full px-4 py-2 border rounded focus:outline-none"
            value={formData.name}
            onChange={handleChange}
            required
            />
            <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full px-4 py-2 border rounded focus:outline-none"
            value={formData.email}
            onChange={handleChange}
            required
            />
            <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full px-4 py-2 border rounded focus:outline-none"
            value={formData.password}
            onChange={handleChange}
            required
            />
            <button
            type="submit"
            className="w-full bg-[#32a86d] text-white py-2 rounded font-semibold hover:bg-[#2c915d] transition"
            >
            Register
            </button>
        </form>
        </div>
    </div>
    );
};

export default Register;
