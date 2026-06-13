import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { FaShieldAlt, FaUserGraduate, FaUserTie } from 'react-icons/fa';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access if roles are specified
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <AccessDenied userRole={user?.role} allowedRoles={allowedRoles} />;
  }

  // Render the protected component
  return children;
};

const AccessDenied = ({ userRole, allowedRoles }) => {
  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <FaShieldAlt className="w-16 h-16 text-purple-600" />;
      case 'student':
        return <FaUserGraduate className="w-16 h-16 text-blue-600" />;
      case 'alumni':
        return <FaUserTie className="w-16 h-16 text-green-600" />;
      default:
        return <FaShieldAlt className="w-16 h-16 text-gray-600" />;
    }
  };

  const getRoleName = (role) => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'student':
        return 'Student';
      case 'alumni':
        return 'Alumni';
      default:
        return 'User';
    }
  };

  const getAllowedRolesText = (roles) => {
    return roles.map(role => getRoleName(role)).join(' or ');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center"
      >
        <div className="mb-6">
          {getRoleIcon(userRole)}
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Access Denied
        </h1>
        
        <p className="text-gray-600 mb-6">
          You don't have permission to access this page.
        </p>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-700 mb-2">
            <strong>Your Role:</strong> {getRoleName(userRole)}
          </p>
          <p className="text-sm text-gray-700">
            <strong>Required Role:</strong> {getAllowedRolesText(allowedRoles)}
          </p>
        </div>
        
        <div className="space-y-3">
          <button
            onClick={() => window.history.back()}
            className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Go Back
          </button>
          
          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ProtectedRoute;
