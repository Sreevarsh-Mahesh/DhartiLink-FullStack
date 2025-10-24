# DhartiLink - Blockchain Land Ownership Platform

A comprehensive blockchain-powered land ownership platform with NFT marketplace, ERupee payments, and MetaMask integration.

## 🌟 Features

### 🏠 Land NFT Marketplace
- **Mint Land NFTs**: Upload land documents and mint as NFTs on Sepolia testnet
- **Buy/Sell Land**: Trade land NFTs with ERupee currency
- **Portfolio Dashboard**: View owned NFTs and transaction history
- **Real-time Data**: Live blockchain data integration

### 💰 ERupee Integration
- **Custom Currency**: ERupee token for land transactions
- **Balance Tracking**: Real-time ERupee balance display
- **Secure Payments**: Blockchain-verified transactions

### 🔗 Wallet Integration
- **MetaMask Support**: Connect and manage MetaMask wallet
- **Multi-Network**: Sepolia testnet integration
- **Transaction History**: Complete transaction tracking

### 🗺️ Geospatial Features
- **Interactive Maps**: Visual land parcel representation
- **Location Verification**: Geo-linked land records
- **Spatial Data**: Precise land boundaries

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm package manager
- MetaMask browser extension
- Sepolia testnet ETH (for gas fees)

### Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd DhartiLink-main-2
```

2. **Install dependencies:**
```bash
pnpm install
```

3. **Set up environment variables:**
Create `.env.local` file:
```env
# Pinata Configuration (for IPFS)
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key

# Contract Addresses
LAND_NFT_CONTRACT_ADDRESS=0xb12ee37C49022B41760167e4D420B80EB5604268
ERUPEE_DUMMY_CONTRACT_ADDRESS=0x08001a1B010FFA09d6c2Bd331C0a3f04d175B8BE

# RPC Configuration
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com

# Private Key (for backend transactions)
PRIVATE_KEY=your_private_key

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# Public Environment Variables
NEXT_PUBLIC_LAND_NFT_CONTRACT_ADDRESS=0xb12ee37C49022B41760167e4D420B80EB5604268
NEXT_PUBLIC_ERUPEE_DUMMY_CONTRACT_ADDRESS=0x08001a1B010FFA09d6c2Bd331C0a3f04d175B8BE
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_thirdweb_client_id
```

4. **Start the development server:**
```bash
pnpm dev
```

5. **Open [http://localhost:3000](http://localhost:3000)** in your browser

## 📋 Smart Contracts

### Contract Code

The platform uses two main smart contracts:

#### ERupeeDummy.sol
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ERupeeDummy is ERC20, Ownable {
    constructor()
        ERC20("ERupee Dummy", "ERS")
        Ownable(msg.sender) // sets deployer as owner
    {
        // Mint 10,000,000,000 tokens to deployer
        _mint(msg.sender, 10_000_000_000 * 10 ** decimals());
    }

    // Optional helper: owner can mint more (demo only)
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    // Allow users to burn their tokens
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}
```

