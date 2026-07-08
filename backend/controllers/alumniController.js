import { AlumniProfile } from '../models/alumniModel.js';
import { User } from '../models/userModel.js';
import { InteractionRequest } from '../models/interactionModel.js';
import { Message } from '../models/messageModel.js';

export const getAlumniProfile = async (req, res, next) => {
    const alumniId = req.user.id;
    
    try {
        const profile = await AlumniProfile.findById(alumniId);
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found.' });
        }
        
        res.json(profile);
    } catch (error) {
        next(error);
    }
};

export const updateAlumniProfile = async (req, res, next) => {
    const alumniId = req.user.id;
    const updateData = req.body;

    try {
        // Check if user is authorized to update (must be claimed and verified)
        const currentProfile = await AlumniProfile.findById(alumniId);
        if (!currentProfile) {
            return res.status(404).json({ message: 'Profile not found.' });
        }
        
        if (currentProfile.profile_type !== 'claimed' || !currentProfile.is_verified) {
            return res.status(403).json({ 
                message: 'You are not authorized to update this profile. Please wait for admin verification.' 
            });
        }

        const updatedProfile = await AlumniProfile.updateProfile(alumniId, updateData);
        res.json({ 
            message: 'Profile updated successfully.', 
            profile: updatedProfile 
        });
    } catch (error) {
        next(error);
    }
};

// Get interaction requests from students
export const getInteractionRequests = async (req, res, next) => {
    const alumniId = req.user.id;
    
    try {
        const requests = await InteractionRequest.getByAlumniId(alumniId);
        res.json(requests);
    } catch (error) {
        next(error);
    }
};

// Respond to interaction request (accept/reject)
export const respondToRequest = async (req, res, next) => {
    const { requestId } = req.params;
    const { status } = req.body; // 'accepted' or 'rejected'
    
    if (!['accepted', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status. Must be "accepted" or "rejected".' });
    }
    
    try {
        const request = await InteractionRequest.findById(requestId);
        if (!request) {
            return res.status(404).json({ message: 'Interaction request not found.' });
        }
        
        // Verify that the alumni is the recipient of this request
        if (request.alumni_id !== req.user.id) {
            return res.status(403).json({ message: 'You are not authorized to respond to this request.' });
        }
        
        const updatedRequest = await InteractionRequest.updateStatus(requestId, status);
        res.json({ 
            message: `Request ${status} successfully.`,
            request: updatedRequest
        });
    } catch (error) {
        next(error);
    }
};

// Get accepted connections (students who can chat)
export const getAcceptedConnections = async (req, res, next) => {
    const alumniId = req.user.id;
    
    try {
        const connections = await InteractionRequest.getAcceptedConnections(alumniId, 'alumni');
        res.json(connections);
    } catch (error) {
        next(error);
    }
};

// Get conversations
export const getConversations = async (req, res, next) => {
    const alumniId = req.user.id;
    
    try {
        const conversations = await Message.getConversationsForUser(alumniId);
        res.json(conversations);
    } catch (error) {
        next(error);
    }
};

// Get conversation with specific user
export const getConversation = async (req, res, next) => {
    const alumniId = req.user.id;
    const { userId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    
    try {
        // Verify that they have an accepted connection
        const connection = await InteractionRequest.checkExistingConnection(parseInt(userId), alumniId);
        if (!connection || connection.status !== 'accepted') {
            return res.status(403).json({ message: 'You are not connected with this user.' });
        }
        
        const messages = await Message.getConversation(alumniId, parseInt(userId), parseInt(limit), parseInt(offset));
        
        // Mark messages as read
        await Message.markConversationAsRead(alumniId, parseInt(userId));
        
        res.json(messages);
    } catch (error) {
        next(error);
    }
};

// Send message
export const sendMessage = async (req, res, next) => {
    const alumniId = req.user.id;
    const { receiverId, message } = req.body;
    
    try {
        // Verify that they have an accepted connection
        const connection = await InteractionRequest.checkExistingConnection(parseInt(receiverId), alumniId);
        if (!connection || connection.status !== 'accepted') {
            return res.status(403).json({ message: 'You are not connected with this user.' });
        }
        
        const newMessage = await Message.create({
            sender_id: alumniId,
            receiver_id: receiverId,
            message
        });
        
        res.status(201).json({ 
            message: 'Message sent successfully.',
            data: newMessage
        });
    } catch (error) {
        next(error);
    }
};

// Get unread message count
export const getUnreadCount = async (req, res, next) => {
    const alumniId = req.user.id;
    
    try {
        const unreadCount = await Message.getUnreadCount(alumniId);
        res.json({ unreadCount });
    } catch (error) {
        next(error);
    }
};