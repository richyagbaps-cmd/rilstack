# RILSTACK - Deployment Guide

## 🚀 Quick Start (Recommended)

### Windows PowerShell - Automated Deployment

Open **PowerShell as Administrator** and run:

```powershell
cd C:\Users\hp\.ms-ad
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
.\deploy.ps1
```

This script will:
✅ Check for Node.js (install if missing)
✅ Install project dependencies  
✅ Build the application
✅ Start the dev server

---

## 📋 Manual Setup (If Automated Script Doesn't Work)

### Step 1: Install Node.js

1. Go to https://nodejs.org
2. Download **LTS version** (v20 or higher)
3. Run the installer and follow default settings
4. **Restart PowerShell** after installation
5. Verify installation:

```powershell
node --version
npm --version
```

### Step 2: Install Dependencies

```powershell
cd C:\Users\hp\.ms-ad
npm install
```

### Step 3: Configure Environment Variables

Edit `.env.local`:

```env
# REQUIRED - Get from https://dashboard.paystack.com
PAYSTACK_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_9bc24615385085f798e5a9358440e8330e36a868

# OPTIONAL - Get from https://dojah.ai (Free tier: 100 requests/month)
DOJAH_API_KEY=your_dojah_api_key_here

# OPTIONAL - Get from https://identitypass.com
IDENTITYPASS_API_KEY=your_identitypass_api_key_here

# OPTIONAL - Get from Interswitch
INTERSWITCH_CLIENT_ID=your_client_id_here
INTERSWITCH_CLIENT_SECRET=your_client_secret_here
```

### Step 4: Start Development Server

```powershell
npm run dev
```

Then open: **http://localhost:3000**

---

## 🔗 API Configuration

### Paystack (Payment Processing)

**Required for deposits/withdrawals**

1. Go to https://dashboard.paystack.com
2. Navigate to **Settings → API Keys**
3. Copy **Secret Key** (sk_test_...)
4. Add to `.env.local`:
   ```
   PAYSTACK_SECRET_KEY=sk_test_your_key_here
   ```

**Test Cards:**
- Card: 4111 1111 1111 1111
- CVV: Any 3 digits
- Expiry: Any future date

---

### Dojah (NIN Validation - Recommended)

**Free tier: 100 KYC requests per month**

1. Go to https://dojah.ai
2. Sign up for free account
3. Get API Key from dashboard
4. Add to `.env.local`:
   ```
   DOJAH_API_KEY=your_api_key_here
   ```

**Test NINs (if no API configured):**
- 12345678901
- 98765432101
- 55555555555

---

### Identitypass (NIN Validation - Backup)

**Paid option with high accuracy**

1. Go to https://identitypass.com
2. Create account and get API credentials
3. Add to `.env.local`:
   ```
   IDENTITYPASS_API_KEY=your_api_key_here
   ```

---

### Interswitch (NIN Validation - Advanced)

**Requires OAuth2 client credentials**

1. Get Interswitch API credentials
2. Add to `.env.local`:
   ```
   INTERSWITCH_CLIENT_ID=your_client_id
   INTERSWITCH_CLIENT_SECRET=your_client_secret
   ```

**Endpoints Used:**
- Token: `https://qa.interswitchng.com/passport/oauth/token`
- Verify: `https://qa.interswitchng.com/passport/api/v2/kyc/nin/verify`

---

## 📊 Features

### Dashboard
- 💰 Premium balance overview cards
- 📈 Income & expenses trend visualization
- 🎯 Investment portfolio distribution
- 📍 Savings goals progress tracking
- 💳 50/30/20 budget allocation rules

### Budget Management
- 🏷️ Budget category management
- 📊 Real-time budget tracking
- 🎯 Savings milestones
- 📋 Budget vs. actual comparison

### Locked Savings
- 🔒 Time-locked savings accounts
- ⏱️ Automatic unlock date tracking
- 💰 Interest rate calculation
- 📱 Multiple lock period options (hourly, daily, monthly, yearly)

### Investment Portfolio
- 📊 Multiple investment types
- 🏦 T-Bills, Bonds, Mutual Funds
- 📈 Performance tracking
- 💹 Portfolio rebalancing

### Real Payment Processing
- 💳 Paystack payment integration
- 🏦 Bank transfer withdrawals
- ✅ Payment verification
- 📝 Transaction history

### NIN Validation
- 🆔 Real NIMC verification (Dojah, Identitypass, Interswitch)
- 📋 Auto-fill user data
- ✅ KYC compliance
- 🔄 Multi-provider fallback

---

## ⚙️ Available Commands

```bash
npm run dev        # Start development server (port 3000)
npm run build      # Build for production
npm start          # Start production server
npm run lint       # Run linter checks
```

---

## 🚨 Troubleshooting

### "npm command not found"
→ Node.js not installed. Run: `node --version`
→ Install from https://nodejs.org
→ Restart PowerShell after installation

### "Cannot find module '@/components/...'"
→ Dependencies not installed
→ Run: `npm install`

### "Port 3000 already in use"
→ Another process using port 3000
→ Kill the process: `Get-Process -Name node | Stop-Process`
→ Or use different port: `npm run dev -- -p 3001`

### "PAYSTACK_SECRET_KEY is missing"
→ API key not configured in `.env.local`
→ Without it, payment features will fail
→ Get key from https://dashboard.paystack.com

### "NIN validation not working"
→ Check `.env.local` for API keys
→ If no API key, falls back to mock database
→ Test with: 12345678901, 98765432101, 55555555555

---

## 📦 Project Structure

```
c:\Users\hp\.ms-ad\
├── src/
│   ├── app/               # Next.js app directory
│   │   ├── api/           # API routes
│   │   │   ├── payment/   # Paystack integration
│   │   │   └── validate/  # NIN validation
│   │   └── page.tsx       # Main dashboard
│   └── components/        # React components
│       ├── Dashboard.tsx  # Financial dashboard
│       ├── AccountBalance.tsx
│       ├── BudgetSection.tsx
│       ├── LockedSavings.tsx
│       ├── InvestmentPortfolio.tsx
│       └── ...more
├── .env.local            # Environment variables (create this)
├── .env.example          # Example configuration
├── deploy.ps1            # Automated deployment script
└── package.json          # Dependencies
```

---

## 🔐 Security Notes

- **Never commit `.env.local`** - It's gitignored for security
- API keys should only be stored in `.env.local`
- Secret keys should use `process.env` (server-side only)
- Public keys use `NEXT_PUBLIC_` prefix (safe for client)

---

## 📞 Support

- **Paystack Docs**: https://developers.paystack.co
- **Dojah Docs**: https://documentation.dojah.io
- **Next.js Docs**: https://nextjs.org/docs
- **TypeScript Docs**: https://www.typescriptlang.org/docs

---

## ✅ Deployment Checklist

- [ ] Node.js installed (v18+)
- [ ] `npm install` completed
- [ ] `.env.local` configured with API keys
- [ ] `npm run dev` starts without errors
- [ ] App opens at http://localhost:3000
- [ ] Dashboard displays correctly
- [ ] Payment features accessible

---

**Ready to deploy? Run: `.\deploy.ps1`** 🚀
