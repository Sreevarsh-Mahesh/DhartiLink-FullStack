# Google Maps API Billing Setup

## Current Issue
Your Google Maps API is showing a `BillingNotEnabledMapError`. This means billing needs to be enabled for your Google Cloud project.

## How to Fix

### Step 1: Enable Billing
1. Go to [Google Cloud Console Billing](https://console.cloud.google.com/billing)
2. Select your project (or create a new one)
3. Click "Link a billing account" or "Create billing account"
4. Add a payment method (credit card)

### Step 2: Enable Maps API
1. Go to [Google Cloud Console APIs](https://console.cloud.google.com/apis/library)
2. Search for "Maps JavaScript API"
3. Click on it and press "Enable"
4. Also enable "Places API" and "Geocoding API" if needed

### Step 3: Configure API Key
1. Go to [API Credentials](https://console.cloud.google.com/apis/credentials)
2. Find your API key: `AIzaSyCVzTgaYCdrtau2c8WkVQSJjaruwjqDu1k`
3. Click on it to edit
4. Under "Application restrictions", add:
   - `localhost:3000`
   - `localhost:3001`
   - `localhost:3002`
   - `localhost:3003`
   - Your production domain (when deployed)

### Step 4: Set Usage Limits (Optional)
1. In the API key settings, you can set daily usage limits
2. For development, you can set a low limit like $1-5 per day
3. This prevents unexpected charges

## Cost Information
- **Free Tier**: $200 credit per month for new users
- **Maps JavaScript API**: $7 per 1,000 requests after free tier
- **Places API**: $17 per 1,000 requests after free tier
- **Geocoding API**: $5 per 1,000 requests after free tier

## Alternative: Use Without Billing
If you don't want to enable billing, the application will show a fallback message instead of the map. The rest of the application will work normally.

## After Setup
Once billing is enabled, refresh your application and the Google Maps should work properly.
