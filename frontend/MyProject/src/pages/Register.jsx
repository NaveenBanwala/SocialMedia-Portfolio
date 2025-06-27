import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../Api/api'; 

const Register = () => {
  const [formData, setFormData] = useState({
    username: '', 
    email: '',
    password: '',
  });

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setFormData({ username: '', email: '', password: '' });
  }, [location]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // Register the user
      await api.post('/auth/register', formData);
      // Redirect to login page after successful registration
      navigate('/login');
    } catch (err) {
      // Better error message
      if (err.response?.data === 'Email already exists') {
        alert('This email is already registered.');
      } else {
        alert('Registration failed. Please try again.');
        console.error(err);
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#32a86d]">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-[#32a86d]">Register</h2>
        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="text"
            name="username"
            placeholder="Username"
            className="w-full px-4 py-2 border rounded focus:outline-none"
            value={formData.username}
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

