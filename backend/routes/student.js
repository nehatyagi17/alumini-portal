import express from 'express';
import { 
    getAlumniDirectory,
    getStudentProfile,
    updateStudentProfile,
    sendInteractionRequest,
    getMyRequests,
    getAcceptedConnections,
    getConversations,
    getConversation,
    sendMessage,
    getUnreadCount
} from '../controllers/studentController.js';
import { protect } from '../middlewares/auth.js';
import { authorize } from '../middlewares/rbac.js';

const router = express.Router();

// Profile Management
router.get('/profile', protect, authorize('student'), getStudentProfile);
router.put('/profile', protect, authorize('student'), updateStudentProfile);

// Alumni Directory and Interactions
router.get('/directory', protect, authorize('student'), getAlumniDirectory);
router.post('/request/:alumniId', protect, authorize('student'), sendInteractionRequest);
router.get('/requests', protect, authorize('student'), getMyRequests);
router.get('/connections', protect, authorize('student'), getAcceptedConnections);

// Messaging
router.get('/conversations', protect, authorize('student'), getConversations);
router.get('/conversations/:userId', protect, authorize('student'), getConversation);
router.post('/messages', protect, authorize('student'), sendMessage);
router.get('/messages/unread-count', protect, authorize('student'), getUnreadCount);

export default router;