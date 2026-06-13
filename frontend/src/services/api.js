import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// Request interceptor to attach token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        const { response } = error;
        
        if (response) {
            const { status, data } = response;
            
            switch (status) {
                case 401:
                    // Token expired or invalid
                    if (data.message?.includes('token')) {
                        localStorage.removeItem('token');
                        window.location.href = '/login';
                        toast.error('Session expired. Please login again.');
                    }
                    break;
                case 403:
                    toast.error('Access denied. You don\'t have permission for this action.');
                    break;
                case 404:
                    toast.error('Resource not found.');
                    break;
                case 429:
                    toast.error('Too many requests. Please try again later.');
                    break;
                case 500:
                    toast.error('Server error. Please try again later.');
                    break;
                default:
                    if (data.message) {
                        toast.error(data.message);
                    }
            }
        } else if (error.code === 'ECONNABORTED') {
            toast.error('Request timeout. Please check your connection.');
        } else if (error.message === 'Network Error') {
            toast.error('Network error. Please check your connection.');
        }
        
        return Promise.reject(error);
    }
);

// API service methods
export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    registerStudent: (data) => api.post('/auth/register/student', data),
    registerAdmin: (data) => api.post('/auth/register/admin', data),
    claimProfile: (data) => api.post('/auth/claim-profile', data),
    getProfile: () => api.get('/auth/profile'),
    updateProfile: (data) => api.put('/auth/profile', data),
};

export const adminAPI = {
    uploadCSV: (formData) => api.post('/admin/upload-csv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    getPendingClaims: () => api.get('/admin/claims'),
    approveOrRejectClaim: (alumniId, action) => api.post(`/admin/claims/${alumniId}`, { action }),
    getDashboardStats: () => api.get('/admin/dashboard/stats'),
    getUploadHistory: (params) => api.get('/admin/upload-history', { params }),
    getAllUsers: (params) => api.get('/admin/users', { params }),
    getStaleProfiles: (params) => api.get('/admin/stale-profiles', { params }),
};

export const alumniAPI = {
    getProfile: () => api.get('/alumni/profile'),
    updateProfile: (data) => api.put('/alumni/profile', data),
    getInteractionRequests: () => api.get('/alumni/requests'),
    respondToRequest: (requestId, status) => api.put(`/alumni/requests/${requestId}`, { status }),
    getAcceptedConnections: () => api.get('/alumni/connections'),
    getConversations: () => api.get('/alumni/conversations'),
    getConversation: (userId, params) => api.get(`/alumni/conversations/${userId}`, { params }),
    sendMessage: (data) => api.post('/alumni/messages', data),
    getUnreadCount: () => api.get('/alumni/messages/unread-count'),
};

export const studentAPI = {
    getProfile: () => api.get('/student/profile'),
    updateProfile: (data) => api.put('/student/profile', data),
    getAlumniDirectory: (params) => api.get('/student/directory', { params }),
    sendInteractionRequest: (alumniId) => api.post(`/student/request/${alumniId}`),
    getMyRequests: () => api.get('/student/requests'),
    getAcceptedConnections: () => api.get('/student/connections'),
    getConversations: () => api.get('/student/conversations'),
    getConversation: (userId, params) => api.get(`/student/conversations/${userId}`, { params }),
    sendMessage: (data) => api.post('/student/messages', data),
    getUnreadCount: () => api.get('/student/messages/unread-count'),
};

export const messageAPI = {
    getConversations: () => api.get('/messages/conversations'),
    getConversation: (otherUserId, params) => api.get(`/messages/conversations/${otherUserId}`, { params }),
    sendMessage: (data) => api.post('/messages', data),
    markAsRead: (messageId) => api.put(`/messages/${messageId}/read`),
    markConversationAsRead: (otherUserId) => api.put(`/messages/conversations/${otherUserId}/read`),
    getUnreadCount: () => api.get('/messages/unread-count'),
    deleteMessage: (messageId) => api.delete(`/messages/${messageId}`),
    deleteConversation: (otherUserId) => api.delete(`/messages/conversations/${otherUserId}`),
};

export default api;