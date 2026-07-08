import { Message } from '../models/messageModel.js';
import { InteractionRequest } from '../models/interactionModel.js';

// Get conversations for current user
export const getConversations = async (req, res, next) => {
    const userId = req.user.id;
    
    try {
        const conversations = await Message.getConversationsForUser(userId);
        res.json(conversations);
    } catch (error) {
        next(error);
    }
};

// Get conversation with specific user
export const getConversation = async (req, res, next) => {
    const userId = req.user.id;
    const { otherUserId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    
    try {
        // Verify that they have an accepted connection
        const connection = await InteractionRequest.checkExistingConnection(userId, parseInt(otherUserId));
        if (!connection || connection.status !== 'accepted') {
            return res.status(403).json({ message: 'You are not connected with this user.' });
        }
        
        const messages = await Message.getConversation(userId, parseInt(otherUserId), parseInt(limit), parseInt(offset));
        
        // Mark messages as read
        await Message.markConversationAsRead(userId, parseInt(otherUserId));
        
        res.json(messages);
    } catch (error) {
        next(error);
    }
};

// Send message
export const sendMessage = async (req, res, next) => {
    const userId = req.user.id;
    const { receiverId, message } = req.body;
    
    try {
        // Verify that they have an accepted connection
        const connection = await InteractionRequest.checkExistingConnection(userId, parseInt(receiverId));
        if (!connection || connection.status !== 'accepted') {
            return res.status(403).json({ message: 'You are not connected with this user.' });
        }
        
        const newMessage = await Message.create({
            sender_id: userId,
            receiver_id: receiverId,
            message
        });
        
        // Fetch the full message with sender details
        const fullMessage = await Message.findById(newMessage.id);
        
        // Emit socket event to the receiver
        import('../services/socket.js').then(({ emitToUser }) => {
            emitToUser(parseInt(receiverId), 'new_message', fullMessage);
        }).catch(err => console.error('Failed to emit socket event:', err));
        
        res.status(201).json({ 
            message: 'Message sent successfully.',
            data: fullMessage
        });
    } catch (error) {
        next(error);
    }
};

// Mark message as read
export const markAsRead = async (req, res, next) => {
    const { messageId } = req.params;
    
    try {
        const updatedMessage = await Message.markAsRead(messageId);
        if (!updatedMessage) {
            return res.status(404).json({ message: 'Message not found.' });
        }
        
        res.json({ 
            message: 'Message marked as read.',
            data: updatedMessage
        });
    } catch (error) {
        next(error);
    }
};

// Mark conversation as read
export const markConversationAsRead = async (req, res, next) => {
    const userId = req.user.id;
    const { otherUserId } = req.params;
    
    try {
        const updatedMessages = await Message.markConversationAsRead(userId, parseInt(otherUserId));
        res.json({ 
            message: 'Conversation marked as read.',
            updatedCount: updatedMessages.length
        });
    } catch (error) {
        next(error);
    }
};

// Get unread message count
export const getUnreadCount = async (req, res, next) => {
    const userId = req.user.id;
    
    try {
        const unreadCount = await Message.getUnreadCount(userId);
        res.json({ unreadCount });
    } catch (error) {
        next(error);
    }
};

// Delete message
export const deleteMessage = async (req, res, next) => {
    const { messageId } = req.params;
    
    try {
        // Verify ownership of message
        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ message: 'Message not found.' });
        }
        
        if (message.sender_id !== req.user.id) {
            return res.status(403).json({ message: 'You can only delete your own messages.' });
        }
        
        await Message.delete(messageId);
        res.json({ message: 'Message deleted successfully.' });
    } catch (error) {
        next(error);
    }
};

// Delete entire conversation
export const deleteConversation = async (req, res, next) => {
    const userId = req.user.id;
    const { otherUserId } = req.params;
    
    try {
        await Message.deleteConversation(userId, parseInt(otherUserId));
        res.json({ message: 'Conversation deleted successfully.' });
    } catch (error) {
        next(error);
    }
};
