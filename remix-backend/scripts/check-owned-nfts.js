const { ethers } = require('ethers');
require('dotenv').config();

// Contract ABIs
const LandNFTABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function ownerOf(uint256 tokenId) view returns (address)",
    "function getLandMetadata(uint256 tokenId) view returns (tuple(string name, string description, uint256 size, string coordinates, string imageUrl))",
    "function getListing(uint256 tokenId) view returns (tuple(uint256 tokenId, address seller, uint256 price, bool isActive, uint256 createdAt))",
    "function getActiveListings() view returns (uint256[])",
    "function tokenURI(uint256 tokenId) view returns (string)"
];

async function checkOwnedNFTs() {
    try {
        // Setup provider and wallet
        const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        
        console.log('🔍 Checking NFTs owned by:', wallet.address);
        console.log('');
        
        // Connect to contract
        const landNFTContract = new ethers.Contract(process.env.LAND_NFT_ADDRESS, LandNFTABI, provider);
        
        // Get balance (number of NFTs owned)
        const balance = await landNFTContract.balanceOf(wallet.address);
        console.log(`📊 Total NFTs owned: ${balance.toString()}`);
        
        if (balance.toString() === '0') {
            console.log('❌ You don\'t own any NFTs yet.');
            console.log('💡 Purchase some from the marketplace to see them here!');
            return;
        }
        
        // Get active listings to see what's for sale
        const activeListings = await landNFTContract.getActiveListings();
        console.log(`🏪 Active listings: ${activeListings.length}`);
        console.log('');
        
        // Check each token ID to see if we own it
        const ownedTokens = [];
        console.log('🔎 Scanning for owned NFTs...');
        
        // Check a reasonable range of token IDs
        for (let tokenId = 0; tokenId < 20; tokenId++) {
            try {
                const owner = await landNFTContract.ownerOf(tokenId);
                
                if (owner.toLowerCase() === wallet.address.toLowerCase()) {
                    console.log(`✅ Found owned NFT: Token ID ${tokenId}`);
                    ownedTokens.push(tokenId);
                }
            } catch (error) {
                // Token doesn't exist, continue
            }
        }
        
        console.log('');
        console.log(`🎉 You own ${ownedTokens.length} NFTs!`);
        console.log('');
        
        // Display details of owned NFTs
        for (const tokenId of ownedTokens) {
            try {
                const metadata = await landNFTContract.getLandMetadata(tokenId);
                const tokenURI = await landNFTContract.tokenURI(tokenId);
                
                console.log(`🏞️  NFT #${tokenId}`);
                console.log(`   Name: ${metadata.name}`);
                console.log(`   Description: ${metadata.description}`);
                console.log(`   Size: ${metadata.size} sqm (${(Number(metadata.size) / 4047).toFixed(1)} acres)`);
                console.log(`   Location: ${metadata.coordinates}`);
                console.log(`   Image: ${metadata.imageUrl}`);
                console.log(`   URI: ${tokenURI}`);
                
                // Check if it's listed for sale
                try {
                    const listing = await landNFTContract.getListing(tokenId);
                    if (listing.isActive) {
                        console.log(`   💰 Listed for sale: ${ethers.formatEther(listing.price)} LT tokens`);
                    } else {
                        console.log(`   🏠 Not listed for sale`);
                    }
                } catch {
                    console.log(`   🏠 Not listed for sale`);
                }
                
                console.log('');
            } catch (error) {
                console.log(`❌ Error getting metadata for token ${tokenId}: ${error.message}`);
            }
        }
        
        console.log('💡 To purchase NFTs, visit the marketplace and use your LT tokens!');
        
    } catch (error) {
        console.error('❌ Script failed:', error);
    }
}

// Run the script
checkOwnedNFTs().catch(console.error);
