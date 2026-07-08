import { cleanCSVData } from './csvParser.js';

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Validate alumni record from CSV
export const validateAlumniRecord = (rawData) => {
    const errors = [];
    const data = cleanCSVData(rawData);
    
    // Required fields validation
    if (!data.name || data.name.length < 2) {
        errors.push('Name is required and must be at least 2 characters');
    }
    
    if (!data.email) {
        errors.push('Email is required');
    } else if (!emailRegex.test(data.email)) {
        errors.push('Email format is invalid');
    }
    
    if (!data.course || data.course.length < 2) {
        errors.push('Course is required and must be at least 2 characters');
    }
    
    if (!data.department || data.department.length < 2) {
        errors.push('Department is required and must be at least 2 characters');
    }
    
    if (!data.batch || isNaN(data.batch) || data.batch < 1950 || data.batch > new Date().getFullYear() + 10) {
        errors.push('Batch must be a valid year between 1950 and ' + (new Date().getFullYear() + 10));
    }
    
    // Optional fields validation
    if (data.company && data.company.length < 2) {
        errors.push('Company name must be at least 2 characters if provided');
    }
    
    if (data.position && data.position.length < 2) {
        errors.push('Position must be at least 2 characters if provided');
    }
    
    if (data.domain && data.domain.length < 2) {
        errors.push('Domain must be at least 2 characters if provided');
    }
    
    if (data.experience !== null && (isNaN(data.experience) || data.experience < 0 || data.experience > 50)) {
        errors.push('Experience must be a number between 0 and 50 years if provided');
    }
    
    if (data.location && data.location.length < 2) {
        errors.push('Location must be at least 2 characters if provided');
    }
    
    if (data.bio && data.bio.length > 1000) {
        errors.push('Bio must be less than 1000 characters');
    }
    
    return {
        isValid: errors.length === 0,
        data: data,
        errors: errors
    };
};

// Validate user registration data
export const validateUserRegistration = (data, role) => {
    const errors = [];
    
    // Common validation
    if (!data.name || data.name.trim().length < 2) {
        errors.push('Name is required and must be at least 2 characters');
    }
    
    if (!data.email || !emailRegex.test(data.email)) {
        errors.push('Valid email is required');
    }
    
    if (!data.password || data.password.length < 6) {
        errors.push('Password must be at least 6 characters');
    }
    
    // Role-specific validation
    if (role === 'student') {
        if (!data.course || data.course.trim().length < 2) {
            errors.push('Course is required for students');
        }
        
        if (!data.department || data.department.trim().length < 2) {
            errors.push('Department is required for students');
        }
        
        if (!data.year_of_study || isNaN(data.year_of_study) || data.year_of_study < 1 || data.year_of_study > 10) {
            errors.push('Year of study must be a number between 1 and 10');
        }
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
};

// Validate profile update data
export const validateProfileUpdate = (data, role) => {
    const errors = [];
    
    if (data.name && data.name.trim().length < 2) {
        errors.push('Name must be at least 2 characters');
    }
    
    if (data.email && !emailRegex.test(data.email)) {
        errors.push('Email format is invalid');
    }
    
    // Alumni-specific validation
    if (role === 'alumni') {
        if (data.course && data.course.trim().length < 2) {
            errors.push('Course must be at least 2 characters');
        }
        
        if (data.department && data.department.trim().length < 2) {
            errors.push('Department must be at least 2 characters');
        }
        
        if (data.batch && (isNaN(data.batch) || data.batch < 1950 || data.batch > new Date().getFullYear() + 10)) {
            errors.push('Batch must be a valid year');
        }
        
        if (data.company && data.company.trim().length < 2) {
            errors.push('Company name must be at least 2 characters');
        }
        
        if (data.position && data.position.trim().length < 2) {
            errors.push('Position must be at least 2 characters');
        }
        
        if (data.domain && data.domain.trim().length < 2) {
            errors.push('Domain must be at least 2 characters');
        }
        
        if (data.experience !== undefined && data.experience !== null && (isNaN(data.experience) || data.experience < 0 || data.experience > 50)) {
            errors.push('Experience must be a number between 0 and 50 years');
        }
        
        if (data.location && data.location.trim().length < 2) {
            errors.push('Location must be at least 2 characters');
        }
        
        if (data.bio && data.bio.length > 1000) {
            errors.push('Bio must be less than 1000 characters');
        }
    }
    
    // Student-specific validation
    if (role === 'student') {
        if (data.course && data.course.trim().length < 2) {
            errors.push('Course must be at least 2 characters');
        }
        
        if (data.department && data.department.trim().length < 2) {
            errors.push('Department must be at least 2 characters');
        }
        
        if (data.year_of_study && (isNaN(data.year_of_study) || data.year_of_study < 1 || data.year_of_study > 10)) {
            errors.push('Year of study must be a number between 1 and 10');
        }
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
};

// Validate message data
export const validateMessage = (data) => {
    const errors = [];
    
    if (!data.message || data.message.trim().length === 0) {
        errors.push('Message content is required');
    }
    
    if (data.message && data.message.trim().length > 1000) {
        errors.push('Message must be less than 1000 characters');
    }
    
    if (!data.receiverId || isNaN(data.receiverId)) {
        errors.push('Valid receiver ID is required');
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
};

// Validate search filters
export const validateSearchFilters = (filters) => {
    const errors = [];
    const validatedFilters = {};
    
    if (filters.batch && (isNaN(filters.batch) || filters.batch < 1950 || filters.batch > new Date().getFullYear() + 10)) {
        errors.push('Batch must be a valid year');
    } else if (filters.batch) {
        validatedFilters.batch = parseInt(filters.batch);
    }
    
    if (filters.experience_min && (isNaN(filters.experience_min) || filters.experience_min < 0)) {
        errors.push('Minimum experience must be a non-negative number');
    } else if (filters.experience_min) {
        validatedFilters.experience_min = parseInt(filters.experience_min);
    }
    
    if (filters.experience_max && (isNaN(filters.experience_max) || filters.experience_max < 0)) {
        errors.push('Maximum experience must be a non-negative number');
    } else if (filters.experience_max) {
        validatedFilters.experience_max = parseInt(filters.experience_max);
    }
    
    if (filters.experience_min && filters.experience_max && filters.experience_min > filters.experience_max) {
        errors.push('Minimum experience cannot be greater than maximum experience');
    }
    
    if (filters.limit && (isNaN(filters.limit) || filters.limit < 1 || filters.limit > 100)) {
        errors.push('Limit must be a number between 1 and 100');
    } else if (filters.limit) {
        validatedFilters.limit = parseInt(filters.limit);
    }
    
    if (filters.offset && (isNaN(filters.offset) || filters.offset < 0)) {
        errors.push('Offset must be a non-negative number');
    } else if (filters.offset) {
        validatedFilters.offset = parseInt(filters.offset);
    }
    
    // Copy other string filters as-is
    ['company', 'domain', 'course', 'search'].forEach(field => {
        if (filters[field]) {
            validatedFilters[field] = filters[field].trim();
        }
    });
    
    return {
        isValid: errors.length === 0,
        filters: validatedFilters,
        errors: errors
    };
};

// Sanitize input data
export const sanitizeInput = (data) => {
    if (typeof data === 'string') {
        return data.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    }
    
    if (typeof data === 'object' && data !== null) {
        const sanitized = {};
        for (const [key, value] of Object.entries(data)) {
            sanitized[key] = sanitizeInput(value);
        }
        return sanitized;
    }
    
    return data;
};
