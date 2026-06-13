import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { 
  FaUser, 
  FaEdit, 
  FaSave, 
  FaTimes, 
  FaBuilding, 
  FaMapMarkerAlt, 
  FaBriefcase, 
  FaGraduationCap, 
  FaCalendarAlt,
  FaUserGraduate,
  FaShieldAlt
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { alumniAPI, studentAPI } from '../services/api';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, userProfile, isStudent, isAlumni, isAdmin, updateProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProfile = async () => {
    try {
      let response;
      if (isStudent()) {
        response = await studentAPI.getProfile();
      } else if (isAlumni()) {
        response = await alumniAPI.getProfile();
      } else {
        // Admin profile - use basic user info
        setProfile(userProfile);
        setLoading(false);
        return;
      }
      setProfile(response.data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      if (isStudent()) {
        await studentAPI.updateProfile(data);
      } else if (isAlumni()) {
        await alumniAPI.updateProfile(data);
      } else {
        await updateProfile(data);
      }
      
      toast.success('Profile updated successfully');
      setEditing(false);
      fetchProfile();
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const startEditing = () => {
    if (isAlumni()) {
      reset({
        name: profile?.name || user?.name,
        course: profile?.course || '',
        department: profile?.department || '',
        batch: profile?.batch || '',
        company: profile?.company || '',
        position: profile?.position || '',
        domain: profile?.domain || '',
        experience: profile?.experience || '',
        location: profile?.location || '',
        bio: profile?.bio || ''
      });
    } else if (isStudent()) {
      reset({
        name: profile?.name || user?.name,
        course: profile?.course || '',
        department: profile?.department || '',
        year_of_study: profile?.year_of_study || ''
      });
    } else {
      reset({
        name: user?.name || ''
      });
    }
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
    reset();
  };

  const getVerificationStatus = () => {
    if (!profile) return { status: 'unknown', message: 'Loading...', color: 'gray' };
    
    if (isAlumni()) {
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
    }
    
    return { status: 'active', message: 'Active Profile', color: 'green' };
  };

  const StatusBadge = ({ message, color }) => {
    const colorClasses = {
      green: 'bg-green-100 text-green-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      orange: 'bg-orange-100 text-orange-800',
      gray: 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colorClasses[color]}`}>
        <span className="ml-2">{message}</span>
      </span>
    );
  };

  const InfoField = ({ icon, label, value, type = 'text', register, error, name }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
        {icon}
        <span className="ml-2">{label}</span>
      </label>
      {editing ? (
        <>
          {type === 'textarea' ? (
            <textarea
              {...register(name, { required: false })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={`Enter ${label.toLowerCase()}`}
            />
          ) : (
            <input
              type={type}
              {...register(name, { required: false })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={`Enter ${label.toLowerCase()}`}
            />
          )}
          {error && <p className="mt-1 text-sm text-red-600">{error.message}</p>}
        </>
      ) : (
        <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
          {value || 'Not specified'}
        </p>
      )}
    </div>
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
                <p className="text-gray-600">Manage your account information</p>
              </div>
              <div className="flex items-center space-x-4">
                <StatusBadge {...verificationStatus} />
                {!editing && (
                  <button
                    onClick={startEditing}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <FaEdit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {editing ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-lg shadow-lg p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Edit Profile</h2>
              <div className="flex space-x-3">
                <button
                  onClick={cancelEditing}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
                >
                  <FaTimes className="w-4 h-4 mr-2" />
                  Cancel
                </button>
                <button
                  onClick={handleSubmit(onSubmit)}
                  disabled={saving}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  <FaSave className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <FaUser className="w-5 h-5 mr-2 text-blue-600" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InfoField
                    icon={<FaUser className="w-4 h-4 text-gray-400" />}
                    label="Full Name"
                    value={profile?.name || user?.name}
                    editable={true}
                    register={register}
                    name="name"
                    error={errors.name}
                  />
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <FaUser className="w-4 h-4 text-gray-400" />
                      <span className="ml-2">Email</span>
                    </label>
                    <p className="text-gray-500 bg-gray-100 px-3 py-2 rounded-lg">
                      {user?.email} (Cannot be changed)
                    </p>
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <FaGraduationCap className="w-5 h-5 mr-2 text-blue-600" />
                  Academic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InfoField
                    icon={<FaGraduationCap className="w-4 h-4 text-gray-400" />}
                    label="Course"
                    value={profile?.course}
                    editable={true}
                    register={register}
                    name="course"
                    error={errors.course}
                  />
                  <InfoField
                    icon={<FaBuilding className="w-4 h-4 text-gray-400" />}
                    label="Department"
                    value={profile?.department}
                    editable={true}
                    register={register}
                    name="department"
                    error={errors.department}
                  />
                  {isAlumni() ? (
                    <InfoField
                      icon={<FaCalendarAlt className="w-4 h-4 text-gray-400" />}
                      label="Batch Year"
                      value={profile?.batch}
                      editable={true}
                      type="number"
                      register={register}
                      name="batch"
                      error={errors.batch}
                    />
                  ) : (
                    <InfoField
                      icon={<FaUserGraduate className="w-4 h-4 text-gray-400" />}
                      label="Year of Study"
                      value={profile?.year_of_study}
                      editable={true}
                      type="number"
                      register={register}
                      name="year_of_study"
                      error={errors.year_of_study}
                    />
                  )}
                </div>
              </div>

              {/* Professional Information (Alumni only) */}
              {isAlumni() && (
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <FaBriefcase className="w-5 h-5 mr-2 text-blue-600" />
                    Professional Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoField
                      icon={<FaBuilding className="w-4 h-4 text-gray-400" />}
                      label="Company"
                      value={profile?.company}
                      editable={true}
                      register={register}
                      name="company"
                      error={errors.company}
                    />
                    <InfoField
                      icon={<FaBriefcase className="w-4 h-4 text-gray-400" />}
                      label="Position"
                      value={profile?.position}
                      editable={true}
                      register={register}
                      name="position"
                      error={errors.position}
                    />
                    <InfoField
                      icon={<FaBriefcase className="w-4 h-4 text-gray-400" />}
                      label="Domain"
                      value={profile?.domain}
                      editable={true}
                      register={register}
                      name="domain"
                      error={errors.domain}
                    />
                    <InfoField
                      icon={<FaCalendarAlt className="w-4 h-4 text-gray-400" />}
                      label="Experience (Years)"
                      value={profile?.experience}
                      editable={true}
                      type="number"
                      register={register}
                      name="experience"
                      error={errors.experience}
                    />
                    <InfoField
                      icon={<FaMapMarkerAlt className="w-4 h-4 text-gray-400" />}
                      label="Location"
                      value={profile?.location}
                      editable={true}
                      register={register}
                      name="location"
                      error={errors.location}
                    />
                  </div>
                  <InfoField
                    icon={<FaUser className="w-4 h-4 text-gray-400" />}
                    label="Bio"
                    value={profile?.bio}
                    editable={true}
                    type="textarea"
                    register={register}
                    name="bio"
                    error={errors.bio}
                  />
                </div>
              )}

              {/* Admin Information */}
              {isAdmin() && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <FaShieldAlt className="w-5 h-5 mr-2 text-blue-600" />
                    Administrator Information
                  </h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-800 text-sm">
                      As an administrator, you have access to all system features including 
                      CSV uploads, user management, and verification processes.
                    </p>
                  </div>
                </div>
              )}
            </form>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-lg shadow-lg p-8"
          >
            {/* Profile Header */}
            <div className="flex items-center space-x-6 mb-8">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-2xl">
                  {(profile?.name || user?.name || 'U').charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{profile?.name || user?.name}</h2>
                <p className="text-gray-600">{user?.email}</p>
                <StatusBadge {...verificationStatus} />
              </div>
            </div>

            {/* Profile Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Academic Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <FaGraduationCap className="w-5 h-5 mr-2 text-blue-600" />
                  Academic Information
                </h3>
                <div className="space-y-4">
                  <InfoField
                    icon={<FaGraduationCap className="w-4 h-4 text-gray-400" />}
                    label="Course"
                    value={profile?.course}
                  />
                  <InfoField
                    icon={<FaBuilding className="w-4 h-4 text-gray-400" />}
                    label="Department"
                    value={profile?.department}
                  />
                  {isAlumni() ? (
                    <InfoField
                      icon={<FaCalendarAlt className="w-4 h-4 text-gray-400" />}
                      label="Batch Year"
                      value={profile?.batch}
                    />
                  ) : (
                    <InfoField
                      icon={<FaUserGraduate className="w-4 h-4 text-gray-400" />}
                      label="Year of Study"
                      value={profile?.year_of_study}
                    />
                  )}
                </div>
              </div>

              {/* Professional Information (Alumni only) */}
              {isAlumni() && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <FaBriefcase className="w-5 h-5 mr-2 text-blue-600" />
                    Professional Information
                  </h3>
                  <div className="space-y-4">
                    <InfoField
                      icon={<FaBuilding className="w-4 h-4 text-gray-400" />}
                      label="Company"
                      value={profile?.company}
                    />
                    <InfoField
                      icon={<FaBriefcase className="w-4 h-4 text-gray-400" />}
                      label="Position"
                      value={profile?.position}
                    />
                    <InfoField
                      icon={<FaBriefcase className="w-4 h-4 text-gray-400" />}
                      label="Domain"
                      value={profile?.domain}
                    />
                    <InfoField
                      icon={<FaCalendarAlt className="w-4 h-4 text-gray-400" />}
                      label="Experience"
                      value={profile?.experience ? `${profile.experience} years` : undefined}
                    />
                    <InfoField
                      icon={<FaMapMarkerAlt className="w-4 h-4 text-gray-400" />}
                      label="Location"
                      value={profile?.location}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Bio (Alumni only) */}
            {isAlumni() && profile?.bio && (
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <FaUser className="w-5 h-5 mr-2 text-blue-600" />
                  Bio
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">{profile.bio}</p>
                </div>
              </div>
            )}

            {/* Account Information */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Account Created:</span>
                  <p>{new Date(user?.created_at || Date.now()).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="font-medium">Last Updated:</span>
                  <p>{new Date(profile?.last_updated || profile?.updated_at || Date.now()).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
