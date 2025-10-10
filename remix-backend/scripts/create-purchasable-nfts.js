const { ethers } = require('ethers');
require('dotenv').config();

// Contract ABIs
const LandNFTABI = [
    "function mintLand(address to, string memory uri, tuple(string name, string description, uint256 size, string coordinates, string imageUrl) metadata)",
    "function listLand(uint256 tokenId, uint256 price)",
    "function owner() view returns (address)",
    "function addMinter(address minter)",
    "function getActiveListings() view returns (uint256[])",
    "function getListing(uint256 tokenId) view returns (tuple(uint256 tokenId, address seller, uint256 price, bool isActive, uint256 createdAt))",
    "function getLandMetadata(uint256 tokenId) view returns (tuple(string name, string description, uint256 size, string coordinates, string imageUrl))",
    "function ownerOf(uint256 tokenId) view returns (address)",
    "function balanceOf(address owner) view returns (uint256)"
];

const LTTokenABI = [
    "function addMinter(address minter)",
    "function mint(address to, uint256 amount)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)"
];

async function createPurchasableNFTs() {
    try {
        // Setup provider and wallet
        const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        
        console.log('🔧 Creating NFTs for purchase testing...');
        console.log('Using wallet:', wallet.address);
        
        // Connect to contracts
        const landNFTContract = new ethers.Contract(process.env.LAND_NFT_ADDRESS, LandNFTABI, wallet);
        const ltTokenContract = new ethers.Contract(process.env.LT_TOKEN_ADDRESS, LTTokenABI, wallet);
        
        // Create some test addresses (these are just for demonstration)
        // In a real scenario, these would be actual other users
        const testAddresses = [
            '0x742d35Cc6634C0532925a3b8D0C4C4C4C4C4C4C4', // Test address 1
            '0x8a3b8D0C4C4C4C4C4C4C4C4C4C4C4C4C4C4C4C4C4', // Test address 2
            '0x9b4c5D6E7F8A9B0C1D2E3F4A5B6C7D8E9F0A1B2C3'  // Test address 3
        ];
        
        // Properties to mint for other addresses
        const properties = [
            {
                name: "Delhi Commercial Hub",
                description: "Prime commercial land in Delhi with excellent connectivity and business opportunities.",
                size: 5000, // 1.2 acres in sqm
                coordinates: "28.6139,77.2090",
                imageUrl: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400",
                price: ethers.parseEther("1200") // 1200 LT tokens
            },
            {
                name: "Mumbai Residential Plot",
                description: "Luxury residential plot in Mumbai with modern amenities and sea view.",
                size: 3000, // 0.7 acres in sqm
                coordinates: "19.0760,72.8777",
                imageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400",
                price: ethers.parseEther("2500") // 2500 LT tokens
            },
            {
                name: "Bangalore IT Park Land",
                description: "Strategic land for IT park development in Bangalore's tech corridor.",
                size: 8000, // 2.0 acres in sqm
                coordinates: "12.9716,77.5946",
                imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400",
                price: ethers.parseEther("1800") // 1800 LT tokens
            }
        ];
        
        console.log('\n🚀 Minting properties for other addresses...\n');
        
        // Mint properties for test addresses (simulating other users)
        for (let i = 0; i < properties.length; i++) {
            const property = properties[i];
            const testAddress = testAddresses[i];
            
            console.log(`Minting property ${i + 1}: ${property.name}`);
            console.log(`  For address: ${testAddress}`);
            
            try {
                // Create metadata object
                const metadata = {
                    name: property.name,
                    description: property.description,
                    size: property.size,
                    coordinates: property.coordinates,
                    imageUrl: property.imageUrl
                };
                
                // Create URI
                const uri = `https://api.dhartilink.com/metadata/${i + 10}`; // Use different IDs
                
                // Mint the NFT to the test address
                const mintTx = await landNFTContract.mintLand(testAddress, uri, metadata);
                console.log(`  Mint transaction sent: ${mintTx.hash}`);
                
                // Wait for confirmation
                const mintReceipt = await mintTx.wait();
                console.log(`  ✅ Minted! Gas used: ${mintReceipt.gasUsed.toString()}`);
                
                // Get the token ID from the event
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
                    
                    // For demonstration, we'll list these as if the test address listed them
                    // But since we can't sign transactions for other addresses, we'll skip listing
                    console.log(`  ⚠️  Note: These NFTs are minted to other addresses`);
                    console.log(`  💡 In a real scenario, those users would list them for sale`);
                    
                    console.log(`  🎉 Successfully minted: ${property.name}`);
                } else {
                    console.log(`  ⚠️  Could not find token ID from mint event`);
                }
                
                console.log(''); // Empty line for readability
                
                // Wait a bit between transactions
                await new Promise(resolve => setTimeout(resolve, 3000));
                
            } catch (error) {
                console.error(`  ❌ Error minting ${property.name}:`, error.message);
            }
        }
        
        // Also mint one more property to your own address but don't list it
        console.log('\n🏠 Minting one property for you (not listed for sale)...');
        const yourProperty = {
            name: "Private Chennai Estate",
            description: "Your private estate in Chennai - not for sale.",
            size: 4000,
            coordinates: "13.0827,80.2707",
            imageUrl: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400"
        };
        
        try {
            const metadata = {
                name: yourProperty.name,
                description: yourProperty.description,
                size: yourProperty.size,
                coordinates: yourProperty.coordinates,
                imageUrl: yourProperty.imageUrl
            };
            
            const uri = `https://api.dhartilink.com/metadata/private`;
            const mintTx = await landNFTContract.mintLand(wallet.address, uri, metadata);
            console.log(`Mint transaction sent: ${mintTx.hash}`);
            
            const mintReceipt = await mintTx.wait();
            console.log(`✅ Private property minted! Gas used: ${mintReceipt.gasUsed.toString()}`);
            console.log('💡 This property is NOT listed for sale - it\'s private');
            
        } catch (error) {
            console.error(`❌ Error minting private property:`, error.message);
        }
        
        console.log('\n📋 Current active listings:');
        const activeListings = await landNFTContract.getActiveListings();
        console.log(`Found ${activeListings.length} active listings:`);
        
        for (const tokenId of activeListings) {
            const listing = await landNFTContract.getListing(tokenId);
            const metadata = await landNFTContract.getLandMetadata(tokenId);
            const owner = await landNFTContract.ownerOf(tokenId);
            console.log(`  Token ID ${tokenId}: ${metadata.name} - ${ethers.formatEther(listing.price)} LT (Owner: ${owner})`);
        }
        
        console.log('\n🎉 Setup complete!');
        console.log('💡 Note: To test purchasing, you would need other users to list their NFTs for sale');
        console.log('💡 For now, you can test with the existing listings, but remember you own them all');
        
    } catch (error) {
        console.error('❌ Script failed:', error);
    }
}

// Run the script
createPurchasableNFTs().catch(console.error);
