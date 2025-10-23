// DhartiWallet - Background Service Worker

console.log('DhartiWallet background script loaded');

// Handle installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('DhartiWallet extension installed');
  
  // Set default values
  chrome.storage.local.set({
    network: 'ethereum-mainnet',
    currency: 'USD'
  });
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request);

  switch (request.type) {
    case 'GET_WALLET':
      chrome.storage.local.get(['wallet'], (result) => {
        sendResponse({ wallet: result.wallet || null });
      });
      return true; // Keep channel open for async response

    case 'REQUEST_ACCOUNTS':
      handleRequestAccounts(sender, sendResponse);
      return true;

    case 'SEND_TRANSACTION':
      handleSendTransaction(request.data, sendResponse);
      return true;

    case 'SIGN_MESSAGE':
      handleSignMessage(request.data, sendResponse);
      return true;

    case 'GET_BALANCE':
      handleGetBalance(request.address, sendResponse);
      return true;

    default:
      sendResponse({ error: 'Unknown request type' });
  }
});

// Handle account requests (like MetaMask)
async function handleRequestAccounts(sender, sendResponse) {
  chrome.storage.local.get(['wallet'], (result) => {
    if (result.wallet) {
      sendResponse({ accounts: [result.wallet.address] });
    } else {
      sendResponse({ accounts: [] });
    }
  });
}

// Handle transaction sending
async function handleSendTransaction(data, sendResponse) {
  const { to, value, from } = data;
  
  // Validate transaction
  if (!to || !value) {
    sendResponse({ error: 'Invalid transaction data' });
    return;
  }

  // In a real implementation, this would:
  // 1. Show a confirmation popup
  // 2. Sign the transaction with the private key
  // 3. Broadcast to the network
  // 4. Return the transaction hash

  // For demo purposes, simulate a successful transaction
  const txHash = '0x' + Array.from({ length: 64 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('');

  console.log('Transaction sent:', { to, value, from, txHash });

  sendResponse({ 
    success: true, 
    txHash,
    message: 'Transaction sent successfully'
  });
}

// Handle message signing
async function handleSignMessage(data, sendResponse) {
  const { message } = data;

  // In a real implementation, this would:
  // 1. Show a confirmation popup
  // 2. Sign the message with the private key
  // 3. Return the signature

  // For demo purposes, generate a mock signature
  const signature = '0x' + Array.from({ length: 130 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('');

  console.log('Message signed:', { message, signature });

  sendResponse({ 
    success: true, 
    signature,
    message: 'Message signed successfully'
  });
}

// Handle balance requests
async function handleGetBalance(address, sendResponse) {
  // In a real implementation, this would query the blockchain
  // For demo purposes, return a mock balance
  
  const balance = {
    eth: '0.0000',
    usd: '0.00'
  };

  sendResponse({ balance });
}

// Handle tab updates to inject content script
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    console.log('Tab updated:', tab.url);
  }
});

// Keep service worker alive
chrome.alarms.create('keep-alive', { periodInMinutes: 1 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'keep-alive') {
    console.log('DhartiWallet service worker alive');
  }
});

