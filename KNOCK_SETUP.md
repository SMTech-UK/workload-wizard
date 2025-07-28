# Knock API Setup Guide

## Current Status
Your app has the public API key configured but is missing the server-side API key.

## Required API Keys

### 1. Public API Key (✅ Already configured)
- **Purpose**: Client-side notifications
- **Current Value**: `pk_test_g46PydCh_ehen0SYrfRIRuL-g2det_rvHeB0dbK9_Zw`
- **Location**: `.env.local` as `NEXT_PUBLIC_KNOCK_PUBLIC_API_KEY`

### 2. Server-Side API Key (❌ Missing)
- **Purpose**: Server-side user identification and workflow triggers
- **Required**: `sk_test_...` (starts with `sk_test_`)
- **Location**: Should be added to `.env.local` as `KNOCK_API_KEY`

## How to Get Your Server-Side API Key

1. **Go to Knock Dashboard**: https://app.knock.app/settings/api-keys
2. **Find your project**: Make sure you're in the correct project
3. **Copy the Server-Side API Key**: It should start with `sk_test_`
4. **Add to .env.local**:
   ```bash
   KNOCK_API_KEY=sk_test_your_server_side_key_here
   ```

## Environment Variables Summary

Your `.env.local` should include:

```bash
# Public key (for client-side)
NEXT_PUBLIC_KNOCK_PUBLIC_API_KEY=pk_test_g46PydCh_ehen0SYrfRIRuL-g2det_rvHeB0dbK9_Zw

# Server-side key (for server operations)
KNOCK_API_KEY=sk_test_your_server_side_key_here

# Channel IDs
NEXT_PUBLIC_KNOCK_RECENT_CHANGES_CHANNEL_ID=52d27dd0-c8db-4eb5-a1d1-efb2ab27c5b5
NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID=f5f6a75a-6881-42f6-8746-4b4824726487
```

## What Each Key Does

- **Public Key (`pk_test_...`)**: Used in the browser for real-time notifications
- **Server Key (`sk_test_...`)**: Used on the server for:
  - User identification/updates
  - Workflow triggers
  - Bulk operations
  - User management

## Testing

After adding the server-side key:

1. Restart your dev server: `npm run dev`
2. Check the console for success messages
3. Test user registration/login to see if Knock user identification works

## Troubleshooting

If you still see "Knock client not initialized":
1. Make sure the server key starts with `sk_test_`
2. Restart the dev server after adding the key
3. Check that the key is in the correct project in Knock dashboard 