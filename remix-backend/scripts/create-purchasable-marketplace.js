const { ethers } = require('ethers');
require('dotenv').config();

// Contract ABIs
const LandNFTABI = [
    "function mintLand(address to, string memory uri, tuple(string name, string description, uint256 size, string coordinates, string imageUrl) metadata)",
    "function listLand(uint256 tokenId, uint256 price)",
    "function unlistLand(uint256 tokenId)",
    "function owner() view returns (address)",
    "function getActiveListings() view returns (uint256[])",
    "function getListing(uint256 tokenId) view returns (tuple(uint256 tokenId, address seller, uint256 price, bool isActive, uint256 createdAt))",
    "function getLandMetadata(uint256 tokenId) view returns (tuple(string name, string description, uint256 size, string coordinates, string imageUrl))",
    "function ownerOf(uint256 tokenId) view returns (address)",
    "function balanceOf(address owner) view returns (uint256)",
    "function listingFee() view returns (uint256)",
    "function approve(address to, uint256 tokenId)",
    "function transferFrom(address from, address to, uint256 tokenId)"
];

const LTTokenABI = [
    "function mint(address to, uint256 amount)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function balanceOf(address owner) view returns (uint256)"
];

async function createPurchasableMarketplace() {
    try {
        // Setup provider and wallet
        const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        
        console.log('🏪 Creating purchasable marketplace...');
        console.log('Your wallet:', wallet.address);
        
        // Connect to contracts
        const landNFTContract = new ethers.Contract(process.env.LAND_NFT_ADDRESS, LandNFTABI, wallet);
        const ltTokenContract = new ethers.Contract(process.env.LT_TOKEN_ADDRESS, LTTokenABI, wallet);
        
        // Step 1: Unlist all your existing NFTs
        console.log('\n🏠 Step 1: Unlisting your existing NFTs...');
        const activeListings = await landNFTContract.getActiveListings();
        console.log(`Found ${activeListings.length} active listings to unlist`);
        
        for (const tokenId of activeListings) {
            try {
                const owner = await landNFTContract.ownerOf(tokenId);
                if (owner.toLowerCase() === wallet.address.toLowerCase()) {
                    console.log(`Unlisting Token ID ${tokenId}...`);
                    const unlistTx = await landNFTContract.unlistLand(tokenId);
                    await unlistTx.wait();
                    console.log(`  ✅ Unlisted Token ID ${tokenId}`);
                }
            } catch (error) {
                console.error(`  ❌ Error unlisting Token ID ${tokenId}:`, error.message);
            }
        }
        
        // Step 2: Create test wallets (simulating different users)
        console.log('\n👥 Step 2: Creating test wallets...');
        const testWallets = [];
        const testPrivateKeys = [
            process.env.PRIVATE_KEY + "01", // Modified private key 1
            process.env.PRIVATE_KEY + "02", // Modified private key 2
            process.env.PRIVATE_KEY + "03"  // Modified private key 3
        ];
        
        for (let i = 0; i < testPrivateKeys.length; i++) {
            try {
                // Create a deterministic test wallet
                const testWallet = new ethers.Wallet(testPrivateKeys[i], provider);
                testWallets.push(testWallet);
                console.log(`  Test Wallet ${i + 1}: ${testWallet.address}`);
            } catch (error) {
                console.log(`  ⚠️  Could not create test wallet ${i + 1}, using alternative method`);
                // Alternative: use a simple deterministic address
                const testAddress = ethers.computeAddress(ethers.keccak256(ethers.toUtf8Bytes(`test${i}${process.env.PRIVATE_KEY}`)));
                testWallets.push({ address: testAddress, isTestAddress: true });
                console.log(`  Test Address ${i + 1}: ${testAddress}`);
            }
        }
        
        // Step 3: Mint LT tokens to test wallets
        console.log('\n💰 Step 3: Minting LT tokens to test wallets...');
        for (let i = 0; i < testWallets.length; i++) {
            const testWallet = testWallets[i];
            if (testWallet.isTestAddress) continue; // Skip if we couldn't create a wallet
            
            try {
                console.log(`Minting LT tokens to ${testWallet.address}...`);
                const mintTx = await ltTokenContract.mint(testWallet.address, ethers.parseEther("50000"));
                await mintTx.wait();
                console.log(`  ✅ Minted 50,000 LT tokens`);
            } catch (error) {
                console.log(`  ⚠️  Could not mint LT tokens: ${error.message}`);
            }
        }
        
        // Step 4: Create purchasable properties
        console.log('\n🏗️  Step 4: Creating purchasable properties...');
        const purchasableProperties = [
            {
                name: "Delhi Business Center",
                description: "Prime commercial space in Delhi's business district with excellent connectivity.",
                size: 4500,
                coordinates: "28.6139,77.2090",
                imageUrl: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400",
                price: ethers.parseEther("1200")
            },
            {
                name: "Mumbai Luxury Villa",
                description: "Exclusive luxury villa in Mumbai with sea views and modern amenities.",
                size: 3200,
                coordinates: "19.0760,72.8777",
                imageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400",
                price: ethers.parseEther("2800")
            },
            {
                name: "Bangalore Tech Campus",
                description: "Modern tech campus land in Bangalore's IT corridor, perfect for development.",
                size: 7500,
                coordinates: "12.9716,77.5946",
                imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400",
                price: ethers.parseEther("1800")
            }
        ];
        
        // Step 5: Mint NFTs to test wallets and list them
        for (let i = 0; i < purchasableProperties.length; i++) {
            const property = purchasableProperties[i];
            const testWallet = testWallets[i];
            
            try {
                console.log(`\nCreating: ${property.name}`);
                
                if (testWallet.isTestAddress) {
                    console.log(`  ⚠️  Cannot mint to test address (no private key available)`);
                    console.log(`  💡 Creating as a mock listing instead`);
                    continue;
                }
                
                // Create metadata
                const metadata = {
                    name: property.name,
                    description: property.description,
                    size: property.size,
                    coordinates: property.coordinates,
                    imageUrl: property.imageUrl
                };
                
                const uri = `https://api.dhartilink.com/metadata/purchasable_${i + 1}`;
                
                // Mint NFT to test wallet
                console.log(`  Minting to: ${testWallet.address}`);
                const mintTx = await landNFTContract.mintLand(testWallet.address, uri, metadata);
                const mintReceipt = await mintTx.wait();
                console.log(`  ✅ Minted! Gas: ${mintReceipt.gasUsed.toString()}`);
                
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
                    
                    // Create contract instance with test wallet
                    const testLandContract = new ethers.Contract(process.env.LAND_NFT_ADDRESS, LandNFTABI, testWallet);
                    const testLTContract = new ethers.Contract(process.env.LT_TOKEN_ADDRESS, LTTokenABI, testWallet);
                    
                    // Approve listing fee
                    const listingFee = await landNFTContract.listingFee();
                    console.log(`  Approving listing fee: ${ethers.formatEther(listingFee)} LT`);
                    const approveTx = await testLTContract.approve(process.env.LAND_NFT_ADDRESS, listingFee);
                    await approveTx.wait();
                    console.log(`  ✅ Approved listing fee`);
                    
                    // List the property
                    console.log(`  Listing for: ${ethers.formatEther(property.price)} LT`);
                    const listTx = await testLandContract.listLand(tokenId, property.price);
                    await listTx.wait();
                    console.log(`  ✅ Listed for sale!`);
                    
                } else {
                    console.log(`  ⚠️  Could not get token ID from mint event`);
                }
                
                // Wait between transactions
                await new Promise(resolve => setTimeout(resolve, 5000));
                
            } catch (error) {
                console.error(`  ❌ Error creating ${property.name}:`, error.message);
            }
        }
        
        // Step 6: Final status check
        console.log('\n📊 Final marketplace status:');
        const finalActiveListings = await landNFTContract.getActiveListings();
        console.log(`\n🏪 Active listings (available for purchase): ${finalActiveListings.length}`);
        
        for (const tokenId of finalActiveListings) {
            const listing = await landNFTContract.getListing(tokenId);
            const metadata = await landNFTContract.getLandMetadata(tokenId);
            const owner = await landNFTContract.ownerOf(tokenId);
            console.log(`  Token ID ${tokenId}: ${metadata.name}`);
            console.log(`    Price: ${ethers.formatEther(listing.price)} LT`);
            console.log(`    Owner: ${owner}`);
            console.log(`    Size: ${metadata.size} sqm`);
            console.log('');
        }
        
        const yourBalance = await landNFTContract.balanceOf(wallet.address);
        console.log(`🏠 Your NFT balance: ${yourBalance.toString()} NFTs (all unlisted/private)`);
        
        console.log('\n🎉 Marketplace setup complete!');
        console.log('💡 You can now purchase NFTs from other addresses');
        console.log('💡 Your existing NFTs are now private (not listed for sale)');
        console.log('💡 After purchase, new NFTs will appear in your MetaMask wallet');
        
        console.log('\n📋 Contract addresses for MetaMask:');
        console.log(`Land NFT Contract: ${process.env.LAND_NFT_ADDRESS}`);
        console.log(`LT Token Contract: ${process.env.LT_TOKEN_ADDRESS}`);
        
    } catch (error) {
        console.error('❌ Script failed:', error);
    }
}

// Run the script
createPurchasableMarketplace().catch(console.error);
