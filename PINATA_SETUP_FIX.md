# Pinata Setup Fix - IPFS Upload Issue

## Problem Identified
The Pinata upload is failing with error: `403 Forbidden - NO_SCOPES_FOUND`

This means your Pinata API key doesn't have the required permissions to upload files to IPFS.

## Solution

### Option 1: Fix Pinata API Key Permissions (Recommended)

1. **Go to Pinata Dashboard**: https://app.pinata.cloud/
2. **Navigate to API Keys**: Go to your account settings and find "API Keys"
3. **Edit your existing API key** or create a new one
4. **Enable Required Scopes**:
   - ✅ `pinFileToIPFS` - Upload files to IPFS
   - ✅ `pinJSONToIPFS` - Upload JSON metadata to IPFS
   - ✅ `unpin` - Remove files from IPFS (optional)
5. **Save the changes**
6. **Update your `.env.local`** with the new API key if you created a new one

### Option 2: Use Fallback Mode (Current Implementation)

The application is currently configured with a fallback mode that creates mock IPFS URLs when Pinata fails. This allows you to test the application without fixing Pinata permissions.

**Current behavior:**
- ✅ File upload will work (with mock IPFS URLs)
- ✅ NFT minting will work
- ✅ All functionality will work for testing
- ⚠️ Files won't actually be stored on IPFS (mock URLs only)

### Option 3: Alternative IPFS Services

If you prefer not to use Pinata, you can replace it with:

1. **Web3.Storage** (Free tier available)
2. **IPFS Desktop** (Local IPFS node)
3. **Infura IPFS** (Requires Infura account)

## Testing the Fix

### Test Pinata Permissions
```bash
curl http://localhost:3001/api/test-pinata
```

### Test File Upload
```bash
curl -X POST http://localhost:3001/api/test-upload
```

### Test Full Upload Flow
1. Go to `http://localhost:3001/upload`
2. Upload a file with coordinates
3. Check the console logs for detailed error messages

## Current Status

✅ **Application is working** with fallback mode
✅ **All features functional** for testing
⚠️ **Pinata permissions need to be fixed** for production use

## Next Steps

1. **For Testing**: Continue using the current setup (fallback mode works)
2. **For Production**: Fix Pinata API key permissions as described above
3. **Alternative**: Consider switching to a different IPFS service

## Debug Information

The application now provides detailed logging:
- Pinata API key validation
- File size and type checking
- Detailed error messages
- Fallback mode activation

Check the server console logs for detailed information about what's happening during uploads.
