const { ethers } = require('ethers');
require('dotenv').config();

// Contract ABIs
const LandNFTABI = [
    "function listLand(uint256 tokenId, uint256 price)",
    "function getActiveListings() view returns (uint256[])",
    "function getListing(uint256 tokenId) view returns (tuple(uint256 tokenId, address seller, uint256 price, bool isActive, uint256 createdAt))",
    "function getLandMetadata(uint256 tokenId) view returns (tuple(string name, string description, uint256 size, string coordinates, string imageUrl))",
    "function ownerOf(uint256 tokenId) view returns (address)",
    "function balanceOf(address owner) view returns (uint256)"
];

async function listChennaiProperties() {
    try {
        // Setup provider and wallet
        const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        
        console.log('Using wallet:', wallet.address);
        
        // Connect to contract
        const landNFTContract = new ethers.Contract(process.env.LAND_NFT_ADDRESS, LandNFTABI, wallet);
        
        // Get how many NFTs the wallet owns
        const balance = await landNFTContract.balanceOf(wallet.address);
        console.log(`Wallet owns ${balance.toString()} NFTs`);
        
        if (balance.toString() === '0') {
            console.log('❌ No NFTs found to list. Please mint some first.');
            return;
        }
        
        // Since we can't easily get token IDs, let's try to list the first few
        // In a real scenario, we'd track the token IDs from mint events
        const prices = [
            ethers.parseEther("1000"), // 1000 LT tokens
            ethers.parseEther("2000"), // 2000 LT tokens  
            ethers.parseEther("500"),  // 500 LT tokens
            ethers.parseEther("1500"), // 1500 LT tokens
            ethers.parseEther("800")   // 800 LT tokens
        ];
        
        console.log('\n🚀 Starting to list Chennai properties...\n');
        
        // Try to list NFTs with token IDs 0, 1, 2, 3, 4
        for (let tokenId = 0; tokenId < 5; tokenId++) {
            try {
                // Check if this token exists and we own it
                const owner = await landNFTContract.ownerOf(tokenId);
                
                if (owner.toLowerCase() === wallet.address.toLowerCase()) {
                    console.log(`Listing token ID ${tokenId}...`);
                    
                    const price = prices[tokenId] || ethers.parseEther("1000");
                    
                    // List the land
                    const listTx = await landNFTContract.listLand(tokenId, price);
                    console.log(`  List transaction sent: ${listTx.hash}`);
                    
                    const listReceipt = await listTx.wait();
                    console.log(`  ✅ Listed! Gas used: ${listReceipt.gasUsed.toString()}`);
                    console.log(`  Price: ${ethers.formatEther(price)} LT tokens`);
                    
                    // Get metadata to confirm
                    const metadata = await landNFTContract.getLandMetadata(tokenId);
                    console.log(`  Property: ${metadata.name}`);
                    console.log(`  Size: ${metadata.size.toString()} sqm`);
                    
                    console.log(''); // Empty line for readability
                    
                    // Wait a bit between transactions
                    await new Promise(resolve => setTimeout(resolve, 2000));
                } else {
                    console.log(`Token ID ${tokenId} is owned by: ${owner}`);
                }
                
            } catch (error) {
                if (error.message.includes('Owner query for nonexistent token')) {
                    console.log(`Token ID ${tokenId} does not exist`);
                } else {
                    console.error(`  ❌ Error listing token ID ${tokenId}:`, error.message);
                }
            }
        }
        
        // Check active listings
        console.log('\n📋 Checking active listings...');
        const activeListings = await landNFTContract.getActiveListings();
        console.log(`Found ${activeListings.length} active listings:`);
        
        for (const tokenId of activeListings) {
            const listing = await landNFTContract.getListing(tokenId);
            const metadata = await landNFTContract.getLandMetadata(tokenId);
            console.log(`  Token ID ${tokenId}: ${metadata.name} - ${ethers.formatEther(listing.price)} LT`);
        }
        
        console.log('\n🎉 Finished listing Chennai properties!');
        
    } catch (error) {
        console.error('❌ Script failed:', error);
    }
}

// Run the script
listChennaiProperties().catch(console.error);
