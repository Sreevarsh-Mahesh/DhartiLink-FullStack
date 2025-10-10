# 🏗️ DhartiLink - Remix-Based Land NFT Platform

A complete blockchain-based land ownership platform built with Remix IDE and Next.js.

## 🚀 Quick Start

### 1. Backend Setup
```bash
cd remix-backend
npm install
npm start
```

### 2. Frontend Setup
```bash
cd DhartiLink-main
npm install
npm run dev
```

### 3. Access the Application
- **Frontend**: http://localhost:3000 (or next available port)
- **Backend API**: http://localhost:3001

## 📋 Project Structure

```
practice-blockchain/
├── contracts/                 # Smart contracts (for Remix IDE)
│   ├── LTToken.sol           # ERC20 Land Token
│   └── LandNFT.sol           # ERC721 Land NFT
├── remix-backend/            # Express.js backend
│   ├── routes/               # API routes
│   ├── utils/                # Web3 utilities
│   ├── scripts/              # Deployment scripts
│   └── server.js             # Main server file
├── DhartiLink-main/          # Next.js frontend
│   ├── components/           # React components
│   ├── lib/                  # API utilities
│   └── app/                  # Next.js app router
└── docs/                     # Documentation
    ├── REMIX_GUIDE.md        # Remix deployment guide
    ├── BEGINNER_SETUP_GUIDE.md # Complete setup guide
    └── METAMASK_NFT_SETUP.md # MetaMask setup
```

## 🔧 Contract Addresses (Sepolia)

- **Land NFT Contract**: `0x31b7f507b43a4da7246a650f3e26e0f2c653d361`
- **LT Token Contract**: `0xfab78795cb0b23fd5de1edc520fbc3ddfec9140a`

## 📚 Documentation

- [Remix Deployment Guide](docs/REMIX_GUIDE.md)
- [Beginner Setup Guide](docs/BEGINNER_SETUP_GUIDE.md)
- [MetaMask NFT Setup](docs/METAMASK_NFT_SETUP.md)
- [Quick Start Guide](docs/REMIX_QUICK_START.md)
- [Get Sepolia ETH](docs/GET_SEPOLIA_ETH.md)

## 🎯 Features

- ✅ ERC20 Land Token (LT)
- ✅ ERC721 Land NFTs
- ✅ NFT Marketplace
- ✅ Portfolio Management
- ✅ MetaMask Integration
- ✅ Real Chennai Properties

## 🛠️ Tech Stack

- **Smart Contracts**: Solidity (Remix IDE)
- **Backend**: Express.js, Ethers.js
- **Frontend**: Next.js, React, TypeScript
- **Blockchain**: Ethereum Sepolia Testnet
