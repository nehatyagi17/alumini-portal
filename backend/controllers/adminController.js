import { AlumniProfile } from '../models/alumniModel.js';
import { User } from '../models/userModel.js';
import { CSVUpload } from '../models/csvUploadModel.js';
import { Admin } from '../models/adminModel.js';
import { parseCSV } from '../utils/csvParser.js';

export const uploadAlumniCSV = async (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }

    const adminId = req.user.id;
    const filePath = req.file.path;

    try {
        const parseResult = await parseCSV(filePath);
        
        if (parseResult.totalRows === 0) {
            return res.status(400).json({ message: "CSV is empty or invalid." });
        }

        if (parseResult.validRows === 0) {
            return res.status(400).json({ 
                message: "No valid records found in CSV.",
                errors: parseResult.errors
            });
        }

        const alumniData = parseResult.data;
        let newRecordsCount = 0;
        let updatedRecordsCount = 0;
        let duplicateRecordsCount = 0;

        for (const record of alumniData) {
            // Check if alumni profile already exists
            const existingProfile = await AlumniProfile.findByEmail(record.email);
            
            if (!existingProfile) {
                // Create new user account
                const user = await User.create({
                    name: record.name,
                    email: record.email,
                    password: 'STATIC_ACCOUNT_NO_LOGIN',
                    role: 'alumni'
                });
                
                // Create static alumni profile
                await AlumniProfile.create({
                    id: user.id,
                    course: record.course,
                    department: record.department,
                    batch: record.batch,
                    company: record.company,
                    position: record.position,
                    domain: record.domain,
                    experience: record.experience,
                    location: record.location,
                    bio: record.bio || '',
                    profile_type: 'static',
                    is_verified: true // Static profiles are auto-verified
                });
                newRecordsCount++;
            } else if (existingProfile.profile_type === 'static') {
                // Update existing static profile
                await AlumniProfile.updateProfile(existingProfile.id, {
                    course: record.course,
                    department: record.department,
                    batch: record.batch,
                    company: record.company,
                    position: record.position,
                    domain: record.domain,
                    experience: record.experience,
                    location: record.location,
                    bio: record.bio || existingProfile.bio
                });
                updatedRecordsCount++;
            } else {
                // Skip claimed profiles
                duplicateRecordsCount++;
            }
        }

        // Log the upload
        await CSVUpload.create({
            admin_id: adminId,
            filename: req.file.originalname,
            records_count: newRecordsCount + updatedRecordsCount
        });

        res.status(201).json({ 
            message: `CSV upload completed successfully.`,
            summary: {
                totalRows: parseResult.totalRows,
                validRows: parseResult.validRows,
                invalidRows: parseResult.invalidRows,
                newRecords: newRecordsCount,
                updatedRecords: updatedRecordsCount,
                skippedRecords: duplicateRecordsCount,
                errors: parseResult.errors.length > 0 ? parseResult.errors : undefined
            }
        });

    } catch (error) {
        next(error);
    }
};

export const getPendingClaims = async (req, res, next) => {
    try {
        const pendingClaims = await AlumniProfile.getPendingVerifications();
        res.json(pendingClaims);
    } catch (error) {
        next(error);
    }
};

export const approveOrRejectClaim = async (req, res, next) => {
    const { alumniId } = req.params;
    const { action } = req.body; // 'approve' or 'reject'

    if (!['approve', 'reject'].includes(action)) {
        return res.status(400).json({ message: "Invalid action." });
    }

    try {
        const profile = await AlumniProfile.findById(alumniId);
        if (!profile) {
            return res.status(404).json({ message: 'Alumni profile not found.' });
        }

        if (action === 'approve') {
            await AlumniProfile.verifyProfile(alumniId);
            res.json({ message: 'Alumni claim approved successfully.' });
        } else { // reject
            await AlumniProfile.rejectProfile(alumniId);
            res.json({ message: 'Alumni claim rejected.' });
        }
    } catch (error) {
        next(error);
    }
};

// Get dashboard statistics
export const getDashboardStats = async (req, res, next) => {
    try {
        const statistics = await Admin.getStatistics();
        res.json(statistics);
    } catch (error) {
        next(error);
    }
};

// Get CSV upload history
export const getUploadHistory = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;
        
        const uploads = await CSVUpload.getByAdminId(req.user.id, parseInt(limit), parseInt(offset));
        res.json(uploads);
    } catch (error) {
        next(error);
    }
};

// Get all users for admin management
export const getAllUsers = async (req, res, next) => {
    try {
        const { role, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;
        
        let query = 'SELECT * FROM users';
        const values = [];
        
        if (role) {
            query += ' WHERE role = $1';
            values.push(role);
        }
        
        query += ' ORDER BY created_at DESC LIMIT $' + (values.length + 1) + ' OFFSET $' + (values.length + 2);
        values.push(parseInt(limit), parseInt(offset));
        
        // For now, using direct query. Could be moved to User model
        const { default: pool } = await import('../config/db.js');
        const result = await pool.query(query, values);
        res.json(result.rows);
    } catch (error) {
        next(error);
    }
};

// Get stale profiles
export const getStaleProfiles = async (req, res, next) => {
    try {
        const { daysOld = 365 } = req.query;
        const staleProfiles = await AlumniProfile.getStaleProfiles(parseInt(daysOld));
        res.json(staleProfiles);
    } catch (error) {
        next(error);
    }
};