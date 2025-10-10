const { ethers } = require('ethers');

// Simplified contract ABIs for Remix-deployed contracts
const LTTokenABI = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
    "function totalSupply() view returns (uint256)",
    "function balanceOf(address) view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function transferFrom(address from, address to, uint256 amount) returns (bool)",
    "function mint(address to, uint256 amount)",
    "function addMinter(address minter)",
    "function removeMinter(address minter)",
    "function minters(address) view returns (bool)",
    "event Transfer(address indexed from, address indexed to, uint256 value)",
    "event Approval(address indexed owner, address indexed spender, uint256 value)",
    "event Mint(address indexed to, uint256 amount)"
];

const LandNFTABI = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function balanceOf(address) view returns (uint256)",
    "function ownerOf(uint256 tokenId) view returns (address)",
    "function approve(address to, uint256 tokenId)",
    "function getApproved(uint256 tokenId) view returns (address)",
    "function setApprovalForAll(address operator, bool approved)",
    "function isApprovedForAll(address owner, address operator) view returns (bool)",
    "function transferFrom(address from, address to, uint256 tokenId)",
    "function safeTransferFrom(address from, address to, uint256 tokenId)",
    "function safeTransferFrom(address from, address to, uint256 tokenId, bytes calldata data)",
    "function tokenURI(uint256 tokenId) view returns (string)",
    "function mintLand(address to, string memory uri, tuple(string name, string description, uint256 size, string coordinates, string imageUrl) metadata)",
    "function listLand(uint256 tokenId, uint256 price)",
    "function unlistLand(uint256 tokenId)",
    "function purchaseLand(uint256 tokenId)",
    "function getActiveListings() view returns (uint256[])",
    "function getListing(uint256 tokenId) view returns (tuple(uint256 tokenId, address seller, uint256 price, bool isActive, uint256 createdAt))",
    "function getLandMetadata(uint256 tokenId) view returns (tuple(string name, string description, uint256 size, string coordinates, string imageUrl))",
    "function listingFee() view returns (uint256)",
    "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
    "event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)",
    "event ApprovalForAll(address indexed owner, address indexed operator, bool approved)",
    "event LandMinted(uint256 indexed tokenId, address indexed owner, string uri)",
    "event LandListed(uint256 indexed tokenId, address indexed seller, uint256 price)",
    "event LandUnlisted(uint256 indexed tokenId, address indexed seller)",
    "event LandPurchased(uint256 indexed tokenId, address indexed buyer, address indexed seller, uint256 price)"
];

class Web3Service {
    constructor() {
        // Check if environment is properly configured
        if (!process.env.SEPOLIA_RPC_URL || !process.env.PRIVATE_KEY || 
            process.env.PRIVATE_KEY === 'your_private_key_here' ||
            process.env.SEPOLIA_RPC_URL.includes('YOUR_INFURA_PROJECT_ID')) {
            console.error('❌ Environment not configured properly!');
            console.log('📝 Please run: node setup-remix-backend.js');
            console.log('📖 Or see REMIX_QUICK_START.md for setup instructions');
            this.provider = null;
            this.wallet = null;
            this.ltTokenContract = null;
            this.landNFTContract = null;
            return;
        }
        
        this.provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
        this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
        
        // Initialize contracts (only if addresses are provided)
        if (process.env.LT_TOKEN_ADDRESS && process.env.LT_TOKEN_ADDRESS !== '') {
            this.ltTokenContract = new ethers.Contract(
                process.env.LT_TOKEN_ADDRESS,
                LTTokenABI,
                this.wallet
            );
        }
        
        if (process.env.LAND_NFT_ADDRESS && process.env.LAND_NFT_ADDRESS !== '') {
            this.landNFTContract = new ethers.Contract(
                process.env.LAND_NFT_ADDRESS,
                LandNFTABI,
                this.wallet
            );
        }
    }

