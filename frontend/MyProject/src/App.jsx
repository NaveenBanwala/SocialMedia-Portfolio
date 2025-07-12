import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Profile from './pages/Profile.jsx';
import ProjectDetails from './pages/ProjectDetails';
import AddProjectPage from './pages/AddProjectPage.jsx';
import CreatePost from './pages/CreatePost.jsx';
import Navbar from './components/Navbar';
// import Search from './pages/Search.jsx'; // Remove old Search if not needed
import DashboardPage from './pages/DashboardPage.jsx';
import AdminPanel from './pages/AdminPanel.jsx';
import SearchUserPage from './pages/SearchUserPage.jsx';
import Inbox from './pages/Inbox.jsx';
import EditProfile from './pages/EditProfile.jsx';
import EditProjectPage from './pages/EditProjectPage.jsx';
import { AuthProvider, useAuth } from './Api/AuthContext.jsx';
import ManageFriendsPage from './pages/ManageFriendsPage.jsx';

const AppRoutes = () => {
    const { isAuthenticated } = useAuth();
    return (
        <>
        {isAuthenticated ? <Navbar /> : null}
        <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route
            path="/login"
            element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />}
        />
        <Route
            path="/register"
            element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />}
        />

        {/* Protected */}
        <Route
            path="/dashboard"
            element={isAuthenticated ? <DashboardPage /> : <Navigate to="/login" />}
        />
        <Route
            path="/admin"
            element={isAuthenticated ? <AdminPanel /> : <Navigate to="/login" />}
        />
        <Route
            path="/profile/:id"
            element={isAuthenticated ? <Profile /> : <Navigate to="/login" />}
        />
        <Route
            path="/add-project"
            element={isAuthenticated ? <AddProjectPage /> : <Navigate to="/login" />}
        />
        <Route
            path="/create-post"
            element={isAuthenticated ? <CreatePost /> : <Navigate to="/login" />}
        />
        <Route
            path="/search"
            element={isAuthenticated ? <SearchUserPage /> : <Navigate to="/login" />}
        />
        <Route
            path="/project/:id"
            element={isAuthenticated ? <ProjectDetails /> : <Navigate to="/login" />}
        />
        <Route
            path="/inbox"
            element={isAuthenticated ? <Inbox /> : <Navigate to="/login" />}
        />
        <Route
            path="/edit-profile"
            element={isAuthenticated ? <EditProfile /> : <Navigate to="/login" />}
        />
        <Route
            path="/edit-project/:id"
            element={isAuthenticated ? <EditProjectPage /> : <Navigate to="/login" />}
        />

        <Route
        path="/manage-friends"
        element={isAuthenticated ? <ManageFriendsPage /> : <Navigate to="/login"/>}
        ></Route>

        {/* 404 fallback */}
        <Route path="*" element={<h1>404 Not Found</h1>} />
        </Routes>
        </>
    );
};

const App = () => (
    <AuthProvider>
        <AppRoutes />
    </AuthProvider>
);

export default App;

