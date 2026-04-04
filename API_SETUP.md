# Environment Configuration for RILSTACK

## Payment Gateway Setup

To enable real payment processing, you need to set up API keys from a Nigerian payment gateway.

### Option 1: Paystack (Recommended)
1. Create account at https://dashboard.paystack.co
2. Go to Settings → API Keys
3. Copy your Secret Key
4. Add to .env.local:
```
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxxxx
PAYSTACK_SECRET_KEY=sk_test_xxxxx
```

### Option 2: Flutterwave
1. Create account at https://dashboard.flutterwave.co
2. Go to API → API Keys
3. Copy your Secret Key
4. Add to .env.local:
```
NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST_xxxxx
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST_xxxxx
```

### Option 3: Interswitch
1. Create account at https://www.interswitchng.com
2. Request API credentials
3. Add to .env.local:
```
INTERSWITCH_CLIENT_ID=xxxxx
INTERSWITCH_CLIENT_SECRET=xxxxx
```

## NIN Validation (Optional - NIMC API)

To enable real NIN validation:
1. Register with NIMC at https://nimc.gov.ng
2. Request API access credentials
3. Add to .env.local:
```
NIMC_API_KEY=xxxxx
NIMC_API_BASE_URL=https://api.nimc.gov.ng
```

## Current Status

- ✅ Backend API routes created for payment processing
- ✅ Backend API route created for NIN validation
- ⚠️ Using mock data by default (for development)
- 📝 Ready to integrate real APIs (just add env variables)

## How to Integrate Real Payments

1. Update `/src/app/api/payment/deposit/route.ts`:
   - Uncomment the real API call section
   - Update with your chosen gateway's API endpoint
   - Add proper error handling

2. Update `/src/app/api/validate/nin/route.ts`:
   - Uncomment the NIMC API call
   - Add your NIMC API credentials

3. Add environment variables to `.env.local` (see examples above)

4. Test in development mode first

## Testing Demo NINs (Mock Database)

These NINs work in development mode:
- `12345678901` (Chioma Okafor, Lagos)
- `98765432101` (Emeka Eze, Enugu)  
- `55555555555` (Aisha Mohammed, Kano)

## Deposit Methods Supported

1. **Card Payment**: Via Paystack, Flutterwave, or Interswitch
2. **Bank Transfer**: Direct to account (with generated details)
3. **USSD**: Mobile banking via USSD codes

## Security Notes

- Never commit `.env.local` to version control
- Always use Secret Keys server-side only
- Public Keys are safe to include in client code (prefixed with NEXT_PUBLIC_)
- Validate all inputs on server-side
- Use HTTPS in production
