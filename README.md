# PromptPay QR Donation Service

A production-ready Next.js service for generating Thai PromptPay QR codes. This service generates QR codes that users can scan with their banking apps to make donations. **No payment gateway, no fees** - just QR code generation.

## 🎯 What This Does

- Generates **PromptPay QR codes** (Thai payment system) using EMV-compliant format
- Works as a **serverless API** deployable on Vercel
- Reusable **React component** (`<PromptPayDonationWidget />`) for easy integration
- **No payment processing** - just QR code generation
- **No fees** - users pay directly through their banking apps

## ⚠️ Important Notes

- This service **does NOT move money** - it only generates QR codes
- Users scan the QR code with their banking app and complete the payment there
- There are **no gateway fees** because we're not using a payment service provider
- The actual payment is handled entirely by the user's bank app
- You'll need to verify payments manually in your bank app (no automatic webhook confirmation)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install
```

### Environment Variables

1. **Copy the example file:**
   ```bash
   cp .env.example .env.local
   ```

2. **Edit `.env.local`** and fill in your values:

```env
# PromptPay Configuration (REQUIRED)
PROMPTPAY_ID=0812345678

# LINE Notify Configuration (OPTIONAL)
LINE_NOTIFY_TOKEN=your_line_notify_token_here

# MySQL Database Configuration (OPTIONAL - for user registration)
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=your_password
# DB_NAME=pubcast_db
# DB_PORT=3306
```

**Required Variables:**
- `PROMPTPAY_ID`: Your PromptPay ID (10-digit phone starting with 0, or 13-digit Citizen ID)

**Optional Variables:**
- `LINE_NOTIFY_TOKEN`: Get from [LINE Notify](https://notify-bot.line.me/) → My page → Generate token
- `DB_*`: MySQL database credentials (only needed if using database for user registration)

📖 **For detailed setup instructions, see [ENV_SETUP.md](./ENV_SETUP.md)**

### Database Setup

#### For Local Development or Full MySQL Access:

1. Run the SQL script:
   ```bash
   mysql -u root -p < database.sql
   ```

#### For Shared Hosting (cPanel, Plesk, etc.):

If you get an error like `#1044 - Access denied for user 'xxx'@'127.0.0.1' to database 'pubcast_db'`:

1. **Your hosting provider has already created the database** - you don't need to create it
2. **Find your database name** from your hosting control panel (usually shown in cPanel → MySQL Databases)
3. **Use `database-shared-hosting.sql`** instead:
   - Open phpMyAdmin from your hosting control panel
   - Select your database from the left sidebar
   - Go to the "SQL" tab
   - Copy and paste the contents of `database-shared-hosting.sql`
   - Click "Go" to execute
4. **Update your `.env.local`** with the correct database name from your hosting panel:
   ```env
   DB_NAME=u227507338_pubcast_db  # Use your actual database name
   DB_HOST=localhost  # Usually localhost for shared hosting
   DB_USER=u227507338_pubcast_db  # Your database username
   DB_PASSWORD=your_password  # Your database password
   ```

### Run Locally

```bash
# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
# Build the project
npm run build

# Start production server (for testing)
npm start
```

## 📁 Project Structure

```
.
├── app/
│   └── api/
│       └── promptpay-qr/
│           └── route.ts          # API endpoint (POST /api/promptpay-qr)
├── components/
│   └── PromptPayDonationWidget.tsx  # Reusable React component
├── lib/
│   ├── promptpay.ts              # PromptPay payload generator (EMV format)
│   └── qrcode.ts                 # QR code image generator
├── .env.example                  # Environment variable template
└── package.json
```

## 🔌 API Reference

### Endpoint

**POST** `/api/promptpay-qr`

This endpoint uses your static `PROMPTPAY_ID` from environment variables. You don't need to pass the PromptPay ID in the request.

### Request Body

```json
{
  "amount": 100.5,
  "message": "Donation"
}
```

**Fields:**
- `amount` (optional): Number - Amount in THB. If omitted or 0, generates a static/open amount QR (user enters amount in app)
- `message` (optional): String - For your reference only (not included in QR code payload)

### Response

**Success (200):**
```json
{
  "payload": "00020101021230...",
  "qrDataUrl": "data:image/svg+xml;base64,..."
}
```

**Error (400/500):**
```json
{
  "error": "Error message here"
}
```

### Response

**Success (200):**
```json
{
  "payload": "000201010212...",
  "promptpayId": "0812345678",
  "amount": 100.5
}
```

**Error (400/500):**
```json
{
  "error": "Error message here"
}
```

### CORS

The API includes CORS headers allowing cross-origin requests:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: POST, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type`

## 🧪 Testing the API

### Using cURL

```bash
# Generate QR with amount
curl -X POST http://localhost:3000/api/promptpay-qr \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100.5,
    "message": "Test donation"
  }'

# Generate static QR (open amount)
curl -X POST http://localhost:3000/api/promptpay-qr \
  -H "Content-Type: application/json" \
  -d '{}'
```

### Using JavaScript/TypeScript

```typescript
const response = await fetch('/api/promptpay-qr', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    amount: 100.5,
    message: 'Donation',
  }),
});

const data = await response.json();

