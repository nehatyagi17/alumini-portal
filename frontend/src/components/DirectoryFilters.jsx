import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaSearch, 
  FaFilter, 
  FaTimes, 
  FaCalendarAlt, 
  FaBuilding, 
  FaBriefcase, 
  FaGraduationCap,
  FaMapMarkerAlt,
  FaSortAmountDown
} from 'react-icons/fa';

const DirectoryFilters = ({ 
  filters, 
  onFiltersChange, 
  onSearch, 
  onClearFilters,
  totalResults = 0,
  loading = false 
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilters = () => {
    const clearedFilters = {
      search: '',
      batch: '',
      company: '',
      domain: '',
      course: '',
      experience_min: '',
      experience_max: '',
      location: '',
      sortBy: 'last_updated',
      sortOrder: 'desc'
    };
    onFiltersChange(clearedFilters);
    onClearFilters();
  };

  const hasActiveFilters = () => {
    return Object.values(filters).some(value => value && value !== '' && value !== 'last_updated' && value !== 'desc');
  };

  const getCurrentYear = () => new Date().getFullYear();
  const generateBatchYears = () => {
    const currentYear = getCurrentYear();
    const years = [];
    for (let year = currentYear + 5; year >= 1950; year--) {
      years.push(year);
    }
    return years;
  };

  const sortOptions = [
    { value: 'last_updated', label: 'Last Updated', icon: <FaCalendarAlt className="w-4 h-4" /> },
    { value: 'name', label: 'Name', icon: <FaSortAmountDown className="w-4 h-4" /> },
    { value: 'batch', label: 'Batch Year', icon: <FaCalendarAlt className="w-4 h-4" /> },
    { value: 'company', label: 'Company', icon: <FaBuilding className="w-4 h-4" /> },
    { value: 'experience', label: 'Experience', icon: <FaBriefcase className="w-4 h-4" /> }
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search alumni by name, company, or domain..."
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && onSearch()}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={onSearch}
            disabled={loading}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              'Search'
            )}
          </button>
        </div>
      </div>

      {/* Basic Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FaCalendarAlt className="w-4 h-4 inline mr-1" />
            Batch Year
          </label>
          <select
            value={filters.batch || ''}
            onChange={(e) => handleFilterChange('batch', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Batches</option>
            {generateBatchYears().map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FaBuilding className="w-4 h-4 inline mr-1" />
            Company
          </label>
          <input
            type="text"
            placeholder="e.g., Google, Microsoft"
            value={filters.company || ''}
            onChange={(e) => handleFilterChange('company', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FaBriefcase className="w-4 h-4 inline mr-1" />
            Domain
          </label>
          <input
            type="text"
            placeholder="e.g., Technology, Finance"
            value={filters.domain || ''}
            onChange={(e) => handleFilterChange('domain', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FaGraduationCap className="w-4 h-4 inline mr-1" />
            Course
          </label>
          <input
            type="text"
            placeholder="e.g., Computer Science"
            value={filters.course || ''}
            onChange={(e) => handleFilterChange('course', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Advanced Filters Toggle */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        >
          <FaFilter className="w-4 h-4 mr-2" />
          Advanced Filters
          <motion.div
            animate={{ rotate: showAdvancedFilters ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="ml-2"
          >
            ▼
          </motion.div>
        </button>

        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500">
            {totalResults} results
          </span>
          {hasActiveFilters() && (
            <button
              onClick={clearFilters}
              className="text-red-600 hover:text-red-800 text-sm flex items-center"
            >
              <FaTimes className="w-3 h-3 mr-1" />
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      <AnimatePresence>
        {showAdvancedFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-gray-200 pt-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {/* Experience Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaBriefcase className="w-4 h-4 inline mr-1" />
                  Min Experience (Years)
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  placeholder="0"
                  value={filters.experience_min || ''}
                  onChange={(e) => handleFilterChange('experience_min', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaBriefcase className="w-4 h-4 inline mr-1" />
                  Max Experience (Years)
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  placeholder="50"
                  value={filters.experience_max || ''}
                  onChange={(e) => handleFilterChange('experience_max', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaMapMarkerAlt className="w-4 h-4 inline mr-1" />
                  Location
                </label>
                <input
                  type="text"
                  placeholder="e.g., San Francisco, New York"
                  value={filters.location || ''}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Sort Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={filters.sortBy || 'last_updated'}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort Order
                </label>
                <select
                  value={filters.sortOrder || 'desc'}
                  onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filters Display */}
      {hasActiveFilters() && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium text-gray-700">Active filters:</span>
            {Object.entries(filters).map(([key, value]) => {
              if (!value || value === 'last_updated' || value === 'desc') return null;
              
              return (
                <span
                  key={key}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {key.replace('_', ' ')}: {value}
                  <button
                    onClick={() => handleFilterChange(key, '')}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    <FaTimes className="w-2 h-2" />
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DirectoryFilters;
