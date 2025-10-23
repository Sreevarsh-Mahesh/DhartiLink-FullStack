# Thirdweb Marketplace Setup Guide

## 🚀 Quick Start

Your DhartiLink application now includes a powerful Thirdweb-powered marketplace! Here's how to get it running:

### 1. Get Thirdweb Client ID

1. Go to [Thirdweb Dashboard](https://thirdweb.com/dashboard)
2. Create a new project or use existing one
3. Copy your **Client ID** from the project settings
4. Add it to your `.env.local` file:

```bash
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_actual_client_id_here
```

### 2. Deploy Marketplace Contract (Optional)

If you want to use a dedicated marketplace contract:

```bash
# Install dependencies
pnpm install

# Deploy marketplace contract
node scripts/deploy-marketplace.js
```

This will deploy a marketplace contract and give you the address to add to your `.env.local`:

```bash
NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS=deployed_contract_address_here
```

### 3. Access the Marketplace

- **Main App**: Visit `http://localhost:3000` and click the "Thirdweb" tab
- **Direct Access**: Visit `http://localhost:3000/thirdweb-marketplace`

## 🎯 Features Included

### ✅ **Built-in Features:**
- **Wallet Connection** - Connect with MetaMask, WalletConnect, and more
- **NFT Display** - Beautiful cards showing your land NFTs
- **Real-time Data** - Fetches NFTs directly from your contract
- **Responsive Design** - Works on all devices
- **Sound Effects** - Interactive audio feedback

### ✅ **Marketplace Functions:**
- **Browse NFTs** - View all available land NFTs
- **Buy NFTs** - Purchase land NFTs with ETH
- **List NFTs** - List your own NFTs for sale
- **Mint New Land** - Link to upload page for minting

### ✅ **Thirdweb Integration:**
- **Automatic Contract Detection** - Uses your deployed LandNFT contract
- **Event Listening** - Real-time updates from blockchain
- **Gas Optimization** - Built-in gas estimation
- **Error Handling** - Robust error management

## 🔧 Configuration

### Environment Variables

Add these to your `.env.local`:

```bash
# Thirdweb Configuration
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_thirdweb_client_id
NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS=your_marketplace_contract_address

# Your existing contract
NEXT_PUBLIC_LAND_NFT_CONTRACT_ADDRESS=0xb12ee37C49022B41760167e4D420B80EB5604268
```

### Contract Integration

The marketplace automatically uses your existing LandNFT contract:
- **Contract Address**: `0xb12ee37C49022B41760167e4D420B80EB5604268`
- **Network**: Sepolia Testnet
- **Standard**: ERC-721

## 🎨 Customization

### Styling
The marketplace uses your existing design system:
- **Theme**: Dark mode with amber accents
- **Components**: Radix UI components
- **Animations**: Smooth transitions and hover effects

### Functionality
Easy to extend with:
- **Custom Hooks**: Use Thirdweb's React hooks
- **Contract Methods**: Call any contract function
- **Event Listeners**: Listen to blockchain events
- **Metadata**: Custom NFT metadata handling

## 🚀 Next Steps

1. **Get Client ID** from Thirdweb Dashboard
2. **Add to .env.local** and restart the app
3. **Connect Wallet** and start trading!
4. **Deploy Marketplace** (optional) for advanced features

## 📚 Resources

- [Thirdweb Documentation](https://portal.thirdweb.com/)
- [React SDK Reference](https://portal.thirdweb.com/react)
- [Contract Deployment Guide](https://portal.thirdweb.com/deploy)
- [Marketplace Templates](https://portal.thirdweb.com/marketplace)

---

**Your Thirdweb marketplace is ready to use!** 🎉

Just add your Client ID and start trading land NFTs with a professional, production-ready interface.
