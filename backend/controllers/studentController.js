import { AlumniProfile } from '../models/alumniModel.js';
import { Student } from '../models/studentModel.js';
import { InteractionRequest } from '../models/interactionModel.js';
import { Message } from '../models/messageModel.js';

export const getAlumniDirectory = async (req, res, next) => {
    const filters = req.query;
    
    try {
        const alumni = await AlumniProfile.getDirectory(filters);
        
        // Filter out sensitive info for static profiles
        const filteredResults = alumni.map(profile => {
            if (profile.profile_type === 'static') {
                return {
                    id: profile.id,
                    name: profile.name,
                    batch: profile.batch,
                    course: profile.course,
                    company: profile.company,
                    domain: profile.domain,
                    profile_type: 'static',
                    last_updated: profile.last_updated
                };
            }
            return profile; // Return full profile for claimed users
        });
        
        res.json(filteredResults);
    } catch (error) {
        next(error);
    }
};

export const getStudentProfile = async (req, res, next) => {
    const studentId = req.user.id;
    
    try {
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student profile not found.' });
        }
        
        res.json(student);
    } catch (error) {
        next(error);
    }
};

export const updateStudentProfile = async (req, res, next) => {
    const studentId = req.user.id;
    const updateData = req.body;
    
    try {
        const updatedStudent = await Student.updateProfile(studentId, updateData);
        res.json({ 
            message: 'Profile updated successfully.',
            student: updatedStudent
        });
    } catch (error) {
        next(error);
    }
};

export const sendInteractionRequest = async (req, res, next) => {
    const studentId = req.user.id;
    const { alumniId } = req.params;

    try {
        // Check if alumni exists and is verified
        const alumni = await AlumniProfile.findById(parseInt(alumniId));
        if (!alumni) {
            return res.status(404).json({ message: 'Alumni profile not found.' });
        }
        
        if (!alumni.is_verified) {
            return res.status(403).json({ message: 'This alumni profile is not yet verified.' });
        }
        
        // Check if request already exists
        const existingRequest = await InteractionRequest.checkExistingConnection(studentId, parseInt(alumniId));
        if (existingRequest) {
            return res.status(409).json({ message: 'You have already sent a request to this alumnus.' });
        }
        
        const newRequest = await InteractionRequest.create({
            student_id: studentId,
            alumni_id: parseInt(alumniId)
        });
        
        res.status(201).json({ 
            message: 'Interaction request sent successfully.',
            request: newRequest
        });
    } catch (error) {
        next(error);
    }
};

export const getMyRequests = async (req, res, next) => {
    const studentId = req.user.id;
    
    try {
        const requests = await InteractionRequest.getByStudentId(studentId);
        res.json(requests);
    } catch (error) {
        next(error);
    }
};

export const getAcceptedConnections = async (req, res, next) => {
    const studentId = req.user.id;
    
    try {
        const connections = await InteractionRequest.getAcceptedConnections(studentId, 'student');
        res.json(connections);
    } catch (error) {
        next(error);
    }
};

export const getConversations = async (req, res, next) => {
    const studentId = req.user.id;
    
    try {
        const conversations = await Message.getConversationsForUser(studentId);
        res.json(conversations);
    } catch (error) {
        next(error);
    }
};

export const getConversation = async (req, res, next) => {
    const studentId = req.user.id;
    const { userId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    
    try {
        // Verify that they have an accepted connection
        const connection = await InteractionRequest.checkExistingConnection(studentId, parseInt(userId));
        if (!connection || connection.status !== 'accepted') {
            return res.status(403).json({ message: 'You are not connected with this user.' });
        }
        
        const messages = await Message.getConversation(studentId, parseInt(userId), parseInt(limit), parseInt(offset));
        
        // Mark messages as read
        await Message.markConversationAsRead(studentId, parseInt(userId));
        
        res.json(messages);
    } catch (error) {
        next(error);
    }
};

export const sendMessage = async (req, res, next) => {
    const studentId = req.user.id;
    const { receiverId, message } = req.body;
    
    try {
        // Verify that they have an accepted connection
        const connection = await InteractionRequest.checkExistingConnection(studentId, parseInt(receiverId));
        if (!connection || connection.status !== 'accepted') {
            return res.status(403).json({ message: 'You are not connected with this user.' });
        }
        
        const newMessage = await Message.create({
            sender_id: studentId,
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

export const getUnreadCount = async (req, res, next) => {
    const studentId = req.user.id;
    
    try {
        const unreadCount = await Message.getUnreadCount(studentId);
        res.json({ unreadCount });
    } catch (error) {
        next(error);
    }
};