const { ethers } = require('ethers');
require('dotenv').config();

// Contract ABIs
const LandNFTABI = [
    "function transferFrom(address from, address to, uint256 tokenId)",
    "function approve(address to, uint256 tokenId)",
    "function listLand(uint256 tokenId, uint256 price)",
    "function getActiveListings() view returns (uint256[])",
    "function getListing(uint256 tokenId) view returns (tuple(uint256 tokenId, address seller, uint256 price, bool isActive, uint256 createdAt))",
    "function getLandMetadata(uint256 tokenId) view returns (tuple(string name, string description, uint256 size, string coordinates, string imageUrl))",
    "function ownerOf(uint256 tokenId) view returns (address)",
    "function balanceOf(address owner) view returns (uint256)"
];

const LTTokenABI = [
    "function approve(address spender, uint256 amount) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function mint(address to, uint256 amount)"
];

async function transferAndList() {
    try {
        // Setup provider and wallet
        const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        
        console.log('🔄 Transferring NFTs to create purchasable listings...');
        console.log('Using wallet:', wallet.address);
        
        // Connect to contracts
        const landNFTContract = new ethers.Contract(process.env.LAND_NFT_ADDRESS, LandNFTABI, wallet);
        const ltTokenContract = new ethers.Contract(process.env.LT_TOKEN_ADDRESS, LTTokenABI, wallet);
        
        // Create a second wallet (different private key for testing)
        // This simulates a different user
        const testWallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        const testWallet2 = new ethers.Wallet("0x" + process.env.PRIVATE_KEY.slice(2, 66) + "01", provider); // Modified private key
        
        console.log('Test wallet address:', testWallet2.address);
        
        // First, let's mint some LT tokens to the test wallet
        console.log('\n💰 Minting LT tokens to test wallet...');
        try {
            const mintTx = await ltTokenContract.mint(testWallet2.address, ethers.parseEther("10000"));
            await mintTx.wait();
            console.log('✅ LT tokens minted to test wallet');
        } catch (error) {
            console.log('⚠️  Could not mint LT tokens (may not be minter):', error.message);
        }
        
        // Transfer 2 NFTs to the test wallet
        console.log('\n🔄 Transferring NFTs to test wallet...');
        
        const tokenIdsToTransfer = [1, 2]; // Transfer tokens 1 and 2
        const transferPrices = [
            ethers.parseEther("2000"), // 2000 LT for token 1
            ethers.parseEther("500")   // 500 LT for token 2
        ];
        
        for (let i = 0; i < tokenIdsToTransfer.length; i++) {
            const tokenId = tokenIdsToTransfer[i];
            
            try {
                console.log(`\nTransferring Token ID ${tokenId}...`);
                
                // First approve the transfer
                const approveTx = await landNFTContract.approve(testWallet2.address, tokenId);
                await approveTx.wait();
                console.log(`  ✅ Approved transfer for token ${tokenId}`);
                
                // Transfer the NFT
                const transferTx = await landNFTContract.transferFrom(wallet.address, testWallet2.address, tokenId);
                await transferTx.wait();
                console.log(`  ✅ Transferred token ${tokenId} to ${testWallet2.address}`);
                
                // Get metadata to confirm
                const metadata = await landNFTContract.getLandMetadata(tokenId);
                console.log(`  Property: ${metadata.name}`);
                
            } catch (error) {
                console.error(`  ❌ Error transferring token ${tokenId}:`, error.message);
            }
        }
        
        // Now, as the test wallet, list the NFTs for sale
        console.log('\n🏪 Listing transferred NFTs for sale...');
        
        // Create a new contract instance with the test wallet as signer
        const testLandContract = new ethers.Contract(process.env.LAND_NFT_ADDRESS, LandNFTABI, testWallet2);
        const testLTContract = new ethers.Contract(process.env.LT_TOKEN_ADDRESS, LTTokenABI, testWallet2);
        
        for (let i = 0; i < tokenIdsToTransfer.length; i++) {
            const tokenId = tokenIdsToTransfer[i];
            const price = transferPrices[i];
            
            try {
                console.log(`\nListing Token ID ${tokenId} for ${ethers.formatEther(price)} LT...`);
                
                // Check if test wallet owns the token
                const owner = await landNFTContract.ownerOf(tokenId);
                if (owner.toLowerCase() !== testWallet2.address.toLowerCase()) {
                    console.log(`  ⚠️  Test wallet doesn't own token ${tokenId}, skipping`);
                    continue;
                }
                
                // Approve LT tokens for listing fee
                const listingFee = await landNFTContract.listingFee();
                const approveTx = await testLTContract.approve(process.env.LAND_NFT_ADDRESS, listingFee);
                await approveTx.wait();
                console.log(`  ✅ Approved LT tokens for listing fee`);
                
                // List the land
                const listTx = await testLandContract.listLand(tokenId, price);
                await listTx.wait();
                console.log(`  ✅ Listed token ${tokenId} for ${ethers.formatEther(price)} LT`);
                
                // Get metadata to confirm
                const metadata = await landNFTContract.getLandMetadata(tokenId);
                console.log(`  Property: ${metadata.name}`);
                
            } catch (error) {
                console.error(`  ❌ Error listing token ${tokenId}:`, error.message);
            }
        }
        
        // Check final active listings
        console.log('\n📋 Final active listings:');
        const activeListings = await landNFTContract.getActiveListings();
        console.log(`Found ${activeListings.length} active listings:`);
        
        for (const tokenId of activeListings) {
            const listing = await landNFTContract.getListing(tokenId);
            const metadata = await landNFTContract.getLandMetadata(tokenId);
            const owner = await landNFTContract.ownerOf(tokenId);
            console.log(`  Token ID ${tokenId}: ${metadata.name} - ${ethers.formatEther(listing.price)} LT (Owner: ${owner})`);
        }
        
        console.log('\n🎉 Setup complete!');
        console.log('💡 You can now purchase NFTs from other addresses');
        console.log(`💡 Test wallet address: ${testWallet2.address}`);
        
    } catch (error) {
        console.error('❌ Script failed:', error);
    }
}

// Run the script
transferAndList().catch(console.error);
