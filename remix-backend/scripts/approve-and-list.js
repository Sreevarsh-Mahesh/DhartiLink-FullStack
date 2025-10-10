const { ethers } = require('ethers');
require('dotenv').config();

// Contract ABIs
const LandNFTABI = [
    "function listLand(uint256 tokenId, uint256 price)",
    "function getActiveListings() view returns (uint256[])",
    "function getListing(uint256 tokenId) view returns (tuple(uint256 tokenId, address seller, uint256 price, bool isActive, uint256 createdAt))",
    "function getLandMetadata(uint256 tokenId) view returns (tuple(string name, string description, uint256 size, string coordinates, string imageUrl))",
    "function ownerOf(uint256 tokenId) view returns (address)",
    "function balanceOf(address owner) view returns (uint256)",
    "function listingFee() view returns (uint256)"
];

const LTTokenABI = [
    "function approve(address spender, uint256 amount) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function balanceOf(address owner) view returns (uint256)"
];

async function approveAndList() {
    try {
        // Setup provider and wallet
        const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        
        console.log('Using wallet:', wallet.address);
        
        // Connect to contracts
        const landNFTContract = new ethers.Contract(process.env.LAND_NFT_ADDRESS, LandNFTABI, wallet);
        const ltTokenContract = new ethers.Contract(process.env.LT_TOKEN_ADDRESS, LTTokenABI, wallet);
        
        // Check LT token balance
        const ltBalance = await ltTokenContract.balanceOf(wallet.address);
        console.log(`LT Token balance: ${ethers.formatEther(ltBalance)} LT`);
        
        // Get listing fee
        const listingFee = await landNFTContract.listingFee();
        console.log(`Listing fee: ${ethers.formatEther(listingFee)} LT`);
        
        // Check current allowance
        const currentAllowance = await ltTokenContract.allowance(wallet.address, process.env.LAND_NFT_ADDRESS);
        console.log(`Current allowance: ${ethers.formatEther(currentAllowance)} LT`);
        
        // Approve if needed
        if (currentAllowance < listingFee) {
            console.log('\n🔐 Approving LT tokens for listing fee...');
            const approveTx = await ltTokenContract.approve(process.env.LAND_NFT_ADDRESS, listingFee);
            console.log(`Approval transaction: ${approveTx.hash}`);
            
            await approveTx.wait();
            console.log('✅ Approval confirmed!');
        } else {
            console.log('✅ Sufficient allowance already exists');
        }
        
        // Get how many NFTs the wallet owns
        const balance = await landNFTContract.balanceOf(wallet.address);
        console.log(`\nWallet owns ${balance.toString()} NFTs`);
        
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
                    await new Promise(resolve => setTimeout(resolve, 3000));
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
approveAndList().catch(console.error);
