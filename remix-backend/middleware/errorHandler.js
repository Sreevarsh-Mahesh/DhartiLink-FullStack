/**
 * Error handling middleware
 */
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // Default error response
    let statusCode = 500;
    let message = 'Internal Server Error';
    let details = null;

    // Handle specific error types
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation Error';
        details = err.details;
    } else if (err.name === 'UnauthorizedError') {
        statusCode = 401;
        message = 'Unauthorized';
    } else if (err.name === 'ForbiddenError') {
        statusCode = 403;
        message = 'Forbidden';
    } else if (err.name === 'NotFoundError') {
        statusCode = 404;
        message = 'Not Found';
    } else if (err.name === 'ConflictError') {
        statusCode = 409;
        message = 'Conflict';
    } else if (err.name === 'RateLimitError') {
        statusCode = 429;
        message = 'Too Many Requests';
    } else if (err.message) {
        message = err.message;
    }

    // In development, include stack trace
    const response = {
        success: false,
        error: message,
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method
    };

    if (details) {
        response.details = details;
    }

    if (process.env.NODE_ENV === 'development') {
        response.stack = err.stack;
    }

    res.status(statusCode).json(response);
};

/**
 * 404 handler for undefined routes
 */
const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found',
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method
    });
};

/**
 * Async error wrapper
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

module.exports = {
    errorHandler,
    notFoundHandler,
    asyncHandler
};