    /**
     * Get LT token balance for an address
     */
    async getTokenBalance(address) {
        try {
            if (!this.ltTokenContract) {
                return {
                    success: false,
                    error: 'LT Token contract not initialized. Please deploy contracts first.'
                };
            }
            
            const balance = await this.ltTokenContract.balanceOf(address);
            const decimals = await this.ltTokenContract.decimals();
            const formattedBalance = ethers.formatUnits(balance, decimals);
            
            return {
                success: true,
                balance: formattedBalance,
                rawBalance: balance.toString(),
                decimals: Number(decimals)
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get ETH balance for an address
     */
    async getETHBalance(address) {
        try {
            const balance = await this.provider.getBalance(address);
            const formattedBalance = ethers.formatEther(balance);
            
            return {
                success: true,
                balance: formattedBalance,
                rawBalance: balance.toString()
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Mint LT tokens to an address
     */
    async mintTokens(to, amount) {
        try {
            const decimals = await this.ltTokenContract.decimals();
            const amountInWei = ethers.parseUnits(amount, decimals);
            
            const tx = await this.ltTokenContract.mint(to, amountInWei);
            const receipt = await tx.wait();
            
            return {
                success: true,
                transactionHash: tx.hash,
                blockNumber: receipt.blockNumber,
                gasUsed: receipt.gasUsed.toString()
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Mint a new land NFT
     */
    async mintLandNFT(to, uri, metadata) {
        try {
            const tx = await this.landNFTContract.mintLand(to, uri, metadata);
            const receipt = await tx.wait();
            
            // Get token ID from events
            const mintEvent = receipt.logs.find(log => {
                try {
                    const parsed = this.landNFTContract.interface.parseLog(log);
                    return parsed.name === 'LandMinted';
                } catch (e) {
                    return false;
                }
            });
            
            let tokenId = null;
            if (mintEvent) {
                const parsed = this.landNFTContract.interface.parseLog(mintEvent);
                tokenId = parsed.args.tokenId.toString();
            }
            
            return {
                success: true,
                transactionHash: tx.hash,
                blockNumber: receipt.blockNumber,
                gasUsed: receipt.gasUsed.toString(),
                tokenId: tokenId
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * List a land NFT for sale
     */
    async listLandNFT(tokenId, price) {
        try {
            const decimals = await this.ltTokenContract.decimals();
            const priceInWei = ethers.parseUnits(price, decimals);
            
            const tx = await this.landNFTContract.listLand(tokenId, priceInWei);
            const receipt = await tx.wait();
            
            return {
                success: true,
                transactionHash: tx.hash,
                blockNumber: receipt.blockNumber,
                gasUsed: receipt.gasUsed.toString()
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Unlist a land NFT
     */
    async unlistLandNFT(tokenId) {
        try {
            const tx = await this.landNFTContract.unlistLand(tokenId);
            const receipt = await tx.wait();
            
            return {
                success: true,
                transactionHash: tx.hash,
                blockNumber: receipt.blockNumber,
                gasUsed: receipt.gasUsed.toString()
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Purchase a land NFT
     */
    async purchaseLandNFT(tokenId) {
        try {
            const tx = await this.landNFTContract.purchaseLand(tokenId);
            const receipt = await tx.wait();
            
            return {
                success: true,
                transactionHash: tx.hash,
                blockNumber: receipt.blockNumber,
                gasUsed: receipt.gasUsed.toString()
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get all active land listings
     */
    async getActiveListings() {
        try {
            const tokenIds = await this.landNFTContract.getActiveListings();
            const listings = [];
            
            for (const tokenId of tokenIds) {
                const listing = await this.landNFTContract.getListing(tokenId);
                const metadata = await this.landNFTContract.getLandMetadata(tokenId);
                const tokenURI = await this.landNFTContract.tokenURI(tokenId);
                
                listings.push({
                    tokenId: tokenId.toString(),
                    seller: listing.seller,
                    price: ethers.formatUnits(listing.price, 18), // Assuming 18 decimals
                    rawPrice: listing.price.toString(),
                    isActive: listing.isActive,
                    createdAt: listing.createdAt.toString(),
                    metadata: {
                        name: metadata.name,
                        description: metadata.description,
                        size: metadata.size.toString(),
                        coordinates: metadata.coordinates,
                        imageUrl: metadata.imageUrl,
                        features: [] // Simplified version doesn't have features array
                    },
                    tokenURI: tokenURI
                });
            }
            
            return {
                success: true,
                listings: listings
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get owned NFTs for a specific address
     */
    async getOwnedNFTs(address) {
        try {
            if (!this.landNFTContract) {
                throw new Error('Land NFT contract not initialized. Please deploy contracts first.');
            }
            
            const balance = await this.landNFTContract.balanceOf(address);
            const ownedNFTs = [];
            
            // Scan for owned NFTs (in a real app, you'd track this more efficiently)
            for (let tokenId = 0; tokenId < 100; tokenId++) { // Check first 100 tokens
                try {
                    const owner = await this.landNFTContract.ownerOf(tokenId);
                    
                    if (owner.toLowerCase() === address.toLowerCase()) {
                        const metadata = await this.landNFTContract.getLandMetadata(tokenId);
                        const tokenURI = await this.landNFTContract.tokenURI(tokenId);
                        
                        // Check if it's listed for sale
                        let isListed = false;
                        let listingPrice = null;
                        try {
                            const listing = await this.landNFTContract.getListing(tokenId);
                            isListed = listing.isActive;
                            if (isListed) {
                                listingPrice = ethers.formatUnits(listing.price, 18);
                            }
                        } catch {
                            // Not listed
                        }
                        
                        ownedNFTs.push({
                            tokenId: tokenId.toString(),
                            name: metadata.name,
                            description: metadata.description,
                            size: metadata.size.toString(),
                            coordinates: metadata.coordinates,
                            imageUrl: metadata.imageUrl,
                            tokenURI: tokenURI,
                            isListed: isListed,
                            listingPrice: listingPrice
                        });
                    }
                } catch (error) {
                    // Token doesn't exist, continue
                }
            }
            
            return ownedNFTs;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    /**
     * Get user's listings (simplified - returns all active listings for now)
     */
    async getUserListings(address) {
        try {
            const allListings = await this.getActiveListings();
            if (!allListings.success) {
                return allListings;
            }
            
            // Filter by seller address
            const userListings = allListings.listings.filter(
                listing => listing.seller.toLowerCase() === address.toLowerCase()
            );
            
            return {
                success: true,
                listings: userListings
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get contract information
     */
    getContractInfo() {
        return {
            ltTokenAddress: process.env.LT_TOKEN_ADDRESS,
            landNFTAddress: process.env.LAND_NFT_ADDRESS,
            network: 'sepolia',
            chainId: 11155111,
            deployment: 'Remix IDE'
        };
    }

    /**
     * Check if an address is valid
     */
    isValidAddress(address) {
        try {
            return ethers.isAddress(address);
        } catch (error) {
            return false;
        }
    }
}

module.exports = Web3Service;
