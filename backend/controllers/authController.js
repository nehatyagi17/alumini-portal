import jwt from 'jsonwebtoken';
import { User } from '../models/userModel.js';
import { Student } from '../models/studentModel.js';
import { AlumniProfile } from '../models/alumniModel.js';

// Student registration
export const registerStudent = async (req, res, next) => {
    const { name, email, password, course, department, year_of_study } = req.body;

    try {
        // Check if user already exists
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(409).json({ message: 'User with this email already exists.' });
        }

        // Create user
        const user = await User.create({ name, email, password, role: 'student' });
        
        // Create student profile
        await Student.create({ 
            id: user.id, 
            course, 
            department, 
            year_of_study 
        });

        res.status(201).json({ 
            message: 'Student registered successfully. Please log in.',
            user: user.toJSON()
        });

    } catch (error) {
        next(error);
    }
};

// Alumni registration (claiming profile)
export const claimProfile = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        // Check if alumni profile exists with this email
        const existingProfile = await AlumniProfile.findByEmail(email);
        if (!existingProfile) {
            return res.status(404).json({ message: 'No alumni profile found with this email. Please contact admin.' });
        }

        // Check if profile is already claimed
        if (existingProfile.profile_type === 'claimed') {
            return res.status(409).json({ message: 'This profile has already been claimed.' });
        }

        // Update user password and claim profile
        await User.updatePassword(existingProfile.id, password);
        await AlumniProfile.claimProfile(existingProfile.id);

        res.status(200).json({ 
            message: 'Profile claimed successfully. Please wait for admin verification.',
            profileId: existingProfile.id
        });

    } catch (error) {
        next(error);
    }
};

// Admin registration
export const registerAdmin = async (req, res, next) => {
    const { name, email, password } = req.body;

    try {
        // Check if user already exists
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(409).json({ message: 'Admin with this email already exists.' });
        }

        // Create user
        const user = await User.create({ name, email, password, role: 'admin' });
        
        // Create admin profile
        const { Admin } = await import('../models/adminModel.js');
        await Admin.create({ id: user.id });

        res.status(201).json({ 
            message: 'Admin registered successfully. Please log in.',
            user: user.toJSON()
        });

    } catch (error) {
        next(error);
    }
};


export const login = async (req, res, next) => {
    const { email, password } = req.body;
    
    try {
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const isMatch = await user.validatePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const payload = {
            id: user.id,
            role: user.role,
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ 
            token, 
            user: user.toJSON() 
        });
    } catch (error) {
        next(error);
    }
};

// Get current user profile
export const getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        let profileData = user.toJSON();

        // Get role-specific profile data
        if (user.role === 'student') {
            const student = await Student.findById(user.id);
            profileData.student = student;
        } else if (user.role === 'alumni') {
            const alumni = await AlumniProfile.findById(user.id);
            profileData.alumni = alumni;
        } else if (user.role === 'admin') {
            const { Admin } = await import('../models/adminModel.js');
            const admin = await Admin.findById(user.id);
            profileData.admin = admin;
        }

        res.json(profileData);
    } catch (error) {
        next(error);
    }
};

// Update user profile
export const updateProfile = async (req, res, next) => {
    try {
        const { name } = req.body;
        
        const user = await User.updateProfile(req.user.id, { name });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.json({ 
            message: 'Profile updated successfully.',
            user: user.toJSON()
        });
    } catch (error) {
        next(error);
    }
};