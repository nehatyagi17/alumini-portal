import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaUpload, 
  FaUsers, 
  FaUserCheck, 
  FaUserTimes, 
  FaFileCsv,
  FaChartBar,
  FaHistory,
  FaUserGraduate,
  FaBuilding,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [pendingClaims, setPendingClaims] = useState([]);
  const [uploadHistory, setUploadHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [csvFile, setCsvFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, claimsRes, historyRes] = await Promise.all([
        adminAPI.getDashboardStats(),
        adminAPI.getPendingClaims(),
        adminAPI.getUploadHistory({ limit: 10 })
      ]);

      setStats(statsRes.data);
      setPendingClaims(claimsRes.data);
      setUploadHistory(historyRes.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Please select a CSV file');
      return;
    }

    setCsvFile(file);
  };

  const uploadCSV = async () => {
    if (!csvFile) {
      toast.error('Please select a CSV file');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('alumniFile', csvFile);

      const response = await adminAPI.uploadCSV(formData);
      
      toast.success(response.data.message);
      setCsvFile(null);
      document.getElementById('csv-upload').value = '';
      fetchDashboardData();
    } catch (error) {
      console.error('CSV upload failed:', error);
      toast.error('Failed to upload CSV file');
    } finally {
      setUploading(false);
    }
  };

  const handleClaimAction = async (alumniId, action) => {
    try {
      await adminAPI.approveOrRejectClaim(alumniId, action);
      toast.success(`Claim ${action}d successfully`);
      fetchDashboardData();
    } catch (error) {
      console.error(`Failed to ${action} claim:`, error);
      toast.error(`Failed to ${action} claim`);
    }
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

  const TabButton = ({ id, label, active, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`px-6 py-3 text-sm font-medium rounded-lg transition-colors ${
        active
          ? 'bg-blue-600 text-white'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      {label}
    </button>
  );

  if (loading) {
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
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600">Welcome back, {user?.name}</p>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">
                  Last updated: {new Date().toLocaleString()}
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
              id="overview"
              label="Overview"
              active={activeTab === 'overview'}
              onClick={setActiveTab}
            />
            <TabButton
              id="claims"
              label="Pending Claims"
              active={activeTab === 'claims'}
              onClick={setActiveTab}
            />
            <TabButton
              id="uploads"
              label="Upload History"
              active={activeTab === 'uploads'}
              onClick={setActiveTab}
            />
            <TabButton
              id="upload"
              label="Upload CSV"
              active={activeTab === 'upload'}
              onClick={setActiveTab}
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
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                icon={<FaUsers className="w-6 h-6 text-white" />}
                title="Total Users"
                value={stats?.totalUsers || 0}
                color="bg-blue-600"
              />
              <StatCard
                icon={<FaUserGraduate className="w-6 h-6 text-white" />}
                title="Alumni Profiles"
                value={stats?.totalAlumni || 0}
                color="bg-green-600"
                subtitle={`${stats?.verifiedProfiles || 0} verified`}
              />
              <StatCard
                icon={<FaUserCheck className="w-6 h-6 text-white" />}
                title="Pending Claims"
                value={stats?.pendingVerifications || 0}
                color="bg-yellow-600"
              />
              <StatCard
                icon={<FaFileCsv className="w-6 h-6 text-white" />}
                title="Recent Uploads"
                value={stats?.recentUploads || 0}
                color="bg-purple-600"
                subtitle="Last 30 days"
              />
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {stats?.recentActivity?.slice(0, 5).map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      {activity.type === 'user_registration' && (
                        <FaUsers className="w-5 h-5 text-blue-600" />
                      )}
                      {activity.type === 'profile_claim' && (
                        <FaUserCheck className="w-5 h-5 text-green-600" />
                      )}
                      {activity.type === 'csv_upload' && (
                        <FaFileCsv className="w-5 h-5 text-purple-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.type === 'user_registration' && `${activity.name} registered as ${activity.role}`}
                        {activity.type === 'profile_claim' && `${activity.name} claimed their alumni profile`}
                        {activity.type === 'csv_upload' && `${activity.name} uploaded ${activity.filename}`}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Pending Claims Tab */}
        {activeTab === 'claims' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-white rounded-lg shadow-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Pending Alumni Claims</h3>
                <p className="text-sm text-gray-600">Review and approve alumni profile claims</p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Alumni
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Course & Batch
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Claimed Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pendingClaims.map((claim) => (
                      <tr key={claim.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{claim.name}</div>
                            <div className="text-sm text-gray-500">{claim.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{claim.course}</div>
                          <div className="text-sm text-gray-500">Batch {claim.batch}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(claim.last_updated).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => handleClaimAction(claim.id, 'approve')}
                            className="text-green-600 hover:text-green-900 flex items-center"
                          >
                            <FaCheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleClaimAction(claim.id, 'reject')}
                            className="text-red-600 hover:text-red-900 flex items-center"
                          >
                            <FaTimesCircle className="w-4 h-4 mr-1" />
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {pendingClaims.length === 0 && (
                  <div className="text-center py-12">
                    <FaUserCheck className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No pending claims</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      All alumni claims have been processed.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Upload History Tab */}
        {activeTab === 'uploads' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-white rounded-lg shadow-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Upload History</h3>
                <p className="text-sm text-gray-600">Recent CSV uploads and their results</p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Filename
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Records Count
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Uploaded By
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Upload Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {uploadHistory.map((upload) => (
                      <tr key={upload.upload_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FaFileCsv className="w-5 h-5 text-green-600 mr-3" />
                            <div className="text-sm font-medium text-gray-900">{upload.filename}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {upload.records_count} records
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {upload.admin_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(upload.uploaded_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Upload CSV Tab */}
        {activeTab === 'upload' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Alumni Data</h3>
                <p className="text-sm text-gray-600">
                  Upload a CSV file containing alumni information. The file should include columns for 
                  name, email, course, department, batch, company, position, domain, experience, and location.
                </p>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                <div className="text-center">
                  <FaUpload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <label htmlFor="csv-upload" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900">
                        {csvFile ? csvFile.name : 'Click to upload CSV file'}
                      </span>
                      <input
                        id="csv-upload"
                        type="file"
                        accept=".csv"
                        onChange={handleFileUpload}
                        className="sr-only"
                      />
                    </label>
                    <p className="mt-1 text-xs text-gray-500">
                      CSV files only, max 10MB
                    </p>
                  </div>
                </div>
              </div>

              {csvFile && (
                <div className="mt-6 flex justify-end space-x-4">
                  <button
                    onClick={() => {
                      setCsvFile(null);
                      document.getElementById('csv-upload').value = '';
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={uploadCSV}
                    disabled={uploading}
                    className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? 'Uploading...' : 'Upload CSV'}
                  </button>
                </div>
              )}

              <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-800 mb-2">CSV Format Requirements:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Required columns: name, email, course, department, batch</li>
                  <li>• Optional columns: company, position, domain, experience, location, bio</li>
                  <li>• Email addresses must be unique</li>
                  <li>• Batch should be a valid year</li>
                  <li>• Experience should be in years (number)</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;