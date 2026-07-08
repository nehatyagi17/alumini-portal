import express from 'express';
import { 
    getConversations,
    getConversation,
    sendMessage,
    markAsRead,
    markConversationAsRead,
    getUnreadCount,
    deleteMessage,
    deleteConversation
} from '../controllers/messageController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Conversation Management
router.get('/conversations', getConversations);
router.get('/conversations/:otherUserId', getConversation);
router.delete('/conversations/:otherUserId', deleteConversation);

// Message Management
router.post('/', sendMessage);
router.put('/:messageId/read', markAsRead);
router.put('/conversations/:otherUserId/read', markConversationAsRead);
router.delete('/:messageId', deleteMessage);

// Utility
router.get('/unread-count', getUnreadCount);

export default router;
