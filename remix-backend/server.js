require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Fix BigInt serialization
BigInt.prototype.toJSON = function() {
    return this.toString();
};

// Import routes
const tokenRoutes = require('./routes/tokens');
const landRoutes = require('./routes/land');

// Import middleware
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        success: false,
        error: 'Too many requests from this IP, please try again later.'
    }
});
app.use(limiter);

// CORS configuration
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        // In development, allow localhost
        if (process.env.NODE_ENV === 'development') {
            if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
                return callback(null, true);
            }
        }
        
        // Add your frontend domains here
        const allowedOrigins = [
            'https://your-frontend-domain.com',
            'https://your-nextjs-app.vercel.app'
        ];
        
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0',
        deployment: 'Remix IDE'
    });
});

// API routes
app.use('/api/tokens', tokenRoutes);
app.use('/api/land', landRoutes);

// API documentation endpoint
app.get('/api', (req, res) => {
    res.json({
        success: true,
        message: 'Blockchain Backend API - Remix Edition',
        version: '1.0.0',
        deployment: 'Remix IDE',
        endpoints: {
            health: 'GET /health',
            tokens: {
                balance: 'GET /api/tokens/balance/:address',
                ethBalance: 'GET /api/tokens/eth-balance/:address',
                mint: 'POST /api/tokens/mint',
                contractInfo: 'GET /api/tokens/contract-info'
            },
            land: {
                mint: 'POST /api/land/mint',
                listings: 'GET /api/land/listings',
                userListings: 'GET /api/land/listings/:address',
                list: 'POST /api/land/list',
                unlist: 'POST /api/land/unlist',
                purchase: 'POST /api/land/purchase',
                metadata: 'GET /api/land/metadata/:tokenId'
            }
        },
        documentation: {
            description: 'Backend API for LT tokens and Land NFTs deployed via Remix IDE',
            network: 'Sepolia Testnet',
            chainId: 11155111,
            contracts: {
                ltToken: process.env.LT_TOKEN_ADDRESS || 'Deploy via Remix first',
                landNFT: process.env.LAND_NFT_ADDRESS || 'Deploy via Remix first'
            }
        }
    });
});

// 404 handler for undefined routes
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Remix Backend Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 API Documentation: http://localhost:${PORT}/api`);
    console.log(`💚 Health Check: http://localhost:${PORT}/health`);
    
    // Log contract addresses if available
    if (process.env.LT_TOKEN_ADDRESS) {
        console.log(`🪙 LT Token Contract: ${process.env.LT_TOKEN_ADDRESS}`);
    }
    if (process.env.LAND_NFT_ADDRESS) {
        console.log(`🏞️  Land NFT Contract: ${process.env.LAND_NFT_ADDRESS}`);
    }
    
    console.log(`\n📖 Deployment Guide: See REMIX_GUIDE.md`);
    console.log(`🎯 Contracts Location: remix-contracts/ folder`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    process.exit(0);
});

module.exports = app;
