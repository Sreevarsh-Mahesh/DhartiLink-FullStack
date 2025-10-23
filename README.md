# DartiLink - UPI for Land Ownership

A blockchain-powered land ownership platform with MetaMask integration for secure wallet authentication and payments.

## Features

### 🔗 MetaMask Integration
- **Wallet Connection**: Connect MetaMask wallet with one click
- **Account Management**: View account details, balance, and network information
- **Transaction Support**: Send LT payments for land purchases
- **Message Signing**: Sign messages for land ownership verification
- **Network Switching**: Switch between different Ethereum networks

### 🏠 Land Management
- **Ownership Verification**: Verify land ownership using blockchain records
- **Land Marketplace**: Browse and purchase verified land properties
- **Payment Processing**: Secure LT transactions for land purchases
- **Digital Records**: On-chain proof of land ownership and transfers

### 🗺️ Geospatial Features
- **Interactive Maps**: Visual representation of land parcels
- **Location Verification**: Geo-linked land records
- **Spatial Data**: Precise land boundaries and measurements

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI Components**: Radix UI, Tailwind CSS
- **Blockchain**: MetaMask, Ethers.js
- **Styling**: Custom holographic theme with glass morphism effects

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm package manager
- MetaMask browser extension

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd DhartiLink
```

2. Install dependencies:
```bash
pnpm install
```

3. Start the development server:
```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### MetaMask Setup

1. Install MetaMask browser extension
2. Create a new wallet or import existing wallet
3. Switch to a test network (Sepolia, Goerli, etc.) for testing
4. Ensure you have some test LT for transactions (or use the free 0 LT purchases)

## Usage

### Wallet Connection

1. Click "Connect MetaMask" button
2. Approve the connection in MetaMask popup
3. View your wallet details and balance

### Land Verification

1. Navigate to the "Verification" tab
2. Enter a Land ID (e.g., LAND001, LAND002)
3. Click "Search" to find land records
4. Click "Verify Ownership" to sign a verification message

### Land Marketplace

1. Navigate to the "Marketplace" tab
2. Browse available land listings
3. Click "Purchase Land" on any listing
4. Review transaction details and confirm payment

## Project Structure

```
DhartiLink/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page
├── components/            # React components
│   ├── ui/               # UI component library
│   ├── wallet-connect.tsx    # Wallet connection component
│   ├── payment-modal.tsx     # Payment processing modal
│   ├── land-verification.tsx # Land ownership verification
│   └── land-marketplace.tsx  # Land marketplace
├── contexts/             # React contexts
│   └── wallet-context.tsx    # Wallet state management
├── hooks/                # Custom hooks
│   └── use-wallet.ts         # Wallet integration hook
└── lib/                  # Utility functions
    └── utils.ts
```

## Key Components

### Wallet Integration (`hooks/use-wallet.ts`)
- MetaMask provider detection
- Account connection and management
- Transaction sending and signing
- Network switching
- Real-time balance updates

### Wallet Context (`contexts/wallet-context.tsx`)
- Global wallet state management
- Provider pattern for component access
- Error handling and loading states

### Payment Modal (`components/payment-modal.tsx`)
- Secure payment processing
- Transaction confirmation
- Message signing for verification
- Real-time transaction status

### Land Verification (`components/land-verification.tsx`)
- Land record search and display
- Ownership verification through message signing
- Blockchain record validation
- Transaction history display

## Security Features

- **Message Signing**: All verifications require cryptographic signatures
- **Transaction Validation**: All payments are validated on-chain
- **Account Verification**: Wallet addresses are verified before transactions
- **Error Handling**: Comprehensive error handling for failed transactions

## Development

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

### Environment Variables

Create a `.env.local` file for environment-specific configuration:

```env
NEXT_PUBLIC_CHAIN_ID=1
NEXT_PUBLIC_RPC_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly with MetaMask
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code examples

## Roadmap

- [ ] Smart contract integration
- [ ] Multiple wallet support (WalletConnect, Coinbase Wallet)
- [ ] Mobile app development
- [ ] Advanced land mapping features
- [ ] Integration with land registry APIs
- [ ] Multi-chain support
