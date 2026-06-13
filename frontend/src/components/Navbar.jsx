import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaGraduationCap,
  FaBars,
  FaTimes,
  FaUser,
  FaCog,
  FaSignOutAlt,
  FaBell,
  FaHome,
  FaTachometerAlt,
  FaComments,
  FaFileCsv,
  FaUserTie,
  FaUserGraduate,
  FaShieldAlt
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, isStudent, isAlumni, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (isAdmin()) return '/admin/dashboard';
    if (isStudent()) return '/student/dashboard';
    if (isAlumni()) return '/alumni/dashboard';
    return '/dashboard';
  };

  const getDashboardIcon = () => {
    if (isAdmin()) return <FaShieldAlt className="w-5 h-5" />;
    if (isStudent()) return <FaUserGraduate className="w-5 h-5" />;
    if (isAlumni()) return <FaUserTie className="w-5 h-5" />;
    return <FaTachometerAlt className="w-5 h-5" />;
  };

  const NavLink = ({ to, children, icon, onClick }) => {
    const isActive = location.pathname === to;
    
    return (
      <Link
        to={to}
        onClick={onClick}
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          isActive
            ? 'bg-blue-100 text-blue-700'
            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
        }`}
      >
        {icon}
        <span>{children}</span>
      </Link>
    );
  };

  const UserMenu = () => (
    <AnimatePresence>
      {showUserMenu && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50 border border-gray-200"
        >
          <div className="px-4 py-2 border-b border-gray-200">
            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
          
          <div className="py-1">
            <NavLink
              to="/profile"
              icon={<FaUser className="w-4 h-4" />}
              onClick={() => setShowUserMenu(false)}
            >
              Profile
            </NavLink>
            
            {isAdmin() && (
              <NavLink
                to="/admin/dashboard"
                icon={<FaFileCsv className="w-4 h-4" />}
                onClick={() => setShowUserMenu(false)}
              >
                Admin Panel
              </NavLink>
            )}
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <FaSignOutAlt className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (!isAuthenticated()) {
    return null; // Don't show navbar for unauthenticated users
  }

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <FaGraduationCap className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Alumni Portal</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <NavLink to="/" icon={<FaHome className="w-5 h-5" />}>
              Home
            </NavLink>
            
            <NavLink to={getDashboardLink()} icon={getDashboardIcon()}>
              Dashboard
            </NavLink>
            
            <NavLink to="/chat" icon={<FaComments className="w-5 h-5" />}>
              Messages
            </NavLink>
            
            {/* Role-specific links */}
            {isStudent() && (
              <NavLink to="/student/directory" icon={<FaUserTie className="w-5 h-5" />}>
                Alumni Directory
              </NavLink>
            )}
            
            {isAdmin() && (
              <NavLink to="/admin/claims" icon={<FaBell className="w-5 h-5" />}>
                Pending Claims
              </NavLink>
            )}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700">{user?.name}</span>
              </button>
              <UserMenu />
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            >
              {isOpen ? <FaTimes className="w-6 h-6" /> : <FaBars className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-200 py-4"
            >
              <div className="space-y-2">
                <NavLink to="/" icon={<FaHome className="w-5 h-5" />} onClick={() => setIsOpen(false)}>
                  Home
                </NavLink>
                
                <NavLink to={getDashboardLink()} icon={getDashboardIcon()} onClick={() => setIsOpen(false)}>
                  Dashboard
                </NavLink>
                
                <NavLink to="/chat" icon={<FaComments className="w-5 h-5" />} onClick={() => setIsOpen(false)}>
                  Messages
                </NavLink>
                
                {isStudent() && (
                  <NavLink to="/student/directory" icon={<FaUserTie className="w-5 h-5" />} onClick={() => setIsOpen(false)}>
                    Alumni Directory
                  </NavLink>
                )}
                
                {isAdmin() && (
                  <NavLink to="/admin/claims" icon={<FaBell className="w-5 h-5" />} onClick={() => setIsOpen(false)}>
                    Pending Claims
                  </NavLink>
                )}
                
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <NavLink to="/profile" icon={<FaUser className="w-5 h-5" />} onClick={() => setIsOpen(false)}>
                    Profile
                  </NavLink>
                  
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <FaSignOutAlt className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;
