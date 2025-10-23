# Google Maps API Setup Instructions

## Current Issue
The Google Maps API is not working due to:
1. **RefererNotAllowedMapError**: localhost:3000 is not in the allowed referrers
2. **BillingNotEnabledMapError**: Billing is not enabled for the API key

## Solution: Set Up Your Own Google Maps API Key

### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your project ID

### Step 2: Enable Required APIs
Enable these APIs in your project:
- **Maps JavaScript API**
- **Places API** 
- **Geocoding API**

### Step 3: Create API Key
1. Go to "Credentials" in the Google Cloud Console
2. Click "Create Credentials" → "API Key"
3. Copy your API key

### Step 4: Configure API Key Restrictions
1. Click on your API key to edit it
2. Under "Application restrictions", select "HTTP referrers"
3. Add these referrers:
   - `http://localhost:3000/*`
   - `https://yourdomain.com/*` (for production)
4. Under "API restrictions", select "Restrict key"
5. Choose the APIs you enabled in Step 2

### Step 5: Enable Billing
1. Go to "Billing" in Google Cloud Console
2. Link a billing account to your project
3. Google Maps requires billing to be enabled (but has free tier)

### Step 6: Add API Key to Project
1. Create a `.env.local` file in your project root
2. Add this line:
   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
   ```
3. Replace `your_actual_api_key_here` with your real API key

### Step 7: Restart Development Server
```bash
pnpm dev
```

## Alternative: Use Without Google Maps
The application will work with just the 3D globe view. Google Maps is only needed for:
- Detailed satellite imagery
- Address geocoding
- Street-level navigation

The core functionality (globe, portfolio, marketplace) works without Google Maps.

## Cost Information
- Google Maps has a free tier: $200/month credit
- This covers most development and small production usage
- Check Google Maps pricing for your specific needs
