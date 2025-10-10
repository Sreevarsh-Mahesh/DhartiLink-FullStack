const express = require('express');
const router = express.Router();
const Web3Service = require('../utils/web3');
const { validate, validateQuery } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');

const web3Service = new Web3Service();

/**
 * @route GET /api/tokens/balance/:address
 * @desc Get LT token balance for an address
 * @access Public
 */
router.get('/balance/:address', asyncHandler(async (req, res) => {
    const { address } = req.params;
    
    // Validate address format
    if (!web3Service.isValidAddress(address)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid Ethereum address format'
        });
    }

    const result = await web3Service.getTokenBalance(address);
    
    if (!result.success) {
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch token balance',
            details: result.error
        });
    }

    res.json({
        success: true,
        data: {
            address: address,
            balance: result.balance.toString(),
            rawBalance: result.rawBalance.toString(),
            decimals: result.decimals,
            symbol: 'LT',
            name: 'Land Token'
        }
    });
}));

/**
 * @route GET /api/tokens/eth-balance/:address
 * @desc Get ETH balance for an address
 * @access Public
 */
router.get('/eth-balance/:address', asyncHandler(async (req, res) => {
    const { address } = req.params;
    
    // Validate address format
    if (!web3Service.isValidAddress(address)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid Ethereum address format'
        });
    }

    const result = await web3Service.getETHBalance(address);
    
    if (!result.success) {
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch ETH balance',
            details: result.error
        });
    }

    res.json({
        success: true,
        data: {
            address: address,
            balance: result.balance.toString(),
            rawBalance: result.rawBalance.toString(),
            symbol: 'ETH',
            name: 'Ethereum'
        }
    });
}));

/**
 * @route POST /api/tokens/mint
 * @desc Mint LT tokens to an address
 * @access Public (should be restricted in production)
 */
router.post('/mint', validate('mintTokens'), asyncHandler(async (req, res) => {
    const { to, amount } = req.body;

    const result = await web3Service.mintTokens(to, amount);
    
    if (!result.success) {
        return res.status(500).json({
            success: false,
            error: 'Failed to mint tokens',
            details: result.error
        });
    }

    res.json({
        success: true,
        data: {
            recipient: to,
            amount: amount,
            transactionHash: result.transactionHash,
            blockNumber: result.blockNumber,
            gasUsed: result.gasUsed
        },
        message: 'Tokens minted successfully'
    });
}));

/**
 * @route GET /api/tokens/contract-info
 * @desc Get contract information
 * @access Public
 */
router.get('/contract-info', asyncHandler(async (req, res) => {
    const contractInfo = web3Service.getContractInfo();
    
    res.json({
        success: true,
        data: contractInfo
    });
}));

module.exports = router;
