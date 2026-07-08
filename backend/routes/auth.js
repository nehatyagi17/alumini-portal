import express from 'express';
import { 
    registerStudent, 
    claimProfile, 
    registerAdmin, 
    login, 
    getProfile, 
    updateProfile 
} from '../controllers/authController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

// Public routes
router.post('/register/student', registerStudent);
router.post('/register/admin', registerAdmin);
router.post('/claim-profile', claimProfile);
router.post('/login', login);

// Protected routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

export default router;