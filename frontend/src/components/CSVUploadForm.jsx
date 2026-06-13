import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FaUpload, 
  FaFileCsv, 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaInfoCircle,
  FaDownload,
  FaTimes,
  FaSpinner
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const CSVUploadForm = ({ onUpload, uploading = false }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileSelect = (file) => {
    if (!file) return;

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast.error('Please select a CSV file');
      return;
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInput = (e) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a CSV file');
      return;
    }

    try {
      setUploadProgress(0);
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      await onUpload(selectedFile);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Reset form after successful upload
      setTimeout(() => {
        setSelectedFile(null);
        setUploadProgress(0);
        document.getElementById('csv-file-input').value = '';
      }, 1000);
      
    } catch (error) {
      console.error('Upload error:', error);
      setUploadProgress(0);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    document.getElementById('csv-file-input').value = '';
  };

  const downloadTemplate = () => {
    const csvContent = [
      'name,email,course,department,batch,company,position,domain,experience,location,bio',
      'John Doe,john.doe@example.com,Computer Science,Engineering,2018,Google,Software Engineer,Technology,5,San Francisco CA,Passionate about AI and machine learning',
      'Jane Smith,jane.smith@example.com,Business Administration,Management,2019,Microsoft,Product Manager,Technology,4,Seattle WA,Leading innovative product development'
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'alumni_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 transition-colors ${
          dragActive
            ? 'border-blue-400 bg-blue-50'
            : selectedFile
            ? 'border-green-400 bg-green-50'
            : 'border-gray-300 bg-gray-50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="text-center">
          {selectedFile ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              <FaCheckCircle className="mx-auto h-12 w-12 text-green-500" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">File Selected</h3>
                <p className="text-sm text-gray-500">{selectedFile.name}</p>
                <p className="text-xs text-gray-400">{formatFileSize(selectedFile.size)}</p>
              </div>
              <button
                onClick={removeFile}
                className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center mx-auto"
              >
                <FaTimes className="w-4 h-4 mr-1" />
                Remove File
              </button>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <FaUpload className={`mx-auto h-12 w-12 ${
                dragActive ? 'text-blue-500' : 'text-gray-400'
              }`} />
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {dragActive ? 'Drop your CSV file here' : 'Upload CSV File'}
                </h3>
                <p className="text-sm text-gray-500">
                  Drag and drop your CSV file here, or click to browse
                </p>
              </div>
              <label
                htmlFor="csv-file-input"
                className="cursor-pointer bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-block"
              >
                Choose File
              </label>
              <input
                id="csv-file-input"
                type="file"
                accept=".csv"
                onChange={handleFileInput}
                className="hidden"
              />
            </div>
          )}
        </div>

        {/* Upload Progress */}
        {uploading && uploadProgress > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-blue-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${uploadProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Upload Button */}
      {selectedFile && (
        <div className="flex justify-end">
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            {uploading ? (
              <>
                <FaSpinner className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <FaUpload className="w-4 h-4 mr-2" />
                Upload CSV
              </>
            )}
          </button>
        </div>
      )}

      {/* Instructions and Template */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start">
          <FaInfoCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-medium text-blue-800 mb-2">
              CSV Format Requirements:
            </h4>
            <ul className="text-sm text-blue-700 space-y-1 mb-4">
              <li>• Required columns: name, email, course, department, batch</li>
              <li>• Optional columns: company, position, domain, experience, location, bio</li>
              <li>• Email addresses must be unique and valid</li>
              <li>• Batch should be a valid year (e.g., 2018)</li>
              <li>• Experience should be in years (number only)</li>
              <li>• File size limit: 10MB</li>
            </ul>
            <button
              onClick={downloadTemplate}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
            >
              <FaDownload className="w-4 h-4 mr-1" />
              Download CSV Template
            </button>
          </div>
        </div>
      </div>

      {/* Validation Warnings */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <FaExclamationTriangle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-yellow-800 mb-1">
              Important Notes:
            </h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Duplicate emails will be skipped during upload</li>
              <li>• Invalid data rows will be reported in the upload summary</li>
              <li>• Existing alumni profiles will be updated if the email matches</li>
              <li>• All uploaded profiles start as "static" and require alumni to claim them</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CSVUploadForm;
