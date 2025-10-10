const Joi = require('joi');

/**
 * Validation schemas for API endpoints
 */
const schemas = {
    // Token balance validation
    tokenBalance: Joi.object({
        address: Joi.string()
            .pattern(/^0x[a-fA-F0-9]{40}$/)
            .required()
            .messages({
                'string.pattern.base': 'Invalid Ethereum address format',
                'any.required': 'Address is required'
            })
    }),

    // Mint tokens validation
    mintTokens: Joi.object({
        to: Joi.string()
            .pattern(/^0x[a-fA-F0-9]{40}$/)
            .required()
            .messages({
                'string.pattern.base': 'Invalid Ethereum address format',
                'any.required': 'Recipient address is required'
            }),
        amount: Joi.string()
            .pattern(/^\d+(\.\d+)?$/)
            .required()
            .messages({
                'string.pattern.base': 'Amount must be a valid number',
                'any.required': 'Amount is required'
            })
    }),

    // Mint land NFT validation
    mintLandNFT: Joi.object({
        to: Joi.string()
            .pattern(/^0x[a-fA-F0-9]{40}$/)
            .required()
            .messages({
                'string.pattern.base': 'Invalid Ethereum address format',
                'any.required': 'Recipient address is required'
            }),
        uri: Joi.string()
            .uri()
            .required()
            .messages({
                'string.uri': 'Invalid URI format',
                'any.required': 'URI is required'
            }),
        metadata: Joi.object({
            name: Joi.string()
                .min(1)
                .max(100)
                .required()
                .messages({
                    'string.min': 'Name must be at least 1 character',
                    'string.max': 'Name must not exceed 100 characters',
                    'any.required': 'Name is required'
                }),
            description: Joi.string()
                .min(1)
                .max(1000)
                .required()
                .messages({
                    'string.min': 'Description must be at least 1 character',
                    'string.max': 'Description must not exceed 1000 characters',
                    'any.required': 'Description is required'
                }),
            size: Joi.number()
                .integer()
                .min(1)
                .required()
                .messages({
                    'number.base': 'Size must be a number',
                    'number.integer': 'Size must be an integer',
                    'number.min': 'Size must be at least 1',
                    'any.required': 'Size is required'
                }),
            coordinates: Joi.string()
                .min(1)
                .max(100)
                .required()
                .messages({
                    'string.min': 'Coordinates must be at least 1 character',
                    'string.max': 'Coordinates must not exceed 100 characters',
                    'any.required': 'Coordinates is required'
                }),
            imageUrl: Joi.string()
                .uri()
                .required()
                .messages({
                    'string.uri': 'Invalid image URL format',
                    'any.required': 'Image URL is required'
                }),
            features: Joi.array()
                .items(Joi.string().min(1).max(50))
                .max(10)
                .optional()
                .messages({
                    'array.max': 'Maximum 10 features allowed',
                    'string.min': 'Feature must be at least 1 character',
                    'string.max': 'Feature must not exceed 50 characters'
                })
        }).required()
    }),

    // List land NFT validation
    listLandNFT: Joi.object({
        tokenId: Joi.string()
            .pattern(/^\d+$/)
            .required()
            .messages({
                'string.pattern.base': 'Token ID must be a number',
                'any.required': 'Token ID is required'
            }),
        price: Joi.string()
            .pattern(/^\d+(\.\d+)?$/)
            .required()
            .messages({
                'string.pattern.base': 'Price must be a valid number',
                'any.required': 'Price is required'
            })
    }),

    // Unlist land NFT validation
    unlistLandNFT: Joi.object({
        tokenId: Joi.string()
            .pattern(/^\d+$/)
            .required()
            .messages({
                'string.pattern.base': 'Token ID must be a number',
                'any.required': 'Token ID is required'
            })
    }),

    // Purchase land NFT validation
    purchaseLandNFT: Joi.object({
        tokenId: Joi.string()
            .pattern(/^\d+$/)
            .required()
            .messages({
                'string.pattern.base': 'Token ID must be a number',
                'any.required': 'Token ID is required'
            })
    }),

    // Get user listings validation
    getUserListings: Joi.object({
        address: Joi.string()
            .pattern(/^0x[a-fA-F0-9]{40}$/)
            .required()
            .messages({
                'string.pattern.base': 'Invalid Ethereum address format',
                'any.required': 'Address is required'
            })
    })
};

/**
 * Validation middleware factory
 * @param {string} schemaName - Name of the schema to use
 * @returns {Function} Express middleware function
 */
const validate = (schemaName) => {
    return (req, res, next) => {
        const schema = schemas[schemaName];
        
        if (!schema) {
            return res.status(500).json({
                success: false,
                error: 'Invalid validation schema'
            });
        }

        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const errorDetails = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));

            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errorDetails
            });
        }

        // Replace req.body with validated and sanitized data
        req.body = value;
        next();
    };
};

/**
 * Validate query parameters
 * @param {string} schemaName - Name of the schema to use
 * @returns {Function} Express middleware function
 */
const validateQuery = (schemaName) => {
    return (req, res, next) => {
        const schema = schemas[schemaName];
        
        if (!schema) {
            return res.status(500).json({
                success: false,
                error: 'Invalid validation schema'
            });
        }

        const { error, value } = schema.validate(req.query, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const errorDetails = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));

            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errorDetails
            });
        }

        req.query = value;
        next();
    };
};

module.exports = {
    validate,
    validateQuery,
    schemas
};
