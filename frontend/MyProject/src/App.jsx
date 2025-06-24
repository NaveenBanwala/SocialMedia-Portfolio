import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Profile from './pages/Profile.jsx';
import EditProfile from './pages/EditProfile.jsx'; 
import ProjectDetails from './pages/ProjectDetails';
import Navbar from './components/Navbar';
import Search from './pages/Search.jsx';

const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    return !!token;
};

const App = () => {
    return (
        <>
        <Navbar />
        <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route
            path="/login"
            element={!isAuthenticated() ? <Login /> : <Navigate to="/" />}
        />
        <Route
            path="/register"
            element={!isAuthenticated() ? <Register /> : <Navigate to="/" />}
        />

        {/* Protected */}
        <Route
            path="/profile/:id"
            element={isAuthenticated() ? <Profile /> : <Navigate to="/login" />}
        />
        <Route
            path="/edit-profile"
            element={isAuthenticated() ? <EditProfile /> : <Navigate to="/login" />}
        />
        <Route
            path="/search"
            element={isAuthenticated() ? <Search /> : <Navigate to="/login" />}
        />
        <Route
            path="/project/:id"
            element={isAuthenticated() ? <ProjectDetails /> : <Navigate to="/login" />}
        />

        {/* 404 fallback */}
        <Route path="*" element={<h1>404 Not Found</h1>} />
        </Routes>
        </>
    );
};

export default App;