if (data.error) {
  console.error('Error:', data.error);
} else {
  // Use data.qrDataUrl directly in an <img> tag
  console.log('QR Data URL:', data.qrDataUrl);
  console.log('Payload:', data.payload);
}
```

## 🎨 Using the React Component

The `PromptPayDonationWidget` component can be easily dropped into any page:

```tsx
import PromptPayDonationWidget from '@/components/PromptPayDonationWidget';

export default function DonatePage() {
  return (
    <div>
      <h1>Support Us</h1>
      <PromptPayDonationWidget />
    </div>
  );
}
```

The component handles:
- Amount input validation
- Optional message field
- QR code generation via API
- Display of QR image
- Masked PromptPay ID display
- Error handling

## 🚢 Deployment to Vercel

### Step 1: Push to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: PromptPay QR donation service"

# Add your GitHub repository as remote
git remote add origin https://github.com/yourusername/your-repo.git

# Push to GitHub
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Configure environment variables:
   - Click **"Environment Variables"**
   - Add: `PROMPTPAY_ID` = `0812345678` (your PromptPay ID)
5. Vercel will auto-detect Next.js settings:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)
6. Click **"Deploy"**

### Step 3: Access Your Service

After deployment, your service will be available at:
```
https://your-project-name.vercel.app
```

Your API endpoint will be at:
```
https://your-project-name.vercel.app/api/promptpay-qr
```

## 📝 How It Works

### API Route Location

In Next.js App Router, API routes are located at:
- `app/api/promptpay-qr/route.ts` → Serves `POST /api/promptpay-qr`

The frontend calls it using:
```typescript
fetch('/api/promptpay-qr', { method: 'POST', ... })
```

### PromptPay Payload Generation

The `buildPromptPayPayload` function in `lib/promptpay.ts`:
- Uses the `promptpay-qr` npm library
- Generates an EMV-compliant QR code payload
- Follows the Thai QR Payment standard (PromptPay)
- Includes proper CRC-16/CCITT-FALSE calculation
- Supports both mobile numbers (10 digits) and citizen IDs (13 digits)

### EMV Format Details

The payload follows EMV QR Code structure:
- **00**: Payload Format Indicator ("01" for EMV)
- **01**: Point of Initiation Method ("11" = static, "12" = dynamic with amount)
- **30**: Merchant Account Information
  - **00**: AID (Application Identifier) - "A000000677010111" for PromptPay
  - **01**: Merchant ID (your phone number or citizen ID)
- **54**: Transaction Amount (optional, in THB)
- **58**: Country Code ("TH")
- **53**: Currency Code ("764" for THB)
- **63**: CRC-16 checksum (4 hex digits)

The `promptpay-qr` library handles all EMV formatting and CRC calculation automatically.

## 🔧 How It Works

### PromptPay Payload Generation

The `buildPromptPayPayload` function in `lib/promptpay.ts`:
- Uses the `promptpay-qr` npm library
- Generates an EMV-compliant QR code payload
- Follows the Thai QR Payment standard (PromptPay)
- Includes amount if provided, otherwise generates a static QR

The payload format follows EMV QR Code structure:
- Starts with `000201` (EMV QR header)
- Contains merchant account information
- Includes amount if specified
- Ends with CRC checksum

### Frontend QR Code Rendering

The React UI uses `qrcode.react` library to:
- Render the QR code as an SVG
- Display it directly in the browser
- No server-side image generation needed for the UI

### Serverless Architecture

- Next.js App Router API routes run as **serverless functions** on Vercel
- Each API request spawns a new function instance
- No long-lived processes or server management needed
- Auto-scales based on traffic

## 📝 Input Validation

The API validates:
- **PromptPay ID**: Must be 10-digit phone (starts with 0) or 13-digit ID
- **Amount**: Must be 0 or greater, max 1,000,000 THB
- **Message**: Optional, for reference only

## 🔒 Security Considerations

- Input validation prevents invalid data
- No sensitive data is logged in production
- CORS headers allow cross-origin requests (can be restricted if needed)
- Error messages don't expose internal implementation details

## 📦 Dependencies

- `next`: Next.js framework
- `react`: React library
- `promptpay-qr`: PromptPay payload generator
- `qrcode.react`: React QR code component
- `@types/qrcode`: TypeScript types

## 🤝 Contributing

This is a simple service, but if you find bugs or want to improve it:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - feel free to use this in your projects!

## 🙋 FAQ

**Q: Does this actually process payments?**  
A: No, it only generates QR codes. Users scan the QR with their banking app to complete the payment.

**Q: Are there any fees?**  
A: No gateway fees. Users may pay standard bank transfer fees depending on their bank.

**Q: Can I use this from another website?**  
A: Yes! The API has CORS enabled, so you can call it from any domain.

**Q: What's the difference between static and dynamic QR codes?**  
A: Static QR (no amount) lets users enter any amount in their app. Dynamic QR (with amount) pre-fills the amount.

**Q: How do I change the default PromptPay ID?**  
A: Set the `NEXT_PUBLIC_DEFAULT_PROMPTPAY_ID` environment variable in Vercel project settings.

---

Built with ❤️ using Next.js and TypeScript
