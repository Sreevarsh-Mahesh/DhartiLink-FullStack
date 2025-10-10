const { ethers } = require('ethers');
require('dotenv').config();

// Contract ABIs
const LandNFTABI = [
    "function mintLand(address to, string memory uri, tuple(string name, string description, uint256 size, string coordinates, string imageUrl) metadata)",
    "function listLand(uint256 tokenId, uint256 price)",
    "function owner() view returns (address)",
    "function getActiveListings() view returns (uint256[])",
    "function getListing(uint256 tokenId) view returns (tuple(uint256 tokenId, address seller, uint256 price, bool isActive, uint256 createdAt))",
    "function getLandMetadata(uint256 tokenId) view returns (tuple(string name, string description, uint256 size, string coordinates, string imageUrl))",
    "function ownerOf(uint256 tokenId) view returns (address)",
    "function listingFee() view returns (uint256)"
];

const LTTokenABI = [
    "function mint(address to, uint256 amount)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)"
];

async function createTestMarketplace() {
    try {
        // Setup provider and wallet
        const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        
        console.log('🏪 Creating test marketplace with different owners...');
        console.log('Using wallet:', wallet.address);
        
        // Connect to contracts
        const landNFTContract = new ethers.Contract(process.env.LAND_NFT_ADDRESS, LandNFTABI, wallet);
        const ltTokenContract = new ethers.Contract(process.env.LT_TOKEN_ADDRESS, LTTokenABI, wallet);
        
        // Create test addresses (simulating different users)
        // These are deterministic addresses derived from your private key
        const testAddresses = [
            ethers.computeAddress(ethers.keccak256(ethers.toUtf8Bytes("test1" + process.env.PRIVATE_KEY))),
            ethers.computeAddress(ethers.keccak256(ethers.toUtf8Bytes("test2" + process.env.PRIVATE_KEY))),
            ethers.computeAddress(ethers.keccak256(ethers.toUtf8Bytes("test3" + process.env.PRIVATE_KEY)))
        ];
        
        console.log('\n👥 Test addresses created:');
        testAddresses.forEach((addr, i) => {
            console.log(`  ${i + 1}. ${addr}`);
        });
        
        // Properties to mint for test addresses
        const testProperties = [
            {
                name: "Test Property 1 - Delhi",
                description: "Test commercial property in Delhi for purchase testing.",
                size: 4000,
                coordinates: "28.6139,77.2090",
                imageUrl: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400",
                price: ethers.parseEther("800")
            },
            {
                name: "Test Property 2 - Mumbai", 
                description: "Test residential property in Mumbai for purchase testing.",
                size: 2500,
                coordinates: "19.0760,72.8777",
                imageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400",
                price: ethers.parseEther("1500")
            },
            {
                name: "Test Property 3 - Bangalore",
                description: "Test IT property in Bangalore for purchase testing.",
                size: 6000,
                coordinates: "12.9716,77.5946", 
                imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400",
                price: ethers.parseEther("2000")
            }
        ];
        
        console.log('\n🏗️  Minting test properties...');
        
        // Mint properties for test addresses
        for (let i = 0; i < testProperties.length; i++) {
            const property = testProperties[i];
            const testAddress = testAddresses[i];
            
            try {
                console.log(`\nMinting: ${property.name}`);
                console.log(`  For: ${testAddress}`);
                
                const metadata = {
                    name: property.name,
                    description: property.description,
                    size: property.size,
                    coordinates: property.coordinates,
                    imageUrl: property.imageUrl
                };
                
                const uri = `https://api.dhartilink.com/metadata/test_${i + 1}`;
                
                // Mint the NFT
                const mintTx = await landNFTContract.mintLand(testAddress, uri, metadata);
                console.log(`  Mint transaction: ${mintTx.hash}`);
                
                const mintReceipt = await mintTx.wait();
                console.log(`  ✅ Minted! Gas used: ${mintReceipt.gasUsed.toString()}`);
                
                // Get token ID from event
                const mintEvent = mintReceipt.logs.find(log => {
                    try {
                        const decoded = landNFTContract.interface.parseLog(log);
                        return decoded.name === 'LandMinted';
                    } catch {
                        return false;
                    }
                });
                
                if (mintEvent) {
                    const decoded = landNFTContract.interface.parseLog(mintEvent);
                    const tokenId = decoded.args.tokenId.toString();
                    console.log(`  Token ID: ${tokenId}`);
                    
                    // Note: We can't list these because we don't have the private keys for test addresses
                    // In a real scenario, those addresses would list them themselves
                    console.log(`  💡 Property minted to ${testAddress}`);
                    console.log(`  ⚠️  Cannot list for sale (need private key of ${testAddress})`);
                }
                
                console.log('');
                
                // Wait between transactions
                await new Promise(resolve => setTimeout(resolve, 3000));
                
            } catch (error) {
                console.error(`  ❌ Error minting ${property.name}:`, error.message);
            }
        }
        
        console.log('\n📋 Current marketplace state:');
        const activeListings = await landNFTContract.getActiveListings();
        console.log(`Active listings: ${activeListings.length}`);
        
        for (const tokenId of activeListings) {
            const listing = await landNFTContract.getListing(tokenId);
            const metadata = await landNFTContract.getLandMetadata(tokenId);
            const owner = await landNFTContract.ownerOf(tokenId);
            console.log(`  Token ID ${tokenId}: ${metadata.name} - ${ethers.formatEther(listing.price)} LT (Owner: ${owner})`);
        }
        
        console.log('\n🎉 Test marketplace created!');
        console.log('💡 Note: The test properties are owned by different addresses');
        console.log('💡 To list them for sale, you would need access to those private keys');
        console.log('💡 For now, you can test with the existing listings (which you own)');
        
    } catch (error) {
        console.error('❌ Script failed:', error);
    }
}

// Run the script
createTestMarketplace().catch(console.error);
