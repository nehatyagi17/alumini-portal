import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaUser, 
  FaEdit, 
  FaEnvelope, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaClock,
  FaUserGraduate,
  FaComments,
  FaBell,
  FaExclamationTriangle,
  FaCheck,
  FaTimes
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { alumniAPI } from '../services/api';
import toast from 'react-hot-toast';

const AlumniDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [requests, setRequests] = useState([]);
  const [connections, setConnections] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [profileRes, requestsRes, connectionsRes, unreadRes] = await Promise.all([
        alumniAPI.getProfile(),
        alumniAPI.getInteractionRequests(),
        alumniAPI.getAcceptedConnections(),
        alumniAPI.getUnreadCount()
      ]);

      setProfile(profileRes.data);
      setRequests(requestsRes.data);
      setConnections(connectionsRes.data);
      setUnreadCount(unreadRes.data.unreadCount);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAction = async (requestId, action) => {
    try {
      await alumniAPI.respondToRequest(requestId, action);
      toast.success(`Request ${action} successfully`);
      fetchDashboardData();
    } catch (error) {
      console.error(`Failed to ${action} request:`, error);
      toast.error(`Failed to ${action} request`);
    }
  };

  const getVerificationStatus = () => {
    if (!profile) return { status: 'unknown', message: 'Loading...', color: 'gray' };
    
    if (profile.profile_type === 'static') {
      return { 
        status: 'static', 
        message: 'Static Profile - Not Claimed', 
        color: 'yellow' 
      };
    }
    
    if (profile.profile_type === 'claimed' && !profile.is_verified) {
      return { 
        status: 'pending', 
        message: 'Pending Admin Verification', 
        color: 'orange' 
      };
    }
    
    if (profile.profile_type === 'claimed' && profile.is_verified) {
      return { 
        status: 'verified', 
        message: 'Verified Alumni Profile', 
        color: 'green' 
      };
    }
    
    return { status: 'unknown', message: 'Unknown Status', color: 'gray' };
  };

  const StatusBadge = ({ status, message, color }) => {
    const colorClasses = {
      green: 'bg-green-100 text-green-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      orange: 'bg-orange-100 text-orange-800',
      gray: 'bg-gray-100 text-gray-800'
    };

    const iconMap = {
      verified: <FaCheckCircle className="w-4 h-4" />,
      pending: <FaClock className="w-4 h-4" />,
      static: <FaExclamationTriangle className="w-4 h-4" />,
      unknown: <FaUser className="w-4 h-4" />
    };

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colorClasses[color]}`}>
        {iconMap[status]}
        <span className="ml-2">{message}</span>
      </span>
    );
  };

  const StatCard = ({ icon, title, value, color, subtitle }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white rounded-lg shadow-lg p-6"
    >
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${color}`}>
          {icon}
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </motion.div>
  );

  const TabButton = ({ id, label, active, onClick, badge }) => (
    <button
      onClick={() => onClick(id)}
      className={`relative px-6 py-3 text-sm font-medium rounded-lg transition-colors ${
        active
          ? 'bg-blue-600 text-white'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      {label}
      {badge > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {badge}
        </span>
      )}
    </button>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const verificationStatus = getVerificationStatus();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Alumni Dashboard</h1>
                <p className="text-gray-600">Welcome back, {user?.name}</p>
              </div>
              <div className="flex items-center space-x-4">
                <StatusBadge {...verificationStatus} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
            <TabButton
              id="overview"
              label="Overview"
              active={activeTab === 'overview'}
              onClick={setActiveTab}
            />
            <TabButton
              id="requests"
              label="Connection Requests"
              active={activeTab === 'requests'}
              onClick={setActiveTab}
              badge={requests.filter(r => r.status === 'pending').length}
            />
            <TabButton
              id="connections"
              label="My Connections"
              active={activeTab === 'connections'}
              onClick={setActiveTab}
            />
            <TabButton
              id="messages"
              label="Messages"
              active={activeTab === 'messages'}
              onClick={setActiveTab}
              badge={unreadCount}
            />
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            {/* Profile Status */}
            <div className="mb-8">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Profile Status</h3>
                    <p className="text-gray-600 mt-1">
                      {verificationStatus.status === 'static' && 
                        "Your profile is currently static. Contact your institution to claim it."}
                      {verificationStatus.status === 'pending' && 
                        "Your profile claim is being reviewed by administrators."}
                      {verificationStatus.status === 'verified' && 
                        "Your profile is verified and you can update your information."}
                    </p>
                  </div>
                  <StatusBadge {...verificationStatus} />
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatCard
                icon={<FaEnvelope className="w-6 h-6 text-white" />}
                title="Pending Requests"
                value={requests.filter(r => r.status === 'pending').length}
                color="bg-yellow-600"
              />
              <StatCard
                icon={<FaUserGraduate className="w-6 h-6 text-white" />}
                title="Connected Students"
                value={connections.length}
                color="bg-green-600"
              />
              <StatCard
                icon={<FaComments className="w-6 h-6 text-white" />}
                title="Unread Messages"
                value={unreadCount}
                color="bg-blue-600"
              />
            </div>

            {/* Profile Summary */}
            {profile && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Academic Information</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p><span className="font-medium">Course:</span> {profile.course || 'Not specified'}</p>
                      <p><span className="font-medium">Department:</span> {profile.department || 'Not specified'}</p>
                      <p><span className="font-medium">Batch:</span> {profile.batch || 'Not specified'}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Professional Information</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p><span className="font-medium">Company:</span> {profile.company || 'Not specified'}</p>
                      <p><span className="font-medium">Position:</span> {profile.position || 'Not specified'}</p>
                      <p><span className="font-medium">Domain:</span> {profile.domain || 'Not specified'}</p>
                      <p><span className="font-medium">Experience:</span> {profile.experience ? `${profile.experience} years` : 'Not specified'}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <FaEdit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Connection Requests Tab */}
        {activeTab === 'requests' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-white rounded-lg shadow-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Connection Requests</h3>
                <p className="text-sm text-gray-600">Review requests from students who want to connect with you</p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Course & Year
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Request Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {requests.map((request) => (
                      <tr key={request.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{request.student_name}</div>
                            <div className="text-sm text-gray-500">{request.student_email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{request.student_course}</div>
                          <div className="text-sm text-gray-500">Year {request.year_of_study}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(request.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            request.status === 'accepted' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          {request.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleRequestAction(request.id, 'accepted')}
                                className="text-green-600 hover:text-green-900 flex items-center"
                              >
                                <FaCheck className="w-4 h-4 mr-1" />
                                Accept
                              </button>
                              <button
                                onClick={() => handleRequestAction(request.id, 'rejected')}
                                className="text-red-600 hover:text-red-900 flex items-center"
                              >
                                <FaTimes className="w-4 h-4 mr-1" />
                                Reject
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {requests.length === 0 && (
                  <div className="text-center py-12">
                    <FaEnvelope className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No connection requests</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Students will be able to send you connection requests once your profile is verified.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Connections Tab */}
        {activeTab === 'connections' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-white rounded-lg shadow-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">My Connections</h3>
                <p className="text-sm text-gray-600">Students you've connected with</p>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {connections.map((connection) => (
                    <div key={connection.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold">
                            {connection.student_name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{connection.student_name}</h4>
                          <p className="text-sm text-gray-500">{connection.student_course}</p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 mb-3">
                        <p>Year {connection.year_of_study}</p>
                        <p>Connected: {new Date(connection.created_at).toLocaleDateString()}</p>
                      </div>
                      <button
                        onClick={() => setActiveTab('messages')}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        Send Message
                      </button>
                    </div>
                  ))}
                </div>
                
                {connections.length === 0 && (
                  <div className="text-center py-12">
                    <FaUserGraduate className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No connections yet</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Accept connection requests from students to start networking.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Messages</h3>
              <div className="text-center py-12">
                <FaComments className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Messaging System</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Chat functionality will be implemented in the Chat page.
                </p>
                <button
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={() => window.location.href = '/chat'}
                >
                  Go to Chat
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AlumniDashboard;
