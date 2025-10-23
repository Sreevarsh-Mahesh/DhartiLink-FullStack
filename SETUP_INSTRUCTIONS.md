# DhartiLink - Land NFT Marketplace Setup Instructions

## Overview

DhartiLink is a comprehensive land ownership platform that allows users to:
- Upload land documents and mint them as NFTs
- Trade land NFTs using ERupeeDummy tokens
- Verify land ownership on the blockchain
- View interactive 3D maps of land parcels

## Prerequisites

1. **Node.js** (v18 or higher)
2. **pnpm** package manager
3. **MetaMask** wallet extension
4. **Sepolia testnet** access
5. **Pinata account** for IPFS storage

## Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```env
# Pinata Configuration
PINATA_API_KEY=your_pinata_api_key_here
PINATA_SECRET_KEY=your_pinata_secret_key_here

# Smart Contract Addresses (Sepolia Testnet)
LAND_NFT_CONTRACT_ADDRESS=your_land_nft_contract_address_here
ERUPEE_DUMMY_CONTRACT_ADDRESS=your_erupee_dummy_contract_address_here

# RPC Configuration
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your_infura_project_id
# Alternative: https://rpc.sepolia.org

# Private Key for Contract Interactions (Use a dedicated wallet for backend)
PRIVATE_KEY=your_private_key_here

# Next.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here
```

## Getting Started

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Set Up Pinata Account

1. Go to [Pinata.cloud](https://pinata.cloud)
2. Create an account and get your API keys
3. Add the keys to your `.env.local` file

### 3. Deploy Smart Contracts

You need to deploy two smart contracts on Sepolia testnet:

#### LandNFT Contract (ERC-721)
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LandNFT is ERC721, Ownable {
    struct LandData {
        uint256 lat;
        uint256 lon;
        string documentURI;
        string metadataURI;
    }
    
    mapping(uint256 => LandData) public landData;
    uint256 private _tokenIdCounter;
    
    constructor() ERC721("LandNFT", "LAND") Ownable(msg.sender) {}
    
    function mint(address to, string memory metadataURI, uint256 lat, uint256 lon) 
        external onlyOwner returns (uint256) {
        uint256 tokenId = _tokenIdCounter++;
        _mint(to, tokenId);
        
        landData[tokenId] = LandData({
            lat: lat,
            lon: lon,
            documentURI: "",
            metadataURI: metadataURI
        });
        
        return tokenId;
    }
    
    function getLandCoordinates(uint256 tokenId) external view returns (uint256 lat, uint256 lon) {
        LandData memory data = landData[tokenId];
        return (data.lat, data.lon);
    }
    
    function getLandMetadata(uint256 tokenId) external view returns (string memory) {
        return landData[tokenId].metadataURI;
    }
}
```

