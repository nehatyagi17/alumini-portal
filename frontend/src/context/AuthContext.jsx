/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState(null);

    const initSocketConnection = (token) => {
        if (socket) socket.disconnect();
        const baseUrl = import.meta.env.VITE_API_BASE_URL.replace('/api', '');
        const newSocket = io(baseUrl, {
            auth: { token }
        });
        setSocket(newSocket);
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                setUser(decodedToken);
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                // Init socket
                initSocketConnection(token);

                // Fetch user profile asynchronously
                fetchUserProfile();
            } catch (error) {
                console.error("Invalid token", error);
                localStorage.removeItem('token');
            }
        }
        setLoading(false);

        return () => {
            if (socket) socket.disconnect();
        };
    }, []);

    const fetchUserProfile = async () => {
        try {
            const response = await api.get('/auth/profile');
            setUserProfile(response.data);
        } catch (error) {
            console.error("Failed to fetch user profile", error);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            const { token, user: userData } = response.data;
            
            localStorage.setItem('token', token);
            const decodedToken = jwtDecode(token);
            
            setUser(decodedToken);
            setUserProfile(userData);
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            initSocketConnection(token);
            
            toast.success('Login successful!');
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Login failed';
            toast.error(message);
            return { success: false, message };
        }
    };

    const registerStudent = async (userData) => {
        try {
            await api.post('/auth/register/student', userData);
            toast.success('Registration successful! Please login.');
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Registration failed';
            toast.error(message);
            return { success: false, message };
        }
    };

    const registerAdmin = async (userData) => {
        try {
            await api.post('/auth/register/admin', userData);
            toast.success('Admin registration successful! Please login.');
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Registration failed';
            toast.error(message);
            return { success: false, message };
        }
    };

    const claimProfile = async (email, password) => {
        try {
            await api.post('/auth/claim-profile', { email, password });
            toast.success('Profile claimed successfully! Please wait for admin verification.');
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Profile claim failed';
            toast.error(message);
            return { success: false, message };
        }
    };

    const updateProfile = async (profileData) => {
        try {
            const response = await api.put('/auth/profile', profileData);
            setUserProfile(response.data.user);
            toast.success('Profile updated successfully!');
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Profile update failed';
            toast.error(message);
            return { success: false, message };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setUserProfile(null);
        delete api.defaults.headers.common['Authorization'];
        if (socket) {
            socket.disconnect();
            setSocket(null);
        }
        toast.success('Logged out successfully');
    };

    const isAuthenticated = () => {
        return !!user && !!localStorage.getItem('token');
    };

    const hasRole = (role) => {
        return user?.role === role;
    };

    const isAdmin = () => {
        return hasRole('admin');
    };

    const isStudent = () => {
        return hasRole('student');
    };

    const isAlumni = () => {
        return hasRole('alumni');
    };

    const isVerifiedAlumni = () => {
        return isAlumni() && userProfile?.alumni?.is_verified;
    };

    const value = {
        user,
        userProfile,
        loading,
        socket,
        login,
        logout,
        registerStudent,
        registerAdmin,
        claimProfile,
        updateProfile,
        fetchUserProfile,
        isAuthenticated,
        hasRole,
        isAdmin,
        isStudent,
        isAlumni,
        isVerifiedAlumni
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = React.useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;