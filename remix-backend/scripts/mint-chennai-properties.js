const { ethers } = require('ethers');
require('dotenv').config();

// Contract ABIs
const LandNFTABI = [
    "function mintLand(address to, string memory uri, tuple(string name, string description, uint256 size, string coordinates, string imageUrl) metadata)",
    "function listLand(uint256 tokenId, uint256 price)",
    "function owner() view returns (address)",
    "function addMinter(address minter)"
];

const LTTokenABI = [
    "function addMinter(address minter)",
    "function mint(address to, uint256 amount)"
];

async function mintChennaiProperties() {
    try {
        // Setup provider and wallet
        const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        
        console.log('Using wallet:', wallet.address);
        
        // Connect to contracts
        const landNFTContract = new ethers.Contract(process.env.LAND_NFT_ADDRESS, LandNFTABI, wallet);
        const ltTokenContract = new ethers.Contract(process.env.LT_TOKEN_ADDRESS, LTTokenABI, wallet);
        
        console.log('Connected to contracts:');
        console.log('Land NFT:', process.env.LAND_NFT_ADDRESS);
        console.log('LT Token:', process.env.LT_TOKEN_ADDRESS);
        
        // Check if we're the owner of the NFT contract
        const owner = await landNFTContract.owner();
        console.log('NFT Contract Owner:', owner);
        
        if (owner.toLowerCase() !== wallet.address.toLowerCase()) {
            console.log('❌ Not the owner of the NFT contract. Cannot mint.');
            return;
        }
        
        // Chennai properties to mint (size in square meters)
        const chennaiProperties = [
            {
                name: "Chennai IT Corridor - Phase 1",
                description: "Premium commercial land in Chennai IT corridor with excellent connectivity to airport and city center.",
                size: 9308, // 2.3 acres in square meters
                coordinates: "13.0827,80.2707",
                imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400",
                price: ethers.parseEther("1000") // 1000 LT tokens
            },
            {
                name: "Chennai Marina Beach Plot",
                description: "Exclusive beachfront property with stunning sea views and premium location.",
                size: 3237, // 0.8 acres in square meters
                coordinates: "13.0418,80.2341",
                imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400",
                price: ethers.parseEther("2000") // 2000 LT tokens
            },
            {
                name: "Chennai Industrial Estate",
                description: "Large industrial plot in Chennai industrial estate with all utilities and transport links.",
                size: 29137, // 7.2 acres in square meters
                coordinates: "13.0604,80.2496",
                imageUrl: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400",
                price: ethers.parseEther("500") // 500 LT tokens
            },
            {
                name: "Chennai Residential Complex",
                description: "Modern residential plot in planned township with all amenities and security.",
                size: 5666, // 1.4 acres in square meters
                coordinates: "13.0067,80.2206",
                imageUrl: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400",
                price: ethers.parseEther("1500") // 1500 LT tokens
            },
            {
                name: "Chennai Tech Park Land",
                description: "Strategic land for tech park development with excellent infrastructure.",
                size: 12545, // 3.1 acres in square meters
                coordinates: "13.0827,80.2707",
                imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400",
                price: ethers.parseEther("800") // 800 LT tokens
            }
        ];
        
        console.log('\n🚀 Starting to mint Chennai properties...\n');
        
        for (let i = 0; i < chennaiProperties.length; i++) {
            const property = chennaiProperties[i];
            console.log(`Minting property ${i + 1}: ${property.name}`);
            
            try {
                // Create metadata object
                const metadata = {
                    name: property.name,
                    description: property.description,
                    size: property.size,
                    coordinates: property.coordinates,
                    imageUrl: property.imageUrl
                };
                
                // Create URI (in a real app, this would be an IPFS hash)
                const uri = `https://api.dhartilink.com/metadata/${i + 1}`;
                
                // Mint the NFT
                const mintTx = await landNFTContract.mintLand(wallet.address, uri, metadata);
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
                    
                    // List the land for sale
                    console.log(`  Listing for ${ethers.formatEther(property.price)} LT tokens...`);
                    const listTx = await landNFTContract.listLand(tokenId, property.price);
                    console.log(`  List transaction sent: ${listTx.hash}`);
                    
                    const listReceipt = await listTx.wait();
                    console.log(`  ✅ Listed! Gas used: ${listReceipt.gasUsed.toString()}`);
                    
                    console.log(`  🎉 Successfully minted and listed: ${property.name}`);
                } else {
                    console.log(`  ⚠️  Could not find token ID from mint event`);
                }
                
                console.log(''); // Empty line for readability
                
                // Wait a bit between transactions to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 2000));
                
            } catch (error) {
                console.error(`  ❌ Error minting ${property.name}:`, error.message);
            }
        }
        
        console.log('🎉 Finished minting Chennai properties!');
        
    } catch (error) {
        console.error('❌ Script failed:', error);
    }
}

// Run the script
mintChennaiProperties().catch(console.error);
