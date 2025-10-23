# 🚀 DhartiWallet Extension - Installation Guide

## ✨ New: Fully Responsive Design

The DhartiWallet extension now features a fully responsive design with:
- 📱 Adaptive layouts for all screen sizes (320px to 420px wide)
- 👆 Touch-optimized controls with haptic feedback
- ⚡ Smooth animations and transitions
- ♿ Enhanced accessibility features
- 🎯 Improved tap targets for mobile devices
- 🌊 Fluid typography that scales beautifully

See [RESPONSIVE_FEATURES.md](./RESPONSIVE_FEATURES.md) for complete details.

## Quick Start (5 minutes)

### Step 1: Locate the Extension Folder
The extension files are in: `dharti-wallet-extension/`

### Step 2: Create Icon Files

Since the extension requires icon files, you need to create placeholder images:

#### Option A: Use Online Icon Generator (Recommended)
1. Go to https://www.favicon-generator.org/
2. Upload the `icons/icon.png` file (or any logo)
3. Download the generated icons
4. Rename and place them in `icons/` folder:
   - `icon16.png`
   - `icon48.png`
   - `icon128.png`

#### Option B: Create Simple Placeholder Icons
1. Open Paint or any image editor
2. Create three images with these sizes:
   - 16x16 pixels (save as `icon16.png`)
   - 48x48 pixels (save as `icon48.png`)
   - 128x128 pixels (save as `icon128.png`)
3. Fill with a blue/purple gradient or solid color
4. Add letter "D" in the center
5. Save all three in the `icons/` folder

### Step 3: Load Extension in Chrome

1. **Open Chrome Extensions Page**
   ```
   chrome://extensions/
   ```
   Or navigate via: Menu (⋮) → More Tools → Extensions

2. **Enable Developer Mode**
   - Look for the toggle in the top-right corner
   - Switch it ON

3. **Load the Extension**
   - Click the "Load unpacked" button
   - Navigate to: `C:\Users\kaveen\Downloads\DhartiLink\dharti-wallet-extension`
   - Click "Select Folder"

4. **Verify Installation**
   - You should see "DhartiWallet" in your extensions list
   - Status should show "Enabled"

5. **Pin the Extension**
   - Click the puzzle piece icon 🧩 in Chrome toolbar
   - Find "DhartiWallet" in the dropdown
   - Click the pin icon 📌 to keep it visible

### Step 4: Launch the Wallet

1. Click the DhartiWallet icon in your toolbar
2. You'll see the animated loading screen
3. After 2 seconds, you'll see the setup screen

### Step 5: Create Your First Wallet

#### Option A: Create New Wallet
1. Click "Create New Wallet"
2. You'll see a 12-word seed phrase
3. **IMPORTANT**: Write down these words in order
4. Click "Copy to Clipboard" to save them
5. Click "I've Written It Down" to continue
6. Your wallet is ready! 🎉

#### Option B: Import Existing Wallet
1. Click "Import Existing Wallet"
2. Enter your 12-word seed phrase
3. Click "Import Wallet"
4. Your wallet is imported! 🎉

## 🎯 Using the Wallet

### Check Your Balance
- Balance is displayed at the top
- Click the refresh icon 🔄 to update

### Send ETH
1. Click "Send" button
2. Enter recipient address (0x...)
3. Enter amount
4. Click "Send Transaction"

### Receive ETH
1. Click "Receive" button  
2. Your address is displayed with QR code
3. Click copy button 📋 to copy address

### Access Settings
- Click the gear icon ⚙️ in bottom-right
- View account details
- Lock wallet when done

## 🌐 Testing with DhartiLink Website

1. Navigate to `http://localhost:3003`
2. Open browser console (F12)
3. Type: `window.dhartiWallet`
4. You should see the wallet provider object!

### Test Connection
```javascript
// In browser console on any website
const accounts = await window.dhartiWallet.request({ 
  method: 'eth_requestAccounts' 
});
console.log('Connected account:', accounts[0]);
```

## 🔧 Troubleshooting

### Extension won't load?
- Make sure all files are in the folder
- Check that `manifest.json` is present
- Look at Chrome console for errors

### No icon showing?
- Icons are optional for development
- Extension will still work without them
- You'll just see a default puzzle piece icon

### Can't create wallet?
- Open extension popup
- Right-click → Inspect
- Check console for errors
- Make sure you're on latest Chrome

### Provider not injecting?
- Refresh the webpage after installing extension
- Check console for "DhartiWallet provider injected"
- Try a different website

## 📝 Development Tips

### Reload After Changes
1. Make changes to files
2. Go to `chrome://extensions/`
3. Click the refresh icon 🔄 on DhartiWallet
4. Reopen the popup or refresh webpage

### View Logs
- **Popup Console**: Right-click extension popup → Inspect
- **Background Script**: chrome://extensions/ → Service Worker
- **Content Script**: F12 on any webpage

### Test on DhartiLink
The wallet integrates seamlessly with the main DhartiLink website!

## 🎨 Customization

### Change Colors
Edit `styles.css`:
```css
:root {
  --primary-color: #4c82fb; /* Change this */
  --accent-color: #7c3aed;  /* And this */
}
```

### Modify UI
Edit `popup.html` to change the structure and content.

### Add Features
Edit `popup.js` to add new wallet functionality.

## ⚠️ Security Notes

This is a **DEMO WALLET** for development:
- Don't use with real funds
- Don't share your seed phrase
- For testing only!

## 🎉 Success!

You now have a working MetaMask-style wallet extension!

- ✅ Create/Import wallets
- ✅ Send/Receive ETH
- ✅ Web3 provider injection
- ✅ Beautiful UI
- ✅ Full functionality

---

**Need Help?** Check the main README.md for more details!

