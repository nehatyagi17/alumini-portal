import express from 'express';
import { 
    getAlumniProfile, 
    updateAlumniProfile,
    getInteractionRequests,
    respondToRequest,
    getAcceptedConnections,
    getConversations,
    getConversation,
    sendMessage,
    getUnreadCount
} from '../controllers/alumniController.js';
import { protect } from '../middlewares/auth.js';
import { authorize } from '../middlewares/rbac.js';

const router = express.Router();

// Profile Management
router.get('/profile', protect, authorize('alumni'), getAlumniProfile);
router.put('/profile', protect, authorize('alumni'), updateAlumniProfile);

// Interaction Requests
router.get('/requests', protect, authorize('alumni'), getInteractionRequests);
router.put('/requests/:requestId', protect, authorize('alumni'), respondToRequest);
router.get('/connections', protect, authorize('alumni'), getAcceptedConnections);

// Messaging
router.get('/conversations', protect, authorize('alumni'), getConversations);
router.get('/conversations/:userId', protect, authorize('alumni'), getConversation);
router.post('/messages', protect, authorize('alumni'), sendMessage);
router.get('/messages/unread-count', protect, authorize('alumni'), getUnreadCount);

export default router;