#### ERupeeDummy Contract (ERC-20)
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ERupeeDummy is ERC20, Ownable {
    constructor() ERC20("ERupeeDummy", "ERUPEE") Ownable(msg.sender) {
        _mint(msg.sender, 1000000 * 10**decimals()); // Mint 1M tokens
    }
    
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
```

### 4. Get Sepolia ETH

1. Use [Sepolia Faucet](https://sepoliafaucet.com/) to get test ETH
2. Deploy your contracts using Remix IDE or Hardhat
3. Update the contract addresses in `.env.local`

### 5. Run the Development Server

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

## Features

### 1. Land Document Upload & NFT Minting

- **Location**: `/upload` page or "Upload & Mint" tab in verification
- **Features**:
  - Drag & drop file upload (PDF, JPEG, PNG)
  - Coordinate input with current location detection
  - Automatic IPFS upload via Pinata
  - Metadata generation and upload
  - NFT minting on LandNFT contract

### 2. Land NFT Marketplace

- **Location**: `/marketplace` page or "Marketplace" tab
- **Features**:
  - Browse available land NFTs
  - Buy NFTs using ERupeeDummy tokens
  - List your NFTs for sale
  - Cancel listings
  - View marketplace statistics

### 3. Land Ownership Verification

- **Location**: "Verify Ownership" tab in verification
- **Features**:
  - Search land records by ID
  - Verify ownership with wallet signature
  - View transaction history

### 4. Portfolio Management

- **Location**: `/portfolio` page or "Portfolio" tab
- **Features**:
  - View owned land NFTs
  - Track investment performance
  - Interactive 3D map visualization

## API Endpoints

### Upload & Mint NFT
```
POST /api/upload
Content-Type: multipart/form-data

Parameters:
- file: Land document file
- latitude: Land latitude coordinate
- longitude: Land longitude coordinate
- ownerAddress: Wallet address of the owner

Response:
{
  "success": true,
  "data": {
    "tokenId": "1",
    "transactionHash": "0x...",
    "metadataURI": "https://gateway.pinata.cloud/ipfs/...",
    "documentURI": "https://gateway.pinata.cloud/ipfs/...",
    "coordinates": { "latitude": 28.6139, "longitude": 77.2090 },
    "owner": "0x..."
  }
}
```

### Marketplace Operations
```
GET /api/marketplace?action=balance&address=0x...
GET /api/marketplace?action=nft-details&tokenId=1

POST /api/marketplace
{
  "action": "list|buy",
  "tokenId": "1",
  "price": "1000",
  "sellerAddress|buyerAddress": "0x..."
}
```

## Smart Contract Integration

The application integrates with two main smart contracts:

### LandNFT Contract
- **Purpose**: Represents land parcels as NFTs
- **Key Functions**:
  - `mint()`: Create new land NFT
  - `getLandCoordinates()`: Get land coordinates
  - `getLandMetadata()`: Get metadata URI

### ERupeeDummy Contract
- **Purpose**: Fungible token for marketplace transactions
- **Key Functions**:
  - `transfer()`: Transfer tokens
  - `balanceOf()`: Check balance
  - `approve()`: Approve spending

## File Structure

```
├── app/
│   ├── api/
│   │   ├── upload/route.ts          # File upload & NFT minting
│   │   └── marketplace/route.ts     # Marketplace operations
│   ├── upload/page.tsx              # Upload page
│   ├── marketplace/page.tsx         # Marketplace page
│   └── portfolio/page.tsx           # Portfolio page
├── components/
│   ├── land-upload.tsx              # Upload component
│   ├── land-marketplace-enhanced.tsx # Marketplace component
│   └── land-verification.tsx        # Verification component
├── lib/
│   └── contracts.ts                 # Contract utilities
└── contexts/
    └── wallet-context.tsx           # Wallet management
```

## Troubleshooting

### Common Issues

1. **"Private key not configured"**
   - Ensure `PRIVATE_KEY` is set in `.env.local`
   - Use a dedicated wallet for backend operations

2. **"Pinata upload failed"**
   - Check your Pinata API keys
   - Ensure you have sufficient Pinata credits

3. **"Failed to mint NFT"**
   - Verify contract address is correct
   - Ensure you have Sepolia ETH for gas fees
   - Check if the contract is deployed and accessible

4. **"Insufficient ERupee balance"**
   - Mint ERupeeDummy tokens using the contract
   - Check token balance in marketplace

### Development Tips

1. **Testing**: Use Sepolia testnet for all testing
2. **Gas Fees**: Keep some Sepolia ETH for transaction fees
3. **File Uploads**: Test with small files first
4. **Coordinates**: Use valid latitude/longitude values

## Security Considerations

1. **Private Keys**: Never commit private keys to version control
2. **API Keys**: Keep Pinata API keys secure
3. **Contract Verification**: Verify contracts on Etherscan
4. **Input Validation**: All user inputs are validated
5. **File Uploads**: File types and sizes are restricted

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the console logs for errors
3. Ensure all environment variables are set correctly
4. Verify smart contracts are deployed and accessible

## License

This project is for demonstration purposes. Please ensure compliance with local regulations when dealing with real land ownership.
