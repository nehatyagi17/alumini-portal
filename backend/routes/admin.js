import express from 'express';
import multer from 'multer';
import { 
    uploadAlumniCSV, 
    getPendingClaims, 
    approveOrRejectClaim,
    getDashboardStats,
    getUploadHistory,
    getAllUsers,
    getStaleProfiles
} from '../controllers/adminController.js';
import { protect } from '../middlewares/auth.js';
import { authorize } from '../middlewares/rbac.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// CSV Upload and Alumni Management
router.post('/upload-csv', protect, authorize('admin'), upload.single('alumniFile'), uploadAlumniCSV);
router.get('/claims', protect, authorize('admin'), getPendingClaims);
router.post('/claims/:alumniId', protect, authorize('admin'), approveOrRejectClaim);
router.get('/stale-profiles', protect, authorize('admin'), getStaleProfiles);

// Dashboard and Statistics
router.get('/dashboard/stats', protect, authorize('admin'), getDashboardStats);
router.get('/upload-history', protect, authorize('admin'), getUploadHistory);

// User Management
router.get('/users', protect, authorize('admin'), getAllUsers);

export default router;