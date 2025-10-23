# Vercel Deployment Guide for DhartiLink

## 🚀 Deploy to Vercel

### Prerequisites
- GitHub repository with your code
- Vercel account (free tier works)
- MetaMask wallet with Sepolia ETH and ERupee tokens

### Step 1: Prepare Your Repository
1. Push your code to GitHub
2. Make sure all environment variables are in `env.template`

### Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js

### Step 3: Configure Environment Variables
In Vercel dashboard, go to Settings → Environment Variables and add:

#### Required Environment Variables:
```
PINATA_API_KEY=7cafba13d67bb658e7a0
PINATA_SECRET_KEY=f1057156f937611c1efd824afe32c7995427cc16c75acee5b9794c8be2d4c024
LAND_NFT_CONTRACT_ADDRESS=0xb12ee37C49022B41760167e4D420B80EB5604268
ERUPEE_DUMMY_CONTRACT_ADDRESS=0x08001a1B010FFA09d6c2Bd331C0a3f04d175B8BE
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
PRIVATE_KEY=your_private_key_here
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=9RWMU2jAq6c+1pizcWFhTuqbxTvxCvEM17iBaZv+Qpw=
NEXT_PUBLIC_LAND_NFT_CONTRACT_ADDRESS=0xb12ee37C49022B41760167e4D420B80EB5604268
NEXT_PUBLIC_ERUPEE_DUMMY_CONTRACT_ADDRESS=0x08001a1B010FFA09d6c2Bd331C0a3f04d175B8BE
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=ca252327d09be84a4cbe20798109a7da
```

### Step 4: Deploy
1. Click "Deploy"
2. Wait for deployment to complete
3. Your app will be live at `https://your-app-name.vercel.app`

## 🌐 Multi-User Support

### For Other Users to Use:
1. **Connect MetaMask** - Users need MetaMask with Sepolia network
2. **Get ERupee Tokens** - Users need ERupeeDummy tokens for transactions
3. **Mint Land NFTs** - Users can upload documents and mint NFTs
4. **Trade NFTs** - Users can buy/sell with ERupee currency

### Getting ERupee Tokens:
Users can get ERupeeDummy tokens by:
1. Connecting to Sepolia testnet
2. Using a faucet to get test ETH
3. Swapping ETH for ERupeeDummy (if available)
4. Or you can airdrop tokens to users

## 🔧 Features Available for All Users:

### ✅ Land NFT Minting:
- Upload land documents
- Set coordinates
- Mint NFTs on blockchain
- Automatic IPFS storage

### ✅ Marketplace Trading:
- List NFTs for sale in ERupee
- Buy NFTs with ERupee
- Real-time price updates
- Secure blockchain transactions

### ✅ Portfolio Management:
- View owned NFTs
- Track transaction history
- Interactive 3D maps
- Performance analytics

## 🛡️ Security Notes:
- All transactions are on Sepolia testnet (no real money)
- Private keys are server-side only
- User wallets are never exposed
- IPFS ensures document permanence

## 📱 Mobile Support:
- Responsive design works on all devices
- MetaMask mobile app compatible
- Touch-friendly interface

Your DhartiLink marketplace will work for all users once deployed! 🎉
