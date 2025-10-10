const { ethers } = require('ethers');
require('dotenv').config();

// Contract ABIs
const LandNFTABI = [
    "function unlistLand(uint256 tokenId)",
    "function getActiveListings() view returns (uint256[])",
    "function getListing(uint256 tokenId) view returns (tuple(uint256 tokenId, address seller, uint256 price, bool isActive, uint256 createdAt))",
    "function getLandMetadata(uint256 tokenId) view returns (tuple(string name, string description, uint256 size, string coordinates, string imageUrl))",
    "function ownerOf(uint256 tokenId) view returns (address)",
    "function balanceOf(address owner) view returns (uint256)",
    "function mintLand(address to, string memory uri, tuple(string name, string description, uint256 size, string coordinates, string imageUrl) metadata)",
    "function listLand(uint256 tokenId, uint256 price)"
];

const LTTokenABI = [
    "function approve(address spender, uint256 amount) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)"
];

async function fixMarketplace() {
    try {
        // Setup provider and wallet
        const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        
        console.log('🔧 Fixing marketplace for purchase testing...');
        console.log('Using wallet:', wallet.address);
        
        // Connect to contracts
        const landNFTContract = new ethers.Contract(process.env.LAND_NFT_ADDRESS, LandNFTABI, wallet);
        const ltTokenContract = new ethers.Contract(process.env.LT_TOKEN_ADDRESS, LTTokenABI, wallet);
        
        console.log('\n📋 Current active listings:');
        const activeListings = await landNFTContract.getActiveListings();
        console.log(`Found ${activeListings.length} active listings:`);
        
        for (const tokenId of activeListings) {
            const listing = await landNFTContract.getListing(tokenId);
            const metadata = await landNFTContract.getLandMetadata(tokenId);
            const owner = await landNFTContract.ownerOf(tokenId);
            console.log(`  Token ID ${tokenId}: ${metadata.name} - ${ethers.formatEther(listing.price)} LT (Owner: ${owner})`);
        }
        
        // Solution 1: Unlist some NFTs so they're not for sale
        console.log('\n🏠 Unlisting some NFTs to create private properties...');
        
        const tokensToUnlist = [3, 4]; // Unlist tokens 3 and 4
        
        for (const tokenId of tokensToUnlist) {
            try {
                console.log(`\nUnlisting Token ID ${tokenId}...`);
                
                const unlistTx = await landNFTContract.unlistLand(tokenId);
                await unlistTx.wait();
                console.log(`  ✅ Unlisted token ${tokenId}`);
                
                const metadata = await landNFTContract.getLandMetadata(tokenId);
                console.log(`  Property: ${metadata.name} is now private`);
                
            } catch (error) {
                console.error(`  ❌ Error unlisting token ${tokenId}:`, error.message);
            }
        }
        
        // Solution 2: Create new NFTs that are not listed
        console.log('\n🏗️  Creating new NFTs that are not listed for sale...');
        
        const newProperties = [
            {
                name: "Private Delhi Estate",
                description: "Exclusive private estate in Delhi - not for sale.",
                size: 6000,
                coordinates: "28.6139,77.2090",
                imageUrl: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400"
            },
            {
                name: "Private Mumbai Villa",
                description: "Luxury private villa in Mumbai - not for sale.",
                size: 3500,
                coordinates: "19.0760,72.8777",
                imageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400"
            }
        ];
        
        for (let i = 0; i < newProperties.length; i++) {
            const property = newProperties[i];
            
            try {
                console.log(`\nMinting: ${property.name}...`);
                
                const metadata = {
                    name: property.name,
                    description: property.description,
                    size: property.size,
                    coordinates: property.coordinates,
                    imageUrl: property.imageUrl
                };
                
                const uri = `https://api.dhartilink.com/metadata/private_${i + 1}`;
                const mintTx = await landNFTContract.mintLand(wallet.address, uri, metadata);
                await mintTx.wait();
                
                console.log(`  ✅ Minted: ${property.name}`);
                console.log(`  💡 This property is NOT listed for sale - it's private`);
                
            } catch (error) {
                console.error(`  ❌ Error minting ${property.name}:`, error.message);
            }
        }
        
        // Check final state
        console.log('\n📊 Final marketplace state:');
        const finalActiveListings = await landNFTContract.getActiveListings();
        console.log(`Active listings: ${finalActiveListings.length}`);
        
        const balance = await landNFTContract.balanceOf(wallet.address);
        console.log(`Total NFTs owned: ${balance.toString()}`);
        
        console.log('\n📋 Remaining active listings (available for purchase):');
        for (const tokenId of finalActiveListings) {
            const listing = await landNFTContract.getListing(tokenId);
            const metadata = await landNFTContract.getLandMetadata(tokenId);
            console.log(`  Token ID ${tokenId}: ${metadata.name} - ${ethers.formatEther(listing.price)} LT`);
        }
        
        console.log('\n🎉 Marketplace fixed!');
        console.log('💡 You now have:');
        console.log(`  - ${finalActiveListings.length} NFTs listed for sale (you can try to purchase these)`);
        console.log(`  - ${balance.toString() - finalActiveListings.length} private NFTs (not for sale)`);
        console.log('⚠️  Note: You still own all NFTs, so you cannot purchase them');
        console.log('💡 To test purchasing, you would need NFTs owned by other addresses');
        
    } catch (error) {
        console.error('❌ Script failed:', error);
    }
}

// Run the script
fixMarketplace().catch(console.error);
