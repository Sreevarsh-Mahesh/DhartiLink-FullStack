// DhartiWallet - Inpage Script
// Creates the window.dhartiWallet provider object (like window.ethereum)

console.log('DhartiWallet inpage script loaded');

(function() {
  let requestId = 0;
  const pendingRequests = new Map();

  // Create the provider object
  const dhartiWallet = {
    isDhartiWallet: true,
    isConnected: () => true,
    chainId: '0x1', // Ethereum Mainnet
    networkVersion: '1',
    selectedAddress: null,

    // Request accounts (like eth_requestAccounts)
    async request(args) {
      const { method, params = [] } = args;

      switch (method) {
        case 'eth_requestAccounts':
        case 'eth_accounts':
          return this.requestAccounts();

        case 'eth_sendTransaction':
          return this.sendTransaction(params[0]);

        case 'personal_sign':
          return this.signMessage(params[0]);

        case 'eth_getBalance':
          return this.getBalance(params[0]);

        case 'eth_chainId':
          return this.chainId;

        case 'net_version':
          return this.networkVersion;

        default:
          throw new Error(`Method ${method} not supported`);
      }
    },

    // Request accounts
    async requestAccounts() {
      const response = await sendMessageToContentScript('DHARTI_REQUEST_ACCOUNTS');
      
      if (response.accounts && response.accounts.length > 0) {
        this.selectedAddress = response.accounts[0];
        this.emit('accountsChanged', response.accounts);
        return response.accounts;
      }
      
      throw new Error('No accounts available. Please create or import a wallet.');
    },

    // Send transaction
    async sendTransaction(transactionData) {
      if (!this.selectedAddress) {
        await this.requestAccounts();
      }

      const response = await sendMessageToContentScript('DHARTI_SEND_TRANSACTION', {
        ...transactionData,
        from: this.selectedAddress
      });

      if (response.error) {
        throw new Error(response.error);
      }

      return response.txHash;
    },

    // Sign message
    async signMessage(message) {
      if (!this.selectedAddress) {
        await this.requestAccounts();
      }

      const response = await sendMessageToContentScript('DHARTI_SIGN_MESSAGE', {
        message,
        address: this.selectedAddress
      });

      if (response.error) {
        throw new Error(response.error);
      }

      return response.signature;
    },

    // Get balance
    async getBalance(address) {
      const response = await sendMessageToContentScript('DHARTI_GET_BALANCE', {
        address: address || this.selectedAddress
      });

      return response.balance;
    },

    // Event emitter functionality
    _events: {},
    
    on(eventName, callback) {
      if (!this._events[eventName]) {
        this._events[eventName] = [];
      }
      this._events[eventName].push(callback);
    },

    removeListener(eventName, callback) {
      if (!this._events[eventName]) return;
      this._events[eventName] = this._events[eventName].filter(cb => cb !== callback);
    },

    emit(eventName, ...args) {
      if (!this._events[eventName]) return;
      this._events[eventName].forEach(callback => {
        try {
          callback(...args);
        } catch (error) {
          console.error('Event handler error:', error);
        }
      });
    }
  };

  // Helper function to send messages to content script
  function sendMessageToContentScript(type, data = {}) {
    return new Promise((resolve, reject) => {
      const id = ++requestId;
      
      pendingRequests.set(id, { resolve, reject });

      window.postMessage({
        type,
        id,
        data
      }, '*');

      // Timeout after 30 seconds
      setTimeout(() => {
        if (pendingRequests.has(id)) {
          pendingRequests.delete(id);
          reject(new Error('Request timeout'));
        }
      }, 30000);
    });
  }

  // Listen for responses from content script
  window.addEventListener('message', (event) => {
    if (event.source !== window) return;

    const { type, id, data } = event.data;
    
    if (!type || !type.endsWith('_RESPONSE')) return;

    const pending = pendingRequests.get(id);
    if (pending) {
      pendingRequests.delete(id);
      
      if (data.error) {
        pending.reject(new Error(data.error));
      } else {
        pending.resolve(data);
      }
    }
  });

  // Expose the provider
  window.dhartiWallet = dhartiWallet;

  // Also expose as window.ethereum for compatibility (optional)
  if (!window.ethereum) {
    window.ethereum = dhartiWallet;
  }

  // Announce provider
  window.dispatchEvent(new Event('dhartiWallet#initialized'));
  
  console.log('DhartiWallet provider injected:', window.dhartiWallet);
})();

