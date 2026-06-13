import React from 'react';
import { motion } from 'framer-motion';
import { 
  FaBuilding, 
  FaMapMarkerAlt, 
  FaBriefcase, 
  FaCalendarAlt,
  FaUserPlus,
  FaEye,
  FaCheck,
  FaClock,
  FaUser,
  FaUserTie
} from 'react-icons/fa';

const AlumniCard = ({ 
  alumni, 
  onConnect, 
  onViewProfile, 
  sendingRequest = false, 
  hasRequested = false,
  showActions = true 
}) => {
  const getStatusBadge = () => {
    if (alumni.profile_type === 'static') {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <FaUser className="w-3 h-3 mr-1" />
          Static Profile
        </span>
      );
    }
    
    if (alumni.is_verified) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <FaCheck className="w-3 h-3 mr-1" />
          Verified
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
        <FaClock className="w-3 h-3 mr-1" />
        Pending Verification
      </span>
    );
  };

  const getLastUpdatedText = () => {
    const lastUpdated = new Date(alumni.last_updated);
    const now = new Date();
    const diffInDays = Math.floor((now - lastUpdated) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return 'Updated today';
    } else if (diffInDays === 1) {
      return 'Updated yesterday';
    } else if (diffInDays < 7) {
      return `Updated ${diffInDays} days ago`;
    } else if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return `Updated ${weeks} week${weeks > 1 ? 's' : ''} ago`;
    } else {
      const months = Math.floor(diffInDays / 30);
      return `Updated ${months} month${months > 1 ? 's' : ''} ago`;
    }
  };

  const isStaleProfile = () => {
    const lastUpdated = new Date(alumni.last_updated);
    const now = new Date();
    const diffInYears = (now - lastUpdated) / (1000 * 60 * 60 * 24 * 365);
    return diffInYears > 2;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow ${
        isStaleProfile() ? 'border-l-4 border-l-yellow-400' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-lg">
              {alumni.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{alumni.name}</h3>
            <p className="text-sm text-gray-500">
              {alumni.course} • Batch {alumni.batch}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end space-y-2">
          {getStatusBadge()}
          {isStaleProfile() && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              <FaClock className="w-3 h-3 mr-1" />
              Stale Data
            </span>
          )}
        </div>
      </div>

      {/* Professional Information */}
      <div className="space-y-3 mb-4">
        {alumni.company && (
          <div className="flex items-center text-sm text-gray-600">
            <FaBuilding className="w-4 h-4 mr-2 text-gray-400" />
            <span className="font-medium">{alumni.company}</span>
            {alumni.position && (
              <span className="ml-2 text-gray-500">• {alumni.position}</span>
            )}
          </div>
        )}
        
        {alumni.domain && (
          <div className="flex items-center text-sm text-gray-600">
            <FaBriefcase className="w-4 h-4 mr-2 text-gray-400" />
            <span>{alumni.domain}</span>
            {alumni.experience && (
              <span className="ml-2 text-gray-500">• {alumni.experience} years exp</span>
            )}
          </div>
        )}
        
        {alumni.location && (
          <div className="flex items-center text-sm text-gray-600">
            <FaMapMarkerAlt className="w-4 h-4 mr-2 text-gray-400" />
            <span>{alumni.location}</span>
          </div>
        )}
      </div>

      {/* Bio (only for claimed profiles) */}
      {alumni.bio && alumni.profile_type === 'claimed' && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 line-clamp-2">{alumni.bio}</p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          {getLastUpdatedText()}
        </div>
        
        {showActions && (
          <div className="flex space-x-2">
            {onViewProfile && (
              <button
                onClick={() => onViewProfile(alumni)}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="View Profile"
              >
                <FaEye className="w-4 h-4" />
              </button>
            )}
            
            {onConnect && alumni.profile_type === 'claimed' && alumni.is_verified && (
              <button
                onClick={() => onConnect(alumni.id)}
                disabled={sendingRequest || hasRequested}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors flex items-center ${
                  hasRequested
                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                    : sendingRequest
                    ? 'bg-blue-100 text-blue-600 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {sendingRequest ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-1"></div>
                ) : (
                  <FaUserPlus className="w-3 h-3 mr-1" />
                )}
                {hasRequested ? 'Requested' : 'Connect'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Stale Profile Warning */}
      {isStaleProfile() && (
        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center">
            <FaClock className="w-4 h-4 text-yellow-600 mr-2" />
            <p className="text-sm text-yellow-800">
              This profile hasn't been updated in over 2 years. Information may be outdated.
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default AlumniCard;
