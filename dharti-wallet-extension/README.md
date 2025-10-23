# 🌍 DhartiWallet - Browser Extension

A MetaMask-style crypto wallet extension for managing digital land assets on the blockchain.

## ✨ Features

- 🔐 **Secure Wallet Creation** - Generate new wallets with 12-word seed phrases
- 📥 **Import Existing Wallets** - Import wallets using seed phrases
- 💰 **Balance Management** - View ETH and token balances
- 📤 **Send Transactions** - Send ETH to any address
- 📥 **Receive Crypto** - Generate QR codes for receiving payments
- 🌐 **Web3 Provider** - Inject `window.dhartiWallet` into web pages
- 🎨 **Beautiful UI** - Modern, gradient-rich interface inspired by MetaMask
- 🔒 **Secure Storage** - Encrypted local storage for wallet data

## 🚀 Installation

### Load as Unpacked Extension (Development)

1. **Open Chrome Extensions Page**
   - Navigate to `chrome://extensions/`
   - Or click Menu → More Tools → Extensions

2. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top right

3. **Load Extension**
   - Click "Load unpacked"
   - Navigate to the `dharti-wallet-extension` folder
   - Click "Select Folder"

4. **Pin Extension**
   - Click the puzzle icon in Chrome toolbar
   - Find "DhartiWallet" and click the pin icon

## 📱 Usage

### First Time Setup

1. Click the DhartiWallet extension icon
2. Choose to create a new wallet or import an existing one
3. If creating new:
   - Write down your 12-word seed phrase
   - Store it in a safe place (never share it!)
   - Click "I've Written It Down"
4. If importing:
   - Enter your 12-word seed phrase
   - Click "Import Wallet"

### Managing Your Wallet

#### View Balance
- Your ETH balance is displayed at the top
- Refresh by clicking the 🔄 icon

#### Send ETH
1. Click the "Send" button
2. Enter recipient address
3. Enter amount
4. Click "Send Transaction"

#### Receive ETH
1. Click the "Receive" button
2. Share your wallet address or QR code

#### Settings
- Click the ⚙️ icon in the bottom right
- Access account details, seed phrase, and more
- Lock wallet when done

### Web3 Integration

The extension injects `window.dhartiWallet` (and `window.ethereum`) into all web pages:

```javascript
// Request accounts
const accounts = await window.dhartiWallet.request({ 
  method: 'eth_requestAccounts' 
});

// Send transaction
const txHash = await window.dhartiWallet.request({
  method: 'eth_sendTransaction',
  params: [{
    to: '0x...',
    value: '0x...',
  }]
});

// Sign message
const signature = await window.dhartiWallet.request({
  method: 'personal_sign',
  params: [message, account]
});
```

## 🎨 UI Features

- **Loading Screen** - Animated logo with rotating rings
- **Gradient Backgrounds** - Modern, eye-catching color schemes
- **Smooth Animations** - Fade-ins, hover effects, and transitions
- **Responsive Design** - Optimized for 360x600px extension popup
- **Dark Theme** - Easy on the eyes with blue/purple accents
- **Toast Notifications** - Inline feedback for all actions

## 🔧 Technical Stack

- **Manifest V3** - Latest Chrome extension standard
- **Vanilla JavaScript** - No external dependencies
- **CSS3** - Modern gradients and animations
- **Chrome Storage API** - Secure local storage
- **Web3 Provider** - Custom implementation

## 📁 File Structure

```
dharti-wallet-extension/
├── manifest.json       # Extension configuration
├── popup.html          # Main UI
├── popup.js           # Wallet logic
├── styles.css         # Styling
├── background.js      # Service worker
├── content.js         # Content script
├── inpage.js          # Web3 provider injection
├── icons/             # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md          # This file
```

## 🔒 Security Notes

⚠️ **IMPORTANT**: This is a demonstration wallet. For production use:

1. Never store seed phrases unencrypted
2. Implement proper key derivation (BIP39/BIP44)
3. Use hardware wallet integration
4. Add transaction signing confirmations
5. Implement proper RPC connections
6. Add network security measures

## 🛠️ Development

### Adding Icon Images

The extension requires icon files. Create or add these to the `icons/` folder:
- `icon16.png` (16x16px)
- `icon48.png` (48x48px)  
- `icon128.png` (128x128px)

You can create simple icons or use the DhartiLink logo.

### Modifying the UI

- Edit `popup.html` for structure
- Edit `styles.css` for styling
- Edit `popup.js` for functionality

### Testing

1. Load the extension
2. Open browser console (F12)
3. Check for errors in:
   - Extension popup console
   - Background service worker console
   - Web page console (for provider injection)

## 🌟 Features Coming Soon

- [ ] Multiple accounts support
- [ ] Network switching (Mainnet, Testnet, etc.)
- [ ] Token management (ERC-20)
- [ ] NFT display (ERC-721)
- [ ] Transaction history
- [ ] Address book
- [ ] Hardware wallet support
- [ ] DApp connection management
- [ ] Gas fee estimation
- [ ] ENS domain support

## 📄 License

MIT License - Feel free to use and modify!

## 🙏 Credits

Built with inspiration from MetaMask and modern Web3 wallets.

---

**Made for DhartiLink** - Revolutionizing land ownership on the blockchain 🌍

