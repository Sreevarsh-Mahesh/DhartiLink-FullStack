# 🚀 Vercel Deployment Steps

## ✅ Branch Pushed Successfully!
Your ERupee marketplace integration has been pushed to:
**Branch:** `erupee-marketplace-integration`
**Repository:** https://github.com/Sreevarsh-Mahesh/DhartiLink-FullStack

## 🌐 Deploy to Vercel (Manual Steps)

### Step 1: Go to Vercel Dashboard
1. Visit [vercel.com](https://vercel.com)
2. Sign in with your GitHub account
3. Click "New Project"

### Step 2: Import Repository
1. Select "Import Git Repository"
2. Choose `DhartiLink-FullStack`
3. Select branch: `erupee-marketplace-integration`
4. Click "Import"

### Step 3: Configure Project
1. **Project Name:** `dharti-link-marketplace` (or your preferred name)
2. **Framework Preset:** Next.js (auto-detected)
3. **Root Directory:** `./` (default)
4. **Build Command:** `pnpm run build` (or `npm run build`)
5. **Output Directory:** `.next` (default)

### Step 4: Add Environment Variables
In the Environment Variables section, add these:

#### Required Variables:
```
PINATA_API_KEY=7cafba13d67bb658e7a0
PINATA_SECRET_KEY=f1057156f937611c1efd824afe32c7995427cc16c75acee5b9794c8be2d4c024
LAND_NFT_CONTRACT_ADDRESS=0xb12ee37C49022B41760167e4D420B80EB5604268
ERUPEE_DUMMY_CONTRACT_ADDRESS=0x08001a1B010FFA09d6c2Bd331C0a3f04d175B8BE
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
PRIVATE_KEY=c44cf6675f40d9d2a52aef37bdbe841b18e5d5fb844df73fd4393aaecc23da1f
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=9RWMU2jAq6c+1pizcWFhTuqbxTvxCvEM17iBaZv+Qpw=
NEXT_PUBLIC_LAND_NFT_CONTRACT_ADDRESS=0xb12ee37C49022B41760167e4D420B80EB5604268
NEXT_PUBLIC_ERUPEE_DUMMY_CONTRACT_ADDRESS=0x08001a1B010FFA09d6c2Bd331C0a3f04d175B8BE
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=ca252327d09be84a4cbe20798109a7da
```

### Step 5: Deploy
1. Click "Deploy"
2. Wait for deployment to complete (2-3 minutes)
3. Your app will be live at `https://your-app-name.vercel.app`

## 🎉 After Deployment

### ✅ Your App Will Have:
- **ERupee Marketplace** - Real token transactions
- **Land NFT Minting** - Upload documents and mint
- **Multi-user Support** - Works for all users
- **Mobile Responsive** - Works on all devices
- **Blockchain Integration** - Real Sepolia transactions

### 🔗 Share Your App:
Once deployed, share the Vercel URL with users who can:
1. Connect MetaMask (Sepolia network)
2. Get ERupee tokens
3. Mint and trade land NFTs
4. Use the complete marketplace

## 🛠️ Troubleshooting

### If Build Fails:
1. Check environment variables are set correctly
2. Ensure all required variables are added
3. Check Vercel logs for specific errors

### If App Doesn't Work:
1. Verify MetaMask is connected to Sepolia
2. Check browser console for errors
3. Ensure user has ERupee tokens

## 📱 Mobile Testing:
- Works on mobile browsers
- MetaMask mobile app compatible
- Touch-friendly interface

Your ERupee marketplace is ready for production! 🚀
