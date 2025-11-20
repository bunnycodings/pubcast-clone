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

#### `LINE_NOTIFY_TOKEN`
- **Description**: Token for sending LINE notifications when payments are completed
- **How to get**:
  1. Go to https://notify-bot.line.me/
  2. Login with your LINE account
  3. Go to "My page" → "Generate token"
  4. Select or create a group/channel
  5. Copy the token
- **Example**: `LINE_NOTIFY_TOKEN=abc123xyz...`
- **Where it's used**: 
  - `/api/line-notify` - Sends payment completion notifications
- **Note**: If not set, LINE notifications will be skipped (app still works)

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
   - `LINE_NOTIFY_TOKEN` (Optional)
   - `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT` (If using MySQL)

3. Set environment for each variable:
   - **Production**: For production deployments
   - **Preview**: For preview deployments
   - **Development**: For local development (optional)

4. Redeploy your application

## Security Best Practices

1. ✅ **Never commit `.env.local`** to version control
2. ✅ **Use strong passwords** for database in production
3. ✅ **Rotate tokens periodically** (especially LINE_NOTIFY_TOKEN)
4. ✅ **Keep PROMPTPAY_ID secure** (it's your payment recipient)
5. ✅ **Use different values** for development and production
6. ✅ **Limit database access** to only necessary IPs in production

## Troubleshooting

### "PROMPTPAY_ID environment variable is not configured"
- **Solution**: Add `PROMPTPAY_ID=your_number` to `.env.local`

### "Invalid PROMPTPAY_ID format"
- **Solution**: Ensure it's 10 digits (phone) starting with 0, or 13 digits (citizen ID)

### LINE notifications not working
- **Solution**: Check that `LINE_NOTIFY_TOKEN` is set correctly in `.env.local`
- **Note**: App still works without LINE notifications

### Database connection errors
- **Solution**: 
  1. Verify MySQL is running
  2. Check database credentials in `.env.local`
  3. Ensure database exists (run `database.sql`)
  4. Check firewall/network settings

