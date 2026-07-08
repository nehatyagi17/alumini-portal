export const errorHandler = (err, req, res, next) => {
    console.error('Error:', err.stack);
    
    // Default error
    let error = {
        message: 'An internal server error occurred.',
        statusCode: 500
    };
    
    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        error.message = 'Resource not found';
        error.statusCode = 404;
    }
    
    // Mongoose duplicate key
    if (err.code === 11000) {
        error.message = 'Duplicate field value entered';
        error.statusCode = 400;
    }
    
    // Mongoose validation error
    if (err.name === 'ValidationError') {
        error.message = Object.values(err.errors).map(val => val.message).join(', ');
        error.statusCode = 400;
    }
    
    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        error.message = 'Invalid token';
        error.statusCode = 401;
    }
    
    if (err.name === 'TokenExpiredError') {
        error.message = 'Token expired';
        error.statusCode = 401;
    }
    
    // PostgreSQL errors
    if (err.code === '23505') { // unique_violation
        error.message = 'Duplicate entry. This record already exists.';
        error.statusCode = 409;
    }
    
    if (err.code === '23503') { // foreign_key_violation
        error.message = 'Referenced record not found.';
        error.statusCode = 400;
    }
    
    if (err.code === '23502') { // not_null_violation
        error.message = 'Required field is missing.';
        error.statusCode = 400;
    }
    
    res.status(error.statusCode).json({
        success: false,
        message: error.message,
        ...(process.env.NODE_ENV === 'development' && { 
            stack: err.stack,
            error: err 
        })
    });
};

// Async error handler wrapper
export const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// 404 handler
export const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};