#### LandNFT.sol
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LandNFT is ERC721URIStorage, Ownable {
    uint256 public nextTokenId;
    mapping(bytes32 => bool) private existingCoordinates;

    struct LandData {
        uint256 tokenId;
        string coordinates;  // "lat1,long1,lat2,long2"
        string documentURI;  // IPFS or Supra link
        address currentOwner;
        bool listed;
        uint256 price;
    }

    mapping(uint256 => LandData) public lands;

    event LandMinted(uint256 tokenId, address owner, string coordinates);
    event LandListed(uint256 tokenId, uint256 price);
    event LandSold(uint256 tokenId, address from, address to, uint256 price);

    // ✅ FIX: Pass msg.sender to Ownable constructor
    constructor() ERC721("LandNFT", "LAND") Ownable(msg.sender) {}

    function mintLand(
        string memory coordinates,
        string memory metadataURI,
        string memory documentURI
    ) public returns (uint256) {
        bytes32 coordHash = keccak256(abi.encodePacked(coordinates));
        require(!existingCoordinates[coordHash], "Land with these coordinates already exists");

        uint256 tokenId = nextTokenId;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, metadataURI);

        lands[tokenId] = LandData({
            tokenId: tokenId,
            coordinates: coordinates,
            documentURI: documentURI,
            currentOwner: msg.sender,
            listed: false,
            price: 0
        });

        existingCoordinates[coordHash] = true;
        nextTokenId++;

        emit LandMinted(tokenId, msg.sender, coordinates);
        return tokenId;
    }

    function listLand(uint256 tokenId, uint256 price) public {
        require(ownerOf(tokenId) == msg.sender, "You don't own this land");
        require(price > 0, "Price must be greater than zero");

        lands[tokenId].listed = true;
        lands[tokenId].price = price;

        emit LandListed(tokenId, price);
    }

    function buyLand(uint256 tokenId) public payable {
        LandData storage land = lands[tokenId];
        require(land.listed, "This land is not for sale");
        require(msg.value >= land.price, "Not enough ETH sent");

        address seller = ownerOf(tokenId);
        _transfer(seller, msg.sender, tokenId);
        payable(seller).transfer(land.price);

        land.currentOwner = msg.sender;
        land.listed = false;
        land.price = 0;

        emit LandSold(tokenId, seller, msg.sender, msg.value);
    }

    function getLandDetails(uint256 tokenId)
        public
        view
        returns (LandData memory)
    {
        return lands[tokenId];
    }
}
```

### Contract Deployment

#### Option 1: Using Remix IDE (Recommended)

1. Go to [Remix IDE](https://remix.ethereum.org/)
2. Create new files: `ERupeeDummy.sol` and `LandNFT.sol`
3. Copy the contract code above
4. Install OpenZeppelin contracts: `@openzeppelin/contracts`
5. Compile contracts
6. Deploy to Sepolia testnet using MetaMask
7. Copy contract addresses to `.env.local`

#### Option 2: Using Hardhat

1. **Install Hardhat:**
```bash
npm install --save-dev hardhat @openzeppelin/contracts
npx hardhat init
```

2. **Create contract files** with the code above
3. **Deploy contracts:**
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

#### Option 3: Using Thirdweb (Marketplace)

For marketplace functionality, you can deploy using the included script:

```bash
node scripts/deploy-marketplace.js
```

### Contract Addresses

After deployment, update your `.env.local` with the deployed contract addresses:

```env
LAND_NFT_CONTRACT_ADDRESS=0x... # Your deployed LandNFT contract
ERUPEE_DUMMY_CONTRACT_ADDRESS=0x... # Your deployed ERupee contract
```

### Contract Verification

Verify contracts on Etherscan for transparency:

```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

## 🏗️ Project Structure

```
DhartiLink/
├── app/                          # Next.js app directory
│   ├── api/                     # API routes
│   │   ├── marketplace/         # Marketplace API
│   │   ├── upload/              # File upload API
│   │   └── transactions/        # Transaction API
│   ├── portfolio/               # Portfolio dashboard
│   ├── wallet/                  # Wallet page
│   └── thirdweb-marketplace/    # Thirdweb marketplace
├── components/                   # React components
│   ├── ui/                      # UI component library
│   ├── land-marketplace.tsx     # Main marketplace
│   ├── thirdweb-marketplace.tsx # Thirdweb integration
│   └── wallet-connect.tsx       # Wallet connection
├── contexts/                     # React contexts
│   ├── wallet-context.tsx       # Wallet state
│   └── purchased-lands-context.tsx # Land state
├── hooks/                        # Custom hooks
│   └── use-wallet.ts            # Wallet integration
├── scripts/                      # Deployment scripts
│   └── deploy-marketplace.js    # Marketplace deployment
└── dharti-wallet-extension/      # Browser extension
```

## 🔧 Development

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

### Key Components

#### Wallet Integration (`hooks/use-wallet.ts`)
- MetaMask provider detection
- Account connection and management
- ERupee balance fetching
- Transaction handling

#### Marketplace API (`app/api/marketplace/route.ts`)
- Fetch listed NFTs
- Handle buy/sell transactions
- ERupee balance management
- NFT metadata retrieval

