const express = require('express');
const router = express.Router();
const Web3Service = require('../utils/web3');
const { validate, validateQuery } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');
const { ethers } = require('ethers');

const web3Service = new Web3Service();

/**
 * @route POST /api/land/mint
 * @desc Mint a new land NFT
 * @access Public (should be restricted in production)
 */
router.post('/mint', validate('mintLandNFT'), asyncHandler(async (req, res) => {
    const { to, uri, metadata } = req.body;

    const result = await web3Service.mintLandNFT(to, uri, metadata);
    
    if (!result.success) {
        return res.status(500).json({
            success: false,
            error: 'Failed to mint land NFT',
            details: result.error
        });
    }

    res.json({
        success: true,
        data: {
            recipient: to,
            tokenId: result.tokenId,
            uri: uri,
            metadata: metadata,
            transactionHash: result.transactionHash,
            blockNumber: result.blockNumber,
            gasUsed: result.gasUsed
        },
        message: 'Land NFT minted successfully'
    });
}));

/**
 * @route GET /api/land/listings
 * @desc Get all active land listings
 * @access Public
 */
router.get('/listings', asyncHandler(async (req, res) => {
    const result = await web3Service.getActiveListings();
    
    if (!result.success) {
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch land listings',
            details: result.error
        });
    }

    res.json({
        success: true,
        data: {
            listings: result.listings,
            totalCount: result.listings.length
        }
    });
}));

/**
 * @route GET /api/land/owned/:address
 * @desc Get owned NFTs for a specific address
 * @access Public
 */
router.get('/owned/:address', asyncHandler(async (req, res) => {
    const { address } = req.params;
    
    if (!ethers.isAddress(address)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid address format'
        });
    }
    
    try {
        const ownedNFTs = await web3Service.getOwnedNFTs(address);
        
        res.json({
            success: true,
            data: ownedNFTs
        });
    } catch (error) {
        console.error('Error fetching owned NFTs:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch owned NFTs'
        });
    }
}));

/**
 * @route GET /api/land/listings/:address
 * @desc Get user's land listings
 * @access Public
 */
router.get('/listings/:address', asyncHandler(async (req, res) => {
    const { address } = req.params;
    
    // Validate address format
    if (!web3Service.isValidAddress(address)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid Ethereum address format'
        });
    }

    const result = await web3Service.getUserListings(address);
    
    if (!result.success) {
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch user listings',
            details: result.error
        });
    }

    res.json({
        success: true,
        data: {
            address: address,
            listings: result.listings,
            totalCount: result.listings.length
        }
    });
}));

/**
 * @route POST /api/land/list
 * @desc List a land NFT for sale
 * @access Public
 */
router.post('/list', validate('listLandNFT'), asyncHandler(async (req, res) => {
    const { tokenId, price } = req.body;

    const result = await web3Service.listLandNFT(tokenId, price);
    
    if (!result.success) {
        return res.status(500).json({
            success: false,
            error: 'Failed to list land NFT',
            details: result.error
        });
    }

    res.json({
        success: true,
        data: {
            tokenId: tokenId,
            price: price,
            transactionHash: result.transactionHash,
            blockNumber: result.blockNumber,
            gasUsed: result.gasUsed
        },
        message: 'Land NFT listed successfully'
    });
}));

/**
 * @route POST /api/land/unlist
 * @desc Unlist a land NFT
 * @access Public
 */
router.post('/unlist', validate('unlistLandNFT'), asyncHandler(async (req, res) => {
    const { tokenId } = req.body;

    const result = await web3Service.unlistLandNFT(tokenId);
    
    if (!result.success) {
        return res.status(500).json({
            success: false,
            error: 'Failed to unlist land NFT',
            details: result.error
        });
    }

    res.json({
        success: true,
        data: {
            tokenId: tokenId,
            transactionHash: result.transactionHash,
            blockNumber: result.blockNumber,
            gasUsed: result.gasUsed
        },
        message: 'Land NFT unlisted successfully'
    });
}));

/**
 * @route POST /api/land/purchase
 * @desc Purchase a land NFT
 * @access Public
 */
router.post('/purchase', validate('purchaseLandNFT'), asyncHandler(async (req, res) => {
    const { tokenId } = req.body;

    const result = await web3Service.purchaseLandNFT(tokenId);
    
    if (!result.success) {
        return res.status(500).json({
            success: false,
            error: 'Failed to purchase land NFT',
            details: result.error
        });
    }

    res.json({
        success: true,
        data: {
            tokenId: tokenId,
            transactionHash: result.transactionHash,
            blockNumber: result.blockNumber,
            gasUsed: result.gasUsed
        },
        message: 'Land NFT purchased successfully'
    });
}));

/**
 * @route GET /api/land/metadata/:tokenId
 * @desc Get land metadata by token ID
 * @access Public
 */
router.get('/metadata/:tokenId', asyncHandler(async (req, res) => {
    const { tokenId } = req.params;
    
    // Validate token ID
    if (!/^\d+$/.test(tokenId)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid token ID format'
        });
    }

    try {
        // Get listing details
        const listings = await web3Service.getActiveListings();
        let listing = null;
        
        if (listings.success) {
            listing = listings.listings.find(l => l.tokenId === tokenId);
        }

        // Get token URI (this would require additional contract method)
        // For now, we'll return basic info
        res.json({
            success: true,
            data: {
                tokenId: tokenId,
                listing: listing,
                isListed: !!listing
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch land metadata',
            details: error.message
        });
    }
}));

module.exports = router;
