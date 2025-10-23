// DhartiWallet - Popup Script
const ethers = (() => {
  // Minimal ethers.js implementation for wallet functionality
  const wordlist = [
    "abandon", "ability", "able", "about", "above", "absent", "absorb", "abstract", "absurd", "abuse",
    "access", "accident", "account", "accuse", "achieve", "acid", "acoustic", "acquire", "across", "act",
    "action", "actor", "actress", "actual", "adapt", "add", "addict", "address", "adjust", "admit",
    "adult", "advance", "advice", "aerobic", "affair", "afford", "afraid", "again", "age", "agent",
    "agree", "ahead", "aim", "air", "airport", "aisle", "alarm", "album", "alcohol", "alert",
    "alien", "all", "alley", "allow", "almost", "alone", "alpha", "already", "also", "alter",
    "always", "amateur", "amazing", "among", "amount", "amused", "analyst", "anchor", "ancient", "anger",
    "angle", "angry", "animal", "ankle", "announce", "annual", "another", "answer", "antenna", "antique",
    "anxiety", "any", "apart", "apology", "appear", "apple", "approve", "april", "arch", "arctic",
    "area", "arena", "argue", "arm", "armed", "armor", "army", "around", "arrange", "arrest",
    "arrive", "arrow", "art", "artefact", "artist", "artwork", "ask", "aspect", "assault", "asset",
    "assist", "assume", "asthma", "athlete", "atom", "attack", "attend", "attitude", "attract", "auction",
    "audit", "august", "aunt", "author", "auto", "autumn", "average", "avocado", "avoid", "awake",
    "aware", "away", "awesome", "awful", "awkward", "axis", "baby", "bachelor", "bacon", "badge",
    "bag", "balance", "balcony", "ball", "bamboo", "banana", "banner", "bar", "barely", "bargain",
    "barrel", "base", "basic", "basket", "battle", "beach", "bean", "beauty", "because", "become",
    "beef", "before", "begin", "behave", "behind", "believe", "below", "belt", "bench", "benefit"
  ];

  function generateMnemonic() {
    const words = [];
    for (let i = 0; i < 12; i++) {
      const randomIndex = Math.floor(Math.random() * wordlist.length);
      words.push(wordlist[randomIndex]);
    }
    return words.join(' ');
  }

  function mnemonicToSeed(mnemonic) {
    // Simple hash function (not cryptographically secure, for demo only)
    let hash = 0;
    for (let i = 0; i < mnemonic.length; i++) {
      const char = mnemonic.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  }

  function createWallet(mnemonic) {
    const seed = mnemonicToSeed(mnemonic);
    // Generate address from seed (simplified)
    const address = '0x' + seed.padStart(40, '0').slice(0, 40);
    return {
      address,
      mnemonic,
      privateKey: seed
    };
  }

  return {
    generateMnemonic,
    createWallet
  };
})();

class DhartiWallet {
  constructor() {
    this.currentScreen = 'loading';
    this.wallet = null;
    this.balance = '0.0000';
    this.inrBalance = '0.00';
    this.transactions = [];
    this.googleUser = null;
    this.dhartiTranslations = [
      "Dharti", 
      "धरती", 
      "தர்தி", 
      "ధర్తి", 
      "ધર્તી", 
      "ধর্তি", 
      "धर्ती", 
      "धरती", 
      "Dharti"
    ];
    this.translationIndex = 0;
    this.isTransitioning = false;
    this.init();
  }

  // Debounce helper for performance
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  async init() {
    // Start language animation on loading screen
    this.startLanguageAnimation();
    
    // Check if wallet and Google user exist
    const stored = await this.getStoredWallet();
    const googleUser = await this.getStoredGoogleUser();
    
    if (googleUser) {
      this.googleUser = googleUser;
    }
    
    // Show appropriate screen after 4 seconds (matching website timing)
    setTimeout(() => {
      if (stored) {
        this.wallet = stored;
        this.showScreen('wallet');
        this.updateWalletUI();
        this.updateGoogleProfileUI();
      } else {
        this.showScreen('setup');
      }
    }, 4000);

    this.setupEventListeners();
  }

  startLanguageAnimation() {
    const dhartiText = document.getElementById('dharti-text');
    if (!dhartiText) return;

    setInterval(() => {
      // Fade out
      dhartiText.style.opacity = '0';
      dhartiText.style.transform = 'scale(0.95)';
      
      setTimeout(() => {
        // Change text
        this.translationIndex = (this.translationIndex + 1) % this.dhartiTranslations.length;
        dhartiText.textContent = this.dhartiTranslations[this.translationIndex];
        
        // Fade in
        dhartiText.style.opacity = '1';
        dhartiText.style.transform = 'scale(1)';
      }, 300);
    }, 2000);
  }

  setupEventListeners() {
    // Google Sign-In
    document.getElementById('google-signin-btn')?.addEventListener('click', () => {
      this.signInWithGoogle();
    });

    document.getElementById('disconnect-google-btn')?.addEventListener('click', () => {
      this.disconnectGoogle();
    });

    document.getElementById('manage-google-btn')?.addEventListener('click', () => {
      if (this.googleUser) {
        this.disconnectGoogle();
      } else {
        this.signInWithGoogle();
      }
    });

    // Setup Screen
    document.getElementById('create-wallet-btn')?.addEventListener('click', () => {
      this.createNewWallet();
    });

    document.getElementById('import-wallet-btn')?.addEventListener('click', () => {
      this.showScreen('import');
    });

    // Create Screen
    document.getElementById('back-from-create')?.addEventListener('click', () => {
      this.showScreen('setup');
    });

    document.getElementById('copy-seed-btn')?.addEventListener('click', () => {
      this.copySeedPhrase();
    });

    document.getElementById('confirm-seed-btn')?.addEventListener('click', () => {
      this.confirmSeedPhrase();
    });

    // Import Screen
    document.getElementById('back-from-import')?.addEventListener('click', () => {
      this.showScreen('setup');
    });

    document.getElementById('import-wallet-submit')?.addEventListener('click', () => {
      this.importWallet();
    });

    // Wallet Screen
    document.getElementById('copy-address-btn')?.addEventListener('click', () => {
      this.copyAddress();
    });

    document.getElementById('refresh-balance-btn')?.addEventListener('click', () => {
      this.refreshBalance();
    });

    document.getElementById('send-btn')?.addEventListener('click', () => {
      this.showScreen('send');
    });

    document.getElementById('receive-btn')?.addEventListener('click', () => {
      this.showScreen('receive');
      this.updateReceiveAddress();
    });

    document.getElementById('buy-btn')?.addEventListener('click', () => {
      this.showBuyOptions();
    });

    document.getElementById('settings-btn')?.addEventListener('click', () => {
      this.showScreen('settings');
    });

    // Send Screen
    document.getElementById('back-from-send')?.addEventListener('click', () => {
      this.showScreen('wallet');
    });

    document.getElementById('max-amount-btn')?.addEventListener('click', () => {
      this.setMaxAmount();
    });

    document.getElementById('send-confirm-btn')?.addEventListener('click', () => {
      this.sendTransaction();
    });

    // Receive Screen
    document.getElementById('back-from-receive')?.addEventListener('click', () => {
      this.showScreen('wallet');
    });

    document.getElementById('copy-receive-address')?.addEventListener('click', () => {
      this.copyAddress();
    });

    // Settings Screen
    document.getElementById('back-from-settings')?.addEventListener('click', () => {
      this.showScreen('wallet');
    });

    document.getElementById('lock-wallet-btn')?.addEventListener('click', () => {
      this.lockWallet();
    });

    // Tabs
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        this.switchTab(e.target.dataset.tab);
      });
    });
  }

  async getStoredWallet() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['wallet'], (result) => {
        resolve(result.wallet || null);
      });
    });
  }

  async saveWallet(wallet) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ wallet }, () => {
        resolve();
      });
    });
  }

  async getStoredGoogleUser() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['googleUser'], (result) => {
        resolve(result.googleUser || null);
      });
    });
  }

  async saveGoogleUser(googleUser) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ googleUser }, () => {
        resolve();
      });
    });
  }

  async removeGoogleUser() {
    return new Promise((resolve) => {
      chrome.storage.local.remove(['googleUser'], () => {
        resolve();
      });
    });
  }

  showScreen(screenName) {
    // Hide all screens with fade effect
    document.querySelectorAll('.screen').forEach(screen => {
      screen.classList.add('hidden');
      screen.style.opacity = '0';
    });

    // Show requested screen with smooth transition
    const screen = document.getElementById(`${screenName}-screen`);
    if (screen) {
      screen.classList.remove('hidden');
      this.currentScreen = screenName;
      
      // Smooth fade in
      requestAnimationFrame(() => {
        screen.style.transition = 'opacity 0.2s ease-in-out';
        screen.style.opacity = '1';
      });
      
      // Scroll to top of new screen
      screen.scrollTop = 0;
    }
  }

  createNewWallet() {
    const mnemonic = ethers.generateMnemonic();
    this.currentMnemonic = mnemonic;
    this.displaySeedPhrase(mnemonic);
    this.showScreen('create');
  }

  displaySeedPhrase(mnemonic) {
    const words = mnemonic.split(' ');
    const grid = document.getElementById('seed-phrase-grid');
    grid.innerHTML = '';

    words.forEach((word, index) => {
      const wordElement = document.createElement('div');
      wordElement.className = 'seed-word';
      wordElement.innerHTML = `
        <span class="seed-word-number">${index + 1}.</span>
        <span class="seed-word-text">${word}</span>
      `;
      grid.appendChild(wordElement);
    });
  }

  copySeedPhrase() {
    navigator.clipboard.writeText(this.currentMnemonic).then(() => {
      this.showNotification('Seed phrase copied to clipboard!', 'success');
      
      // Add haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(20);
      }
    }).catch(() => {
      this.showNotification('Failed to copy to clipboard', 'error');
    });
  }

  async confirmSeedPhrase() {
    this.wallet = ethers.createWallet(this.currentMnemonic);
    await this.saveWallet(this.wallet);
    this.showScreen('wallet');
    this.updateWalletUI();
    this.showNotification('Wallet created successfully!', 'success');
  }

  importWallet() {
    const seedInput = document.getElementById('import-seed-input');
    const mnemonic = seedInput.value.trim();

    if (!mnemonic || mnemonic.split(' ').length !== 12) {
      this.showNotification('Please enter a valid 12-word seed phrase', 'error');
      return;
    }

    this.wallet = ethers.createWallet(mnemonic);
    this.saveWallet(this.wallet);
    this.showScreen('wallet');
    this.updateWalletUI();
    this.showNotification('Wallet imported successfully!', 'success');
  }

  updateWalletUI() {
    if (!this.wallet) return;

    // Update address
    const addressElement = document.getElementById('account-address');
    if (addressElement) {
      addressElement.textContent = `${this.wallet.address.slice(0, 6)}...${this.wallet.address.slice(-4)}`;
    }

    // Update balance
    this.updateBalance();
    
    // Update Google profile if logged in
    this.updateGoogleProfileUI();
  }

  updateGoogleProfileUI() {
    const profileCard = document.getElementById('google-profile-card');
    const googleAvatar = document.getElementById('google-avatar');
    const googleName = document.getElementById('google-name');
    const googleEmail = document.getElementById('google-email');
    const mainAvatar = document.getElementById('main-avatar');
    const manageBtn = document.getElementById('manage-google-btn');
    const manageBtnText = document.getElementById('google-manage-text');

    if (this.googleUser && profileCard && googleAvatar && googleName && googleEmail) {
      // Show Google profile card
      profileCard.classList.remove('hidden');
      googleAvatar.src = this.googleUser.picture;
      googleName.textContent = this.googleUser.name;
      googleEmail.textContent = this.googleUser.email;

      // Update main avatar with Google profile picture
      if (mainAvatar) {
        mainAvatar.innerHTML = `<img src="${this.googleUser.picture}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
      }

      // Update settings button
      if (manageBtn && manageBtnText) {
        manageBtn.classList.add('connected');
        manageBtnText.textContent = 'Disconnect Google';
      }
    } else if (profileCard) {
      // Hide Google profile card
      profileCard.classList.add('hidden');

      // Reset main avatar
      if (mainAvatar) {
        mainAvatar.innerHTML = '<div class="avatar-gradient"></div>';
      }

      // Update settings button
      if (manageBtn && manageBtnText) {
        manageBtn.classList.remove('connected');
        manageBtnText.textContent = 'Connect Google Account';
      }
    }
  }

  async updateBalance() {
    // Simulate balance fetch
    const balanceElement = document.getElementById('balance-amount');
    const inrElement = document.getElementById('balance-usd');

    if (balanceElement) {
      balanceElement.textContent = `${this.balance} ₹`;
    }
    if (inrElement) {
      inrElement.textContent = `₹${this.inrBalance} INR`;
    }

    // Update asset list
    const assetsList = document.getElementById('tokens-list');
    if (assetsList) {
      assetsList.innerHTML = `
        <div class="asset-item">
          <div class="asset-icon">₹</div>
          <div class="asset-info">
            <span class="asset-name">E-Rupee</span>
            <span class="asset-symbol">₹</span>
          </div>
          <div class="asset-balance">
            <span class="asset-amount">${this.balance}</span>
            <span class="asset-value">₹${this.inrBalance}</span>
          </div>
        </div>
      `;
    }
  }

  copyAddress() {
    if (!this.wallet) return;
    
    navigator.clipboard.writeText(this.wallet.address).then(() => {
      this.showNotification('Address copied to clipboard!', 'success');
      
      // Add haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(20);
      }
    }).catch(() => {
      this.showNotification('Failed to copy address', 'error');
    });
  }

  refreshBalance() {
    // Simulate balance refresh with better feedback
    const btn = document.getElementById('refresh-balance-btn');
    if (!btn) return;
    
    // Prevent multiple clicks
    if (btn.disabled) return;
    btn.disabled = true;
    
    btn.style.transition = 'transform 0.5s ease-in-out';
    btn.style.transform = 'rotate(360deg)';
    
    setTimeout(() => {
      btn.style.transform = 'rotate(0deg)';
      btn.disabled = false;
      this.showNotification('Balance refreshed!', 'success');
      
      // Add haptic feedback simulation
      if (navigator.vibrate) {
        navigator.vibrate(10);
      }
    }, 500);
  }

  setMaxAmount() {
    const amountInput = document.getElementById('send-amount');
    if (amountInput) {
      // Leave some for gas fees
      const maxAmount = Math.max(0, parseFloat(this.balance) - 0.001);
      amountInput.value = maxAmount.toFixed(4);
    }
  }

  sendTransaction() {
    const recipientInput = document.getElementById('recipient-address');
    const amountInput = document.getElementById('send-amount');

    const recipient = recipientInput?.value.trim();
    const amount = parseFloat(amountInput?.value || '0');

    if (!recipient || !recipient.startsWith('0x') || recipient.length !== 42) {
      this.showNotification('Please enter a valid recipient address', 'error');
      return;
    }

    if (amount <= 0 || amount > parseFloat(this.balance)) {
      this.showNotification('Invalid amount', 'error');
      return;
    }

    // Simulate transaction
    this.showNotification('Transaction sent successfully!', 'success');
    
    // Update balance
    this.balance = (parseFloat(this.balance) - amount - 0.0005).toFixed(4);
    this.updateBalance();

    // Add to activity
    this.transactions.push({
      type: 'send',
      amount: amount.toFixed(4),
      to: recipient,
      timestamp: new Date().toISOString()
    });

    // Clear inputs and go back
    recipientInput.value = '';
    amountInput.value = '';
    this.showScreen('wallet');
  }

  updateReceiveAddress() {
    const receiveAddressElement = document.getElementById('receive-address');
    if (receiveAddressElement && this.wallet) {
      receiveAddressElement.textContent = `${this.wallet.address.slice(0, 10)}...${this.wallet.address.slice(-10)}`;
    }
  }

  showBuyOptions() {
    this.showNotification('Buy feature coming soon!', 'info');
  }

  lockWallet() {
    chrome.storage.local.remove(['wallet'], () => {
      this.wallet = null;
      this.showScreen('setup');
      this.showNotification('Wallet locked', 'success');
    });
  }

  // Google Authentication Methods
  async signInWithGoogle() {
    const btn = document.getElementById('google-signin-btn');
    if (btn) {
      btn.classList.add('loading');
    }

    try {
      // Check if Chrome Identity API is available and OAuth is configured
      if (typeof chrome !== 'undefined' && chrome.identity && chrome.identity.getAuthToken) {
        // Use real Chrome Identity API for OAuth
        chrome.identity.getAuthToken({ interactive: true }, async (token) => {
          if (chrome.runtime.lastError) {
            console.error('OAuth error:', chrome.runtime.lastError);
            this.showNotification('Google sign-in failed. Please check OAuth setup.', 'error');
            if (btn) btn.classList.remove('loading');
            return;
          }

          if (token) {
            try {
              // Fetch user info from Google
              const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              });

              if (!response.ok) {
                throw new Error('Failed to fetch user info');
              }

              const userInfo = await response.json();

              this.googleUser = {
                email: userInfo.email,
                name: userInfo.name,
                picture: userInfo.picture,
                id: userInfo.id
              };

              await this.saveGoogleUser(this.googleUser);
              this.updateGoogleProfileUI();

              if (btn) {
                btn.classList.remove('loading');
                btn.classList.add('success');
                setTimeout(() => btn.classList.remove('success'), 600);
              }

              this.showNotification(`Welcome, ${this.googleUser.name}!`, 'success');
              
              // Add haptic feedback
              if (navigator.vibrate) {
                navigator.vibrate([10, 50, 10]);
              }
            } catch (error) {
              console.error('Error fetching user info:', error);
              this.showNotification('Failed to get user information', 'error');
              if (btn) btn.classList.remove('loading');
            }
          }
        });
      } else {
        // Fallback: Show instructions for setting up OAuth
        this.showOAuthSetupInstructions();
        if (btn) btn.classList.remove('loading');
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      this.showNotification('Google sign-in failed', 'error');
      if (btn) btn.classList.remove('loading');
    }
  }

  showOAuthSetupInstructions() {
    const message = `Google OAuth is not configured yet!

To set up real Google authentication:

1. Go to Google Cloud Console (console.cloud.google.com)
2. Create a new project
3. Enable Google+ API or People API
4. Create OAuth 2.0 credentials (Chrome Extension type)
5. Add your extension ID from chrome://extensions/
6. Update manifest.json with your Client ID

See GOOGLE_AUTH_SETUP.md for detailed instructions.`;

    alert(message);
  }

  // Simulation method for testing without real OAuth
  async simulateGoogleSignIn(btn) {
    // Show a fake Google OAuth dialog for better UX
    this.showFakeGoogleDialog(async () => {
      this.googleUser = {
        email: 'demo@dhartilink.com',
        name: 'Demo User',
        picture: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"><circle cx="24" cy="24" r="24" fill="%233b82f6"/><text x="24" y="32" font-size="24" fill="white" text-anchor="middle" font-family="sans-serif">D</text></svg>',
        id: 'demo123'
      };

      await this.saveGoogleUser(this.googleUser);
      this.updateGoogleProfileUI();

      if (btn) {
        btn.classList.remove('loading');
        btn.classList.add('success');
        setTimeout(() => btn.classList.remove('success'), 600);
      }

      this.showNotification(`Welcome, ${this.googleUser.name}!`, 'success');
      
      // Add haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate([10, 50, 10]);
      }
    });
  }

  showFakeGoogleDialog(onSuccess) {
    // Create a fake Google login overlay
    const overlay = document.createElement('div');
    overlay.className = 'google-oauth-overlay';
    overlay.innerHTML = `
      <div class="google-oauth-dialog">
        <div class="google-oauth-header">
          <svg width="24" height="24" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <h3>Sign in with Google</h3>
          <button class="close-oauth-btn">×</button>
        </div>
        <div class="google-oauth-content">
          <div class="oauth-demo-notice">
            <strong>Demo Mode</strong>
            <p>This is a simulation for testing. Click continue to proceed.</p>
          </div>
          <div class="oauth-account">
            <div class="oauth-avatar">D</div>
            <div class="oauth-info">
              <div class="oauth-name">Demo User</div>
              <div class="oauth-email">demo@dhartilink.com</div>
            </div>
          </div>
          <div class="oauth-permissions">
            <p><strong>DhartiWallet</strong> wants to:</p>
            <ul>
              <li>✓ View your email address</li>
              <li>✓ View your basic profile info</li>
            </ul>
          </div>
          <button class="oauth-continue-btn">Continue as Demo User</button>
          <button class="oauth-cancel-btn">Cancel</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Handle buttons
    const continueBtn = overlay.querySelector('.oauth-continue-btn');
    const cancelBtn = overlay.querySelector('.oauth-cancel-btn');
    const closeBtn = overlay.querySelector('.close-oauth-btn');

    const removeOverlay = () => {
      overlay.style.opacity = '0';
      setTimeout(() => overlay.remove(), 300);
    };

    continueBtn.addEventListener('click', async () => {
      continueBtn.textContent = 'Signing in...';
      continueBtn.disabled = true;
      await new Promise(resolve => setTimeout(resolve, 1000));
      removeOverlay();
      setTimeout(() => onSuccess(), 400);
    });

    cancelBtn.addEventListener('click', () => {
      removeOverlay();
      const btn = document.getElementById('google-signin-btn');
      if (btn) btn.classList.remove('loading');
    });

    closeBtn.addEventListener('click', () => {
      removeOverlay();
      const btn = document.getElementById('google-signin-btn');
      if (btn) btn.classList.remove('loading');
    });

    // Animate in
    setTimeout(() => overlay.style.opacity = '1', 10);
  }

  async disconnectGoogle() {
    if (!this.googleUser) return;

    const confirmed = confirm(`Disconnect ${this.googleUser.email} from DhartiWallet?`);
    
    if (confirmed) {
      await this.removeGoogleUser();
      this.googleUser = null;
      this.updateGoogleProfileUI();
      this.showNotification('Google account disconnected', 'success');
      
      // Add haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(20);
      }
    }
  }

  switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab').forEach(tab => {
      tab.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');

    // Update tab panes
    document.querySelectorAll('.tab-pane').forEach(pane => {
      pane.classList.add('hidden');
    });
    document.getElementById(`${tabName}-tab`)?.classList.remove('hidden');
  }

  showNotification(message, type = 'info') {
    // Create notification element with improved responsiveness
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: clamp(12px, 3vh, 20px);
      left: 50%;
      transform: translateX(-50%);
      background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#4c82fb'};
      color: white;
      padding: clamp(10px, 2vh, 12px) clamp(18px, 5vw, 24px);
      border-radius: 8px;
      font-size: clamp(12px, 3.5vw, 14px);
      font-weight: 500;
      z-index: 1000;
      animation: slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
      max-width: 90%;
      text-align: center;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    // Add haptic feedback
    if (navigator.vibrate && type === 'success') {
      navigator.vibrate(10);
    } else if (navigator.vibrate && type === 'error') {
      navigator.vibrate([10, 50, 10]);
    }

    setTimeout(() => {
      notification.style.animation = 'slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  }
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }
  @keyframes slideUp {
    from {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
    to {
      opacity: 0;
      transform: translateX(-50%) translateY(-20px);
    }
  }
`;
document.head.appendChild(style);

// Initialize wallet
const wallet = new DhartiWallet();

