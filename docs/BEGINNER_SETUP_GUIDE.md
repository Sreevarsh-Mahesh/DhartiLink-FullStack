# 🚀 Complete Beginner's Setup Guide

**Don't worry!** This guide will walk you through everything step by step, even if you've never used blockchain before.

## 📋 What You Need (5 minutes each)

### 1. 🦊 MetaMask Wallet Setup

**Step 1: Install MetaMask**
1. Go to [metamask.io](https://metamask.io)
2. Click "Download" → "Install MetaMask for Chrome/Firefox"
3. Add the extension to your browser
4. Click "Create a new wallet"
5. Set a strong password
6. **IMPORTANT**: Write down your 12-word recovery phrase and keep it safe!

**Step 2: Get Your Wallet Address**
1. Open MetaMask
2. Click on your account name (top of MetaMask)
3. Click "Copy address to clipboard"
4. **This is your `WALLET_ADDRESS`** - save it!

**Step 3: Get Your Private Key**
1. In MetaMask, click the 3 dots (⋮) next to your account
2. Click "Account details"
3. Click "Show private key"
4. Enter your MetaMask password
5. **This is your `PRIVATE_KEY`** - starts with `0x` - keep it secret!

### 2. 🌐 Sepolia Test Network Setup

**Step 1: Switch to Sepolia**
1. In MetaMask, click the network dropdown (top)
2. Click "Show/hide test networks"
3. Toggle "Show test networks" ON
4. Select "Sepolia test network"

**Step 2: Get Free Test ETH**
1. Go to [sepoliafaucet.com](https://sepoliafaucet.com)
2. Paste your wallet address
3. Click "Send me ETH"
4. Wait 1-2 minutes for ETH to arrive
5. You should see ~0.1 ETH in your MetaMask

### 3. 🔗 Infura Project Setup (Free)

**Step 1: Create Infura Account**
1. Go to [infura.io](https://infura.io)
2. Click "Start for Free"
3. Sign up with email
4. Verify your email

**Step 2: Create Project**
1. Log into Infura dashboard
2. Click "Create New Project"
3. Name it "Land Trading Platform"
4. Select "Web3 API" → "Ethereum"
5. Click "Create Project"

**Step 3: Get Project ID**
1. Click on your project
2. Copy the "Project ID" (looks like: `abc123def456...`)
3. **This is your `INFURA_PROJECT_ID`** - save it!

**Step 4: Get RPC URL**
1. In the same project page
2. Find "Sepolia" network
3. Copy the HTTPS URL (looks like: `https://sepolia.infura.io/v3/your-project-id`)
4. **This is your `SEPOLIA_RPC_URL`** - save it!

### 4. 📝 Create Your .env File

Now create a file called `.env` in the `remix-backend` folder with this content:

```env
# Network Configuration
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID_HERE
PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE
WALLET_ADDRESS=0xYOUR_WALLET_ADDRESS_HERE

# Contract Addresses (we'll get these next)
LT_TOKEN_ADDRESS=
LAND_NFT_ADDRESS=

# Server Configuration
PORT=3001
NODE_ENV=development

# API Keys
INFURA_PROJECT_ID=YOUR_PROJECT_ID_HERE
ETHERSCAN_API_KEY=
```

**Replace these values:**
- `YOUR_PROJECT_ID_HERE` → Your Infura Project ID
- `0xYOUR_PRIVATE_KEY_HERE` → Your MetaMask private key
- `0xYOUR_WALLET_ADDRESS_HERE` → Your MetaMask wallet address

### 5. 🚀 Deploy Contracts in Remix

**Step 1: Open Remix**
1. Go to [remix.ethereum.org](https://remix.ethereum.org)
2. Create new workspace: "Land Trading"

**Step 2: Add Contracts**
1. In the file explorer, create new file: `LTToken.sol`
2. Copy the content from `remix-contracts/LTToken.sol`
3. Create another file: `LandNFT.sol`
4. Copy the content from `remix-contracts/LandNFT.sol`

**Step 3: Deploy LT Token**
1. Go to "Deploy & Run Transactions" tab
2. Select "Injected Provider - MetaMask"
3. Make sure you're on Sepolia network
4. Select `LTToken` contract
5. Click "Deploy"
6. Confirm in MetaMask
7. **Copy the contract address** - this is your `LT_TOKEN_ADDRESS`

**Step 4: Deploy Land NFT**
1. Select `LandNFT` contract
2. In constructor field, paste your LT Token address
3. Click "Deploy"
4. Confirm in MetaMask
5. **Copy the contract address** - this is your `LAND_NFT_ADDRESS`

**Step 5: Set Permissions**
1. In deployed LT Token contract, find `addMinter` function
2. Paste your Land NFT contract address
3. Click "transact"
4. Confirm in MetaMask

### 6. 🔄 Update Your .env File

Add the contract addresses to your `.env` file:

```env
# Contract Addresses
LT_TOKEN_ADDRESS=0xYOUR_LT_TOKEN_CONTRACT_ADDRESS
LAND_NFT_ADDRESS=0xYOUR_LAND_NFT_CONTRACT_ADDRESS
```

## 🧪 Test Everything

**Start your backend:**
```bash
cd remix-backend
npm install
npm run dev
```

**Test the API:**
```bash
curl http://localhost:3001/health
curl http://localhost:3001/api/tokens/balance/YOUR_WALLET_ADDRESS
```

## 📱 Example Values

Here's what your `.env` file should look like (with example values):

```env
# Network Configuration
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
PRIVATE_KEY=0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
WALLET_ADDRESS=0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6

# Contract Addresses
LT_TOKEN_ADDRESS=0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba
LAND_NFT_ADDRESS=0xfedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210

# Server Configuration
PORT=3001
NODE_ENV=development

# API Keys
INFURA_PROJECT_ID=abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
ETHERSCAN_API_KEY=
```

## 🚨 Troubleshooting

**"Insufficient funds" error:**
- Make sure you have Sepolia ETH (get from faucet)
- Check you're on Sepolia network in MetaMask

**"Invalid private key" error:**
- Make sure private key starts with `0x`
- No spaces or extra characters

**"Contract not found" error:**
- Double-check contract addresses
- Make sure contracts are deployed on Sepolia

**"Network error" error:**
- Check your Infura Project ID is correct
- Make sure RPC URL is properly formatted

## 🎉 You're Done!

Once you complete these steps, you'll have:
- ✅ MetaMask wallet with Sepolia ETH
- ✅ Infura project for blockchain access
- ✅ Deployed smart contracts
- ✅ Configured backend server
- ✅ Working API endpoints

**Total time: ~30 minutes for complete setup!**

## 📞 Need Help?

If you get stuck at any step:
1. Check the error messages carefully
2. Make sure you're following each step exactly
3. Double-check your wallet has Sepolia ETH
4. Verify all addresses are correct (no typos)

---

**You've got this!** 🚀 Blockchain development is easier than it looks once you have everything set up.
