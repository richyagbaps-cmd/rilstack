# 🚀 RILSTACK - DEPLOYMENT QUICK START

## ONE COMMAND DEPLOYMENT

Open **PowerShell as Administrator** in the project folder and run:

```powershell
.\deploy.ps1
```

This will:

1. ✅ Install Node.js (if needed)
2. ✅ Install dependencies (`npm install`)
3. ✅ Build the project (`npm run build`)
4. ✅ Start the dev server (`npm run dev`)

---

## OR MANUAL MODE (3 COMMANDS)

```powershell
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Open your browser
# App will be at: http://localhost:3000
```

---

## REQUIRED CONFIGURATION

### Get Your Paystack API Keys (5 minutes)

1. Go to **https://dashboard.paystack.com**
2. Sign in to your account
3. Click **Settings → API Keys**
4. Copy your **Secret Key** (starts with `sk_test_`)
5. Open `.env.local` and add:

```env
PAYSTACK_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_9bc24615385085f798e5a9358440e8330e36a868
```

---

## TEST THE APP

Once running, test with these **mock NINs** (until you configure a real API):

| NIN         | Name           | Gender | State |
| ----------- | -------------- | ------ | ----- |
| 12345678901 | Chioma Okafor  | F      | Lagos |
| 98765432101 | Emeka Eze      | M      | Enugu |
| 55555555555 | Aisha Mohammed | F      | Kano  |

---

## FEATURES READY

✅ **Dashboard** - Beautiful financial overview  
✅ **Budget Management** - Track spending  
✅ **Locked Savings** - Time-locked accounts  
✅ **Investment Portfolio** - Real portfolio tracking  
✅ **Real Paystack Integration** - Deposits/withdrawals  
✅ **NIN Validation** - (Dojah/Identitypass/Interswitch)  
✅ **AI Assistant** - 24/7 financial guidance

---

## TROUBLESHOOTING

| Problem                         | Solution                                        |
| ------------------------------- | ----------------------------------------------- |
| `npm` command not found         | Install Node.js from https://nodejs.org         |
| Port 3000 in use                | Run on different port: `npm run dev -- -p 3001` |
| Import errors after npm install | Clear cache: `rm -r .next` then restart         |
| Payment features not working    | Add `PAYSTACK_SECRET_KEY` to `.env.local`       |
| NIN validation fails            | Use test NINs above or configure API key        |

---

## ENVIRONMENT VARIABLES EXAMPLE

```env
# REQUIRED
PAYSTACK_SECRET_KEY=sk_test_your_key_here
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your_public_key_here

# OPTIONAL (NIN Validation)
DOJAH_API_KEY=your_dojah_api_key_here
IDENTITYPASS_API_KEY=your_identitypass_api_key_here
INTERSWITCH_CLIENT_ID=your_client_id_here
INTERSWITCH_CLIENT_SECRET=your_client_secret_here
```

---

## FULL DOCUMENTATION

📖 See **DEPLOYMENT_GUIDE.md** for complete setup instructions

---

## 🎉 YOU'RE READY!

Your RILSTACK app is 100% ready to deploy. Just follow the commands above!

Questions? Check the DEPLOYMENT_GUIDE.md file.
