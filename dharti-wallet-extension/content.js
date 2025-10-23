// DhartiWallet - Content Script
// Injects the wallet provider into web pages

console.log('DhartiWallet content script loaded');

// Inject the inpage script
const script = document.createElement('script');
script.src = chrome.runtime.getURL('inpage.js');
script.onload = function() {
  this.remove();
};
(document.head || document.documentElement).appendChild(script);

// Listen for messages from the injected script
window.addEventListener('message', async (event) => {
  // Only accept messages from same window
  if (event.source !== window) return;

  const { type, id, data } = event.data;

  // Only handle DhartiWallet messages
  if (!type || !type.startsWith('DHARTI_')) return;

  console.log('Content script received:', event.data);

  try {
    let response;

    switch (type) {
      case 'DHARTI_REQUEST_ACCOUNTS':
        response = await requestAccounts();
        break;

      case 'DHARTI_SEND_TRANSACTION':
        response = await sendTransaction(data);
        break;

      case 'DHARTI_SIGN_MESSAGE':
        response = await signMessage(data);
        break;

      case 'DHARTI_GET_BALANCE':
        response = await getBalance(data.address);
        break;

      default:
        response = { error: 'Unknown request type' };
    }

    // Send response back to page
    window.postMessage({
      type: `${type}_RESPONSE`,
      id,
      data: response
    }, '*');

  } catch (error) {
    console.error('Content script error:', error);
    window.postMessage({
      type: `${type}_RESPONSE`,
      id,
      data: { error: error.message }
    }, '*');
  }
});

// Request accounts from background script
async function requestAccounts() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      { type: 'REQUEST_ACCOUNTS' },
      (response) => {
        resolve(response);
      }
    );
  });
}

// Send transaction via background script
async function sendTransaction(data) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      { type: 'SEND_TRANSACTION', data },
      (response) => {
        resolve(response);
      }
    );
  });
}

// Sign message via background script
async function signMessage(data) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      { type: 'SIGN_MESSAGE', data },
      (response) => {
        resolve(response);
      }
    );
  });
}

// Get balance via background script
async function getBalance(address) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      { type: 'GET_BALANCE', address },
      (response) => {
        resolve(response);
      }
    );
  });
}

console.log('DhartiWallet content script ready');

