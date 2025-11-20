# Environment Variables Setup Guide

This guide explains all environment variables used in the application and how to configure them.

## Quick Setup

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and fill in your values (see sections below)

3. Restart your development server:
   ```bash
   npm run dev
   ```

## Environment Variables

### Required Variables

#### `PROMPTPAY_ID`
- **Description**: Your PromptPay ID - This is the recipient account for all QR codes generated
- **Format**: 
  - 10-digit Thai phone number (starts with 0), e.g., `0812345678`
  - OR 13-digit Citizen ID, e.g., `1234567890123`
- **Example**: `PROMPTPAY_ID=0812345678`
- **Where it's used**: 
  - `/api/promptpay-qr` - Generates QR codes with this ID as recipient
- **Security**: Keep this secure - it's your payment recipient account

### Optional Variables

#### `LINE_CHANNEL_SECRET`
- **Description**: Channel Secret for LINE Messaging API (used for webhook signature verification)
- **How to get**:
  1. Go to https://developers.line.biz/console/
  2. Login with your LINE account
  3. Select or create a Messaging API channel
  4. Go to the "Basic settings" tab
  5. Copy the "Channel secret" value
- **Example**: `LINE_CHANNEL_SECRET=abc123xyz...`
- **Where it's used**: 
  - `/api/line-notify` - Used for LINE Messaging API authentication
- **Note**: **Required** for LINE Messaging API configuration

#### `LINE_CHANNEL_ACCESS_TOKEN` (Optional)
- **Description**: Channel Access Token for LINE Messaging API (used to send push messages)
- **How to get**:
  1. Go to https://developers.line.biz/console/
  2. Login with your LINE account
  3. Select your Messaging API channel
  4. Go to the "Messaging API" tab
  5. Scroll to "Channel access token" section
  6. Click "Issue" to generate a new token (or use existing one)
  7. Copy the token
- **Example**: `LINE_CHANNEL_ACCESS_TOKEN=abc123xyz...`
- **Where it's used**: 
  - `/api/line-notify` - Used to send payment completion notifications
