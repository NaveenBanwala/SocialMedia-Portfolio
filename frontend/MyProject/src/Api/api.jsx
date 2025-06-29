import axios from 'axios';
// Import the api instance

const api = axios.create({
    baseURL: 'http://localhost:8080/api', 
    headers: {
    'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
    },
    (error) => Promise.reject(error)
);
//Handle 401 errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
    if (error.response?.status === 401) {
        console.warn('Unauthorized. Redirecting to login...');
      // You can force logout or redirect if needed
      // localStorage.removeItem('token');
    }
    return Promise.reject(error);
    }
);

// // ================= AUTH =================
// export const login = (data) => api.post('/auth/login', data);
// export const register = (data) => api.post('/auth/register', data);

// // ================= USER =================
// export const getUserProfile = (id) => api.get(`/users/${id}`);
// export const updateUserProfile = (id, data) => api.put(`/${id}`, data);
// export const uploadProfileImage = (id, file) => {
//     const formData = new FormData();
//     formData.append('file', file);
//     return api.post(`/users/${id}/upload`, formData, {
//         headers: { 'Content-Type': 'multipart/form-data' },
//     });
// };
// export const searchUsers = (params) => api.get('/search', { params });

// // ================= POST =================
// export const createPost = (data) => api.post('/posts', data);
// export const getMyPosts = () => api.get('/posts/me');
// export const getAllPosts = () => api.get('/posts/all');
// export const deleteOwnPost = (postId) => api.delete(`/posts/${postId}`);
// export const getUserPosts = (userId) => api.get(`/posts/user/${userId}`);
// // export const likePost = (postId) => api.post(`/posts/${postId}/like`);
// // export const getPostLikes = (postId) => api.get(`/posts/${postId}/likes`);
// export const sendFriendRequest = (userId) => api.post(`/users/${userId}/friend-request`);

// // ================= PROJECT =================
// export const uploadProject = (formData) => api.post('/projects/upload', formData, {
//     headers: { 'Content-Type': 'multipart/form-data' },
// });
// export const getProjectsByUser = (userId) => api.get(`/projects/user/${userId}`);
// export const getProject = (projectId) => api.get(`/projects/${projectId}`);
// export const deleteOwnProject = (projectId) => api.delete(`/projects/${projectId}`);

// // ================= LIKE =================
// export const likeProject = (projectId, userId) => api.post(`/likes/project/${projectId}`, null, { params: { userId } });
// export const likeProfile = (likedUserId, likedById) => api.post(`/likes/profile/${likedUserId}`, null, { params: { likedById } });
// export const getProjectLikeCount = (projectId) => api.get(`/likes/project/${projectId}/count`);
// export const getProfileLikeCount = (userId) => api.get(`/likes/profile/${userId}/count`);

// // ================= ADMIN =================
// export const getAllUsers = () => api.get('/admin/users');
// export const deleteUser = (id) => api.delete(`/admin/users/${id}`);
// export const getAllProjects = () => api.get('/admin/projects');
// export const deleteProject = (id) => api.delete(`/admin/projects/${id}`);
// export const deleteAnyPost = (postId) => api.delete(`/admin/posts/${postId}`);
// export const getAdminData = () => api.get('/admin/data');

// // ================= RESUME =================
// export const downloadResume = (id) => api.get(`/users/${id}/resume`, { responseType: 'blob' });

export default api;