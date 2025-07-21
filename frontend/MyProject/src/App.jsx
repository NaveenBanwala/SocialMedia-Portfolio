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
import Support from './pages/Support.jsx';
import ManageAccount from './pages/ManageAccount.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminChatInterface from './pages/AdminChatInterface.jsx';
import AdminResponsePage from './pages/AdminResponsePage.jsx';
import { useEffect, useState } from 'react';
import { ChatModalContext } from './contexts/ChatModalContext.jsx';
import VotingContest from './pages/VotingContest.jsx';
import VotingApplyPage from './pages/VotingApplyPage.jsx';
import AdminCreateContest from './pages/AdminCreateContest.jsx';

const AppRoutes = () => {
    const { isAuthenticated } = useAuth();
    const [dark, setDark] = useState(() => {
        const saved = localStorage.getItem('darkMode');
        return saved ? JSON.parse(saved) : false;
    });

    useEffect(() => {
        if (dark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('darkMode', JSON.stringify(dark));
    }, [dark]);

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
            path="/voting-contest"
            element={isAuthenticated ? <VotingContest /> : <Navigate to="/login" />}
        />
        <Route
            path="/voting-contest/apply"
            element={isAuthenticated ? <VotingApplyPage /> : <Navigate to="/login" />}
        />
        <Route
            path="/admin/create-contest"
            element={isAuthenticated ? <AdminCreateContest /> : <Navigate to="/login" />}
        />

        <Route
        path="/manage-friends"
        element={isAuthenticated ? <ManageFriendsPage /> : <Navigate to="/login"/>}
        ></Route>

        <Route path="/support"
            element={isAuthenticated ?<Support/> : <Navigate to="/login" />}
        ></Route>

        <Route path="/admin-response" element={<AdminResponsePage />} />

        <Route  path="/messages"
            element={isAuthenticated ? <AdminChatInterface /> : <Navigate to="/login" />}
    >
    </Route>


        <Route path="/manage-account" element={<ProtectedRoute><ManageAccount /></ProtectedRoute>} />

        <Route path="*" element={<h1>404 Not Found</h1>} />
        </Routes>
        {/* Floating dark mode toggle button */}
        <button
            onClick={() => setDark((d) => !d)}
            className="fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg bg-white dark:bg-gray-800 text-2xl border border-gray-300 dark:border-gray-700 transition-colors"
            aria-label="Toggle dark mode"
            style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)' }}
        >
            {dark ? '🌙' : '☀️'}
        </button>
        </>
    );
};

function App() {
    const [showChat, setShowChat] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    return (
    <ChatModalContext.Provider value={{ showChat, setShowChat, selectedUser, setSelectedUser }}>
        <AuthProvider>
        <div className="min-h-screen bg-white shadow-[0_8px_48px_0_rgba(50,168,109,0.45)]">
          <AppRoutes />
        </div>
        </AuthProvider>
    </ChatModalContext.Provider>
    );
}

export default App;

