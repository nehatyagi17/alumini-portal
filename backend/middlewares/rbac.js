export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: 'Forbidden: You do not have access to this resource.',
                requiredRoles: roles,
                userRole: req.user.role
            });
        }
        
        next();
    };
};

// Middleware to check if user owns the resource or is admin
export const authorizeOwnerOrAdmin = (resourceUserIdParam = 'userId') => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        
        const resourceUserId = req.params[resourceUserIdParam] || req.body[resourceUserIdParam];
        
        if (req.user.role === 'admin' || req.user.id === parseInt(resourceUserId)) {
            next();
        } else {
            return res.status(403).json({ 
                message: 'Forbidden: You can only access your own resources.' 
            });
        }
    };
};

// Middleware to check if alumni profile is verified
export const requireVerifiedAlumni = async (req, res, next) => {
    try {
        if (req.user.role !== 'alumni') {
            return res.status(403).json({ message: 'This endpoint is only for alumni' });
        }
        
        const { AlumniProfile } = await import('../models/alumniModel.js');
        const profile = await AlumniProfile.findById(req.user.id);
        
        if (!profile || !profile.is_verified) {
            return res.status(403).json({ 
                message: 'Your alumni profile must be verified by an admin to access this feature.' 
            });
        }
        
        next();
    } catch (error) {
        next(error);
    }
};