- **Note**: **Optional** - Required only if you want to send push messages. Token format should NOT include "Bearer" prefix (it's added automatically). If not provided, LINE will be configured but messages won't be sent.

#### `LINE_USER_ID` (Optional)
- **Description**: LINE User ID to send push messages to
- **How to get**:
  1. Add your LINE bot as a friend
  2. Send a message to your bot
  3. Check webhook events or use LINE's API to get your user ID
  4. Or use LINE Official Account Manager to find user IDs
- **Example**: `LINE_USER_ID=U1234567890abcdef1234567890abcdef`
- **Where it's used**: 
  - `/api/line-notify` - Recipient for push messages
- **Note**: **Optional** - Required only if you want to send push messages. Either LINE_USER_ID or LINE_GROUP_ID must be set if using access token.

#### `LINE_GROUP_ID` (Optional)
- **Description**: LINE Group ID to send push messages to
- **How to get**:
  1. Add your LINE bot to a group
  2. Check webhook events or use LINE's API to get the group ID
  3. Or use LINE Official Account Manager
- **Example**: `LINE_GROUP_ID=C1234567890abcdef1234567890abcdef`
- **Where it's used**: 
  - `/api/line-notify` - Recipient for push messages
- **Note**: **Optional** - Required only if you want to send push messages. Either LINE_USER_ID or LINE_GROUP_ID must be set if using access token. If both are set, LINE_USER_ID takes priority

#### `DB_HOST`
- **Description**: MySQL database host
- **Default**: `localhost`
- **Example**: `DB_HOST=localhost` or `DB_HOST=db.example.com`
- **Where it's used**: Authentication API routes (when MySQL is enabled)

#### `DB_USER`
- **Description**: MySQL database username
- **Default**: `root`
- **Example**: `DB_USER=myuser`
- **Where it's used**: Authentication API routes (when MySQL is enabled)

#### `DB_PASSWORD`
- **Description**: MySQL database password
- **Default**: Empty string
- **Example**: `DB_PASSWORD=mypassword123`
- **Where it's used**: Authentication API routes (when MySQL is enabled)
- **Security**: Use strong passwords in production

#### `DB_NAME`
- **Description**: MySQL database name
- **Default**: `pubcast_db`
- **Example**: `DB_NAME=pubcast_db`
- **Where it's used**: Authentication API routes (when MySQL is enabled)
- **Note**: Create database using `database.sql` first

#### `DB_PORT`
- **Description**: MySQL database port
- **Default**: `3306`
- **Example**: `DB_PORT=3306`
- **Where it's used**: Authentication API routes (when MySQL is enabled)

## Environment Files

### `.env.local`
- **Purpose**: Your actual configuration values (local development)
- **Status**: Git-ignored (never commit this file)
- **Contains**: Real tokens, passwords, and sensitive data

### `.env.example`
- **Purpose**: Template showing all available environment variables
- **Status**: Committed to git (safe to share)
- **Contains**: Example values and documentation

## Setting Up MySQL (Optional)

The app works without MySQL (uses cookies for sessions), but you can enable MySQL for persistent user storage:

1. **Install MySQL** on your system

2. **Create the database**:
   ```bash
   mysql -u root -p < database.sql
   ```

3. **Install mysql2 package**:
   ```bash
   npm install mysql2
   ```

4. **Configure environment variables** in `.env.local`:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=pubcast_db
   DB_PORT=3306
   ```

5. **Uncomment MySQL code** in:
   - `app/api/auth/register/route.ts`
   - `app/api/auth/login/route.ts`
   - `app/api/auth/user/route.ts`

## Vercel Deployment

When deploying to Vercel:

1. Go to **Project Settings** → **Environment Variables**

2. Add each variable:
   - `PROMPTPAY_ID` (Required)
   - `LINE_CHANNEL_SECRET` (Required for LINE configuration)
   - `LINE_CHANNEL_ACCESS_TOKEN` (Optional - required only for sending messages)
   - `LINE_USER_ID` or `LINE_GROUP_ID` (Optional - required only for sending messages)
   - `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT` (If using MySQL)

3. Set environment for each variable:
   - **Production**: For production deployments
   - **Preview**: For preview deployments
   - **Development**: For local development (optional)

4. Redeploy your application

## Security Best Practices

1. ✅ **Never commit `.env.local`** to version control
2. ✅ **Use strong passwords** for database in production
3. ✅ **Rotate tokens periodically** (especially LINE_CHANNEL_ACCESS_TOKEN)
4. ✅ **Keep PROMPTPAY_ID secure** (it's your payment recipient)
5. ✅ **Keep LINE_CHANNEL_SECRET secure** (it's used for webhook verification)
6. ✅ **Use different values** for development and production
7. ✅ **Limit database access** to only necessary IPs in production

## Troubleshooting

### "PROMPTPAY_ID environment variable is not configured"
- **Solution**: Add `PROMPTPAY_ID=your_number` to `.env.local`

### "Invalid PROMPTPAY_ID format"
- **Solution**: Ensure it's 10 digits (phone) starting with 0, or 13 digits (citizen ID)

### LINE notifications not working
- **Solution**: 
  1. Check that `LINE_CHANNEL_SECRET` is set correctly in `.env.local` (required)
  2. If you want to send messages, ensure `LINE_CHANNEL_ACCESS_TOKEN` is configured
  3. If sending messages, ensure either `LINE_USER_ID` or `LINE_GROUP_ID` is configured
  4. Verify the channel access token is valid and not expired
  5. Check that the user/group ID is correct
- **Note**: 
  - `LINE_CHANNEL_SECRET` is required for LINE configuration
  - `LINE_CHANNEL_ACCESS_TOKEN` is optional - only needed if you want to send push messages
  - App still works without LINE notifications (they're optional)

### Database connection errors
- **Solution**: 
  1. Verify MySQL is running
  2. Check database credentials in `.env.local`
  3. Ensure database exists (run `database.sql`)
  4. Check firewall/network settings