#### Portfolio Dashboard (`app/portfolio/page.tsx`)
- Display owned NFTs
- Transaction history
- Real-time updates

## 🔧 Third-Party Services Setup

### Pinata IPFS Setup

Pinata is used for storing land documents and NFT metadata on IPFS:

1. **Create Pinata Account:**
   - Go to [pinata.cloud](https://pinata.cloud)
   - Sign up for a free account
   - Get your API Key and Secret Key from the dashboard

2. **Configure Environment Variables:**
   ```env
   PINATA_API_KEY=your_pinata_api_key
   PINATA_SECRET_KEY=your_pinata_secret_key
   ```

3. **How it works:**
   - When users upload land documents, they're stored on IPFS via Pinata
   - Pinata provides a gateway URL for accessing the files
   - NFT metadata includes the IPFS hash for permanent storage

### Thirdweb Integration

Thirdweb provides marketplace functionality and wallet integration:

1. **Create Thirdweb Account:**
   - Go to [thirdweb.com](https://thirdweb.com)
   - Sign up and create a new project
   - Get your Client ID from the dashboard

2. **Configure Environment Variables:**
   ```env
   NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_thirdweb_client_id
   ```

3. **How it works:**
   - Thirdweb SDK handles wallet connections
   - Provides marketplace contract deployment
   - Manages NFT metadata and transactions
   - Supports multiple wallet types (MetaMask, WalletConnect, etc.)

4. **Marketplace Deployment:**
   - Use the included script: `node scripts/deploy-marketplace.js`
   - This deploys a Thirdweb marketplace contract
   - Handles listing, buying, and selling of NFTs

### Service Integration Flow

```
User Upload → Pinata IPFS → Metadata Creation → Smart Contract Mint → Thirdweb Marketplace
```

1. **Document Upload:** User uploads land documents
2. **IPFS Storage:** Documents stored on Pinata IPFS
3. **Metadata Creation:** JSON metadata created with IPFS links
4. **NFT Minting:** LandNFT contract mints NFT with metadata
5. **Marketplace Listing:** NFT listed on Thirdweb marketplace

## 🌐 Deployment

### Vercel Deployment

1. **Push to GitHub:**
```bash
git add .
git commit -m "Deploy to Vercel"
git push origin main
```

2. **Connect to Vercel:**
- Go to [vercel.com](https://vercel.com)
- Import your GitHub repository
- Add environment variables in Vercel dashboard
- Deploy

### Environment Variables for Production

Ensure all environment variables are set in your deployment platform:

- `PINATA_API_KEY`
- `PINATA_SECRET_KEY`
- `LAND_NFT_CONTRACT_ADDRESS`
- `ERUPEE_DUMMY_CONTRACT_ADDRESS`
- `SEPOLIA_RPC_URL`
- `PRIVATE_KEY`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `NEXT_PUBLIC_*` variables

## 🔒 Security Features

- **Message Signing**: All verifications require cryptographic signatures
- **Transaction Validation**: All payments are validated on-chain
- **IPFS Storage**: Secure document storage
- **Private Key Management**: Secure backend key handling

## 🧪 Testing

### Test with Sepolia Testnet

1. Get Sepolia ETH from [faucets](https://sepoliafaucet.com/)
2. Connect MetaMask to Sepolia testnet
3. Test all features with test tokens

### Test Contracts

```bash
npx hardhat test
```

## 📚 API Documentation

### Marketplace API Endpoints

- `GET /api/marketplace?action=listed-nfts` - Get all listed NFTs
- `GET /api/marketplace?action=user-nfts&address=<address>` - Get user NFTs
- `POST /api/marketplace` - List or buy NFTs
- `GET /api/transactions?address=<address>` - Get transaction history

### Upload API

- `POST /api/upload` - Upload land documents and mint NFTs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code examples

## 🗺️ Roadmap

- [ ] Multi-chain support
- [ ] Advanced land mapping
- [ ] Mobile app development
- [ ] Integration with land registry APIs
- [ ] Enhanced security features
- [ ] Governance token integration