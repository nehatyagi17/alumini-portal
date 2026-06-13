import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaSearch, 
  FaFilter, 
  FaUserPlus, 
  FaEnvelope, 
  FaUserGraduate, 
  FaComments,
  FaBell,
  FaBuilding,
  FaMapMarkerAlt,
  FaBriefcase,
  FaCalendarAlt,
  FaEye,
  FaClock,
  FaCheck,
  FaTimes
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { studentAPI } from '../services/api';
import toast from 'react-hot-toast';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [alumni, setAlumni] = useState([]);
  const [requests, setRequests] = useState([]);
  const [connections, setConnections] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('directory');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    batch: '',
    company: '',
    domain: '',
    course: '',
    experience_min: '',
    experience_max: ''
  });
  const [sendingRequest, setSendingRequest] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [alumniRes, requestsRes, connectionsRes, unreadRes] = await Promise.all([
        studentAPI.getAlumniDirectory(),
        studentAPI.getMyRequests(),
        studentAPI.getAcceptedConnections(),
        studentAPI.getUnreadCount()
      ]);

      setAlumni(alumniRes.data);
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

  const handleSearch = async () => {
    setLoading(true);
    try {
      const searchFilters = {
        ...filters,
        search: searchTerm
      };
      
      // Remove empty filters
      Object.keys(searchFilters).forEach(key => {
        if (searchFilters[key] === '') {
          delete searchFilters[key];
        }
      });

      const response = await studentAPI.getAlumniDirectory(searchFilters);
      setAlumni(response.data);
    } catch (error) {
      console.error('Search failed:', error);
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const sendConnectionRequest = async (alumniId) => {
    setSendingRequest(alumniId);
    try {
      await studentAPI.sendInteractionRequest(alumniId);
      toast.success('Connection request sent successfully');
      fetchDashboardData();
    } catch (error) {
      console.error('Failed to send request:', error);
      toast.error('Failed to send connection request');
    } finally {
      setSendingRequest(null);
    }
  };

  const clearFilters = () => {
    setFilters({
      batch: '',
      company: '',
      domain: '',
      course: '',
      experience_min: '',
      experience_max: ''
    });
    setSearchTerm('');
    fetchDashboardData();
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

  const AlumniCard = ({ alumni }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-lg">
              {alumni.name.charAt(0)}
            </span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{alumni.name}</h3>
            <p className="text-sm text-gray-500">
              {alumni.course} • Batch {alumni.batch}
            </p>
          </div>
        </div>
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
          alumni.profile_type === 'static' 
            ? 'bg-yellow-100 text-yellow-800' 
            : 'bg-green-100 text-green-800'
        }`}>
          {alumni.profile_type === 'static' ? 'Static' : 'Verified'}
                </span>
      </div>

      <div className="space-y-3 mb-4">
        {alumni.company && (
          <div className="flex items-center text-sm text-gray-600">
            <FaBuilding className="w-4 h-4 mr-2 text-gray-400" />
            <span>{alumni.company}</span>
            {alumni.position && <span className="ml-2">• {alumni.position}</span>}
          </div>
        )}
        
        {alumni.domain && (
          <div className="flex items-center text-sm text-gray-600">
            <FaBriefcase className="w-4 h-4 mr-2 text-gray-400" />
            <span>{alumni.domain}</span>
            {alumni.experience && <span className="ml-2">• {alumni.experience} years exp</span>}
          </div>
        )}
        
        {alumni.location && (
          <div className="flex items-center text-sm text-gray-600">
            <FaMapMarkerAlt className="w-4 h-4 mr-2 text-gray-400" />
            <span>{alumni.location}</span>
          </div>
        )}
      </div>

      {alumni.bio && alumni.profile_type === 'claimed' && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{alumni.bio}</p>
      )}

      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500">
          Updated: {new Date(alumni.last_updated).toLocaleDateString()}
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('requests')}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            <FaEye className="w-4 h-4" />
          </button>
          
          {alumni.profile_type === 'claimed' && alumni.is_verified && (
            <button
              onClick={() => sendConnectionRequest(alumni.id)}
              disabled={sendingRequest === alumni.id || requests.some(r => r.alumni_id === alumni.id)}
              className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {sendingRequest === alumni.id ? (
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
              ) : (
                <FaUserPlus className="w-3 h-3 mr-1" />
              )}
              {requests.some(r => r.alumni_id === alumni.id) ? 'Requested' : 'Connect'}
                    </button>
                )}
            </div>
        </div>
    </motion.div>
  );

  if (loading && alumni.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

    return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
        <div>
                <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
                <p className="text-gray-600">Welcome back, {user?.name}</p>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">
                  {alumni.length} alumni profiles available
                </span>
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
              id="directory"
              label="Alumni Directory"
              active={activeTab === 'directory'}
              onClick={setActiveTab}
            />
            <TabButton
              id="requests"
              label="My Requests"
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

        {/* Directory Tab */}
        {activeTab === 'directory' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search alumni by name, company, or domain..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <button
                  onClick={handleSearch}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <FaSearch className="w-4 h-4 mr-2" />
                  Search
                </button>
              </div>

              {/* Filters */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                <input
                  type="text"
                  placeholder="Batch Year"
                  value={filters.batch}
                  onChange={(e) => setFilters({ ...filters, batch: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="Company"
                  value={filters.company}
                  onChange={(e) => setFilters({ ...filters, company: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="Domain"
                  value={filters.domain}
                  onChange={(e) => setFilters({ ...filters, domain: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="Course"
                  value={filters.course}
                  onChange={(e) => setFilters({ ...filters, course: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="number"
                  placeholder="Min Experience"
                  value={filters.experience_min}
                  onChange={(e) => setFilters({ ...filters, experience_min: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="number"
                  placeholder="Max Experience"
                  value={filters.experience_max}
                  onChange={(e) => setFilters({ ...filters, experience_max: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="mt-4 flex justify-between">
                <button
                  onClick={clearFilters}
                  className="text-gray-600 hover:text-gray-800 text-sm"
                >
                  Clear Filters
                </button>
                <div className="text-sm text-gray-500">
                  Showing {alumni.length} results
                </div>
              </div>
            </div>

            {/* Alumni Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {alumni.map((alumni) => (
                    <AlumniCard key={alumni.id} alumni={alumni} />
              ))}
            </div>

            {alumni.length === 0 && (
              <div className="text-center py-12">
                <FaUserGraduate className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No alumni found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try adjusting your search criteria or filters.
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* My Requests Tab */}
        {activeTab === 'requests' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-white rounded-lg shadow-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">My Connection Requests</h3>
                <p className="text-sm text-gray-600">Track the status of your connection requests</p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Alumni
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Company & Position
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Request Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {requests.map((request) => (
                      <tr key={request.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{request.alumni_name}</div>
                            <div className="text-sm text-gray-500">{request.alumni_email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{request.company}</div>
                          <div className="text-sm text-gray-500">{request.position}</div>
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
                            {request.status === 'pending' && <FaClock className="w-3 h-3 mr-1" />}
                            {request.status === 'accepted' && <FaCheck className="w-3 h-3 mr-1" />}
                            {request.status === 'rejected' && <FaTimes className="w-3 h-3 mr-1" />}
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </span>
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
                      Send connection requests to alumni to start networking.
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
                <p className="text-sm text-gray-600">Alumni who have accepted your connection requests</p>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {connections.map((connection) => (
                    <div key={connection.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold">
                            {connection.alumni_name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{connection.alumni_name}</h4>
                          <p className="text-sm text-gray-500">{connection.company}</p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 mb-3">
                        <p>{connection.position}</p>
                        <p>Connected: {new Date(connection.created_at).toLocaleDateString()}</p>
                      </div>
                      <button
                        onClick={() => setActiveTab('messages')}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center justify-center"
                      >
                        <FaComments className="w-4 h-4 mr-2" />
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
                      Alumni need to accept your connection requests to start messaging.
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

export default StudentDashboard;