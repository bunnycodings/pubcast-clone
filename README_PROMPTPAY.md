# PromptPay QR Generator Service

A serverless Next.js service for generating Thai PromptPay QR codes. This service generates static QR codes that users can scan with their banking apps to make payments. **No payment gateway, no fees** - just QR code generation.

## 🎯 What This Does

- Generates **PromptPay QR codes** (Thai payment system)
- Works as a **serverless API** deployable on Vercel
- Provides a **reusable React component** for embedding in your website
- **No payment processing** - just QR code generation
- **No fees** - users pay directly through their banking apps

## ⚠️ Important Notes

- This service **does NOT move money** - it only generates QR codes
- Users scan the QR code with their banking app and complete the payment there
- There are **no gateway fees** because we're not using a payment service provider
- The actual payment is handled entirely by the user's bank app

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install
```

### Run Locally

```bash
# Start development server
npm run dev
```

The API will be available at `http://localhost:3000/api/promptpay-qr`

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
│           └── route.ts          # API endpoint
├── components/
│   └── PromptPayDonateButton.tsx # Reusable React component
├── lib/
│   ├── promptpay.ts              # PromptPay payload generator
│   └── qrcode.ts                 # QR code image generator
├── types/
│   └── api.ts                    # TypeScript type definitions
└── tests/
    └── promptpay.test.ts         # Unit tests
```

## 🔌 API Reference

### Endpoint

**POST** `/api/promptpay-qr`

### Request Body

```json
{
  "promptpayId": "0812345678",
  "amount": 100.5,
  "description": "Donation for stream"
}
```

**Fields:**
- `promptpayId` (required): String - 10-digit phone number (starting with 0) or 13-digit ID
- `amount` (optional): Number | null - Amount in THB. If `null` or omitted, generates a static QR (user enters amount in app)
- `description` (optional): String | null - For your reference only (not included in QR code)

### Response

**Success (200):**
```json
{
  "payload": "000201010212...",
  "qrDataUrl": "data:image/png;base64,iVBORw0KGgo...",
  "expiresAt": "2024-01-02T12:00:00.000Z"
}
```

**Error (400/500):**
```json
{
  "error": {
    "code": "INVALID_INPUT",
    "message": "promptpayId is required and must be a non-empty string",
    "details": "..."
  }
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
    "promptpayId": "0812345678",
    "amount": 100.5,
    "description": "Test donation"
  }'

# Generate static QR (no amount)
curl -X POST http://localhost:3000/api/promptpay-qr \
  -H "Content-Type: application/json" \
  -d '{
    "promptpayId": "0812345678",
    "amount": null
  }'
```

### Using JavaScript/TypeScript

```typescript
const response = await fetch('https://your-app.vercel.app/api/promptpay-qr', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    promptpayId: '0812345678',
    amount: 100.5,
    description: 'Donation',
  }),
});

const data = await response.json();

if ('error' in data) {
  console.error('Error:', data.error.message);
} else {
  // Use data.qrDataUrl in an <img> tag
  console.log('QR Code:', data.qrDataUrl);
  console.log('Payload:', data.payload);
}
```

## 🎨 Using the React Component

Import and use the `PromptPayDonateButton` component in your React/Next.js pages:

```tsx
import PromptPayDonateButton from '@/components/PromptPayDonateButton';

export default function MyPage() {
  return (
    <div>
      <h1>Support Us</h1>
      <PromptPayDonateButton
        promptpayId="0812345678"
        defaultAmount={100}
        label="Donate via PromptPay"
      />
    </div>
  );
}
```

**Props:**
- `promptpayId` (required): The PromptPay ID
- `defaultAmount` (optional): Default amount to pre-fill
- `label` (optional): Button label (default: "Donate via PromptPay")

## 🚢 Deployment to Vercel

### Step 1: Push to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: PromptPay QR generator"

# Add your GitHub repository as remote
git remote add origin https://github.com/yourusername/your-repo.git

# Push to GitHub
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Vercel will auto-detect Next.js settings:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)
5. Click **"Deploy"**

### Step 3: Access Your API

After deployment, your API will be available at:
```
https://your-project-name.vercel.app/api/promptpay-qr
```

### Environment Variables (Optional)

You can set a default PromptPay ID via environment variable:
- Variable name: `PROMPTPAY_ID`
- Value: Your PromptPay ID (e.g., `0812345678`)

Set this in Vercel: Project Settings → Environment Variables

## 🧪 Running Tests

```bash
# Run tests
npm test
```

Tests are located in the `tests/` directory and cover:
- PromptPay payload generation with amount
- PromptPay payload generation without amount
- Invalid ID validation

## 🔧 How It Works

### PromptPay Payload Generation

The `buildPromptPayPayload` function in `lib/promptpay.ts`:
- Uses the `promptpay-qr` npm library
- Generates an EMV-compliant QR code payload
- Follows the Thai QR Payment standard (PromptPay)
- Includes amount if provided, otherwise generates a static QR

### QR Code Image Generation

The `generateQrDataUrl` function in `lib/qrcode.ts`:
- Uses the `qrcode` npm library
- Converts the payload string into a PNG image
- Returns a data URL (`data:image/png;base64,...`)
- Works in serverless environments (no filesystem needed)

### Serverless Architecture

- Next.js App Router API routes run as **serverless functions** on Vercel
- Each API request spawns a new function instance
- No long-lived processes or server management needed
- Auto-scales based on traffic

## 📝 Input Validation

The API validates:
- **PromptPay ID**: Must be 10-digit phone (starts with 0) or 13-digit ID
- **Amount**: Must be positive number if provided
- **Description**: Optional, for reference only

## 🔒 Security Considerations

- Input validation prevents invalid data
- No sensitive data is logged in production
- CORS headers allow cross-origin requests (can be restricted if needed)
- Error messages don't expose internal implementation details

## 📦 Dependencies

- `next`: Next.js framework
- `react`: React library
- `promptpay-qr`: PromptPay payload generator
- `qrcode`: QR code image generator
- `@types/qrcode`: TypeScript types for qrcode

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

**Q: How long are QR codes valid?**  
A: The QR code itself doesn't expire, but the `expiresAt` field is provided for UI display purposes (24 hours by default).

---

Built with ❤️ using Next.js and TypeScript

