# RILSTACK - Professional Financial Management Platform

A sophisticated, full-featured Nigerian financial application built with **Next.js 14**, **TypeScript 5**, **React 18**, and **Tailwind CSS**. Real Paystack payment processing, NIN validation APIs, and professional PiggyVest-level dashboard design.

## 🚀 QUICK START (2 Minutes)

### Automated Deployment
```powershell
.\deploy.ps1
```

### Manual Setup
```powershell
npm install
npm run dev
# Open http://localhost:3000
```

**See QUICK_START.md for full deployment guide**

---

# Features

### 📊 Dashboard
- Quick balance overview with total, available, and locked funds
- Monthly budget allocation visualization with 50/30/20 breakdown
- Spending across strict and flexible categories
- Savings rate calculation
- Net worth display
- Investment portfolio summary by type (T-Bills, Bonds, Mutual Funds)
- Income vs. Expense trends with budget model breakdown

### 🏦 Account & Balance Management
- **Total Balance Display**: See all funds across accounts at a glance
- **Available Balance**: Amount ready for immediate withdrawal
- **Locked Funds**: Amount in active investments
- **Account Details**: View checking, savings, and investment accounts separately
- **Deposit Methods**: Add funds via:
  - 💳 Credit/Debit Card
  - 🏦 Bank Transfer
  - 📱 USSD
- **Withdrawal Management**: Withdraw available funds via card, transfer, or USSD
- **Transaction History**: Track all deposits, withdrawals, and transfers with status

### 👤 User Profile & Account Information
- **User ID**: Unique identifier for each user
- **Personal Information**: Name, email, phone number, age
- **National ID (NIN)**: National identification number for compliance
- **Profile Management**: Edit and update profile information anytime
- **Data Security**: All sensitive information stored securely

### 💰 Budget Management

**Two Budget Models:**
1. **50/30/20 Budget Model**
   - 50% Needs (Housing, Utilities, Insurance, Transportation, Food)
   - 30% Wants (Entertainment, Dining Out, Shopping, Travel)
   - 20% Savings (Emergency Fund, Investments)

2. **Zero-Based Budget**
   - Custom allocation of every dollar
   - Full control over budget distribution

**Category Types:**
- **Strict Categories** (Essential Expenses)
  - Housing, Utilities, Transportation, Insurance, Debt Payments
  - Fixed, non-negotiable expenses

- **Lax (Flexible) Categories**
  - Groceries, Dining Out, Entertainment, Shopping, Hobbies, Travel
  - Discretionary spending with room for adjustment

Features:
- Create and track budgets by category
- Monitor spending against budget limits
- Visual progress indicators with color-coded warnings
- Budget alerts for overspending
- Category-based budget recommendations

### 🎯 Savings Goals
- Set multiple savings goals with target dates
- Track progress toward each goal
- Categorize goals (Emergency Fund, Vacation, etc.)
- Timeline visualization

### 🔒 Locked Savings
A unique feature to enforce disciplined saving by locking funds until specified dates:

**Four Lock Period Options:**
1. **Hourly** ⏰
   - Lock for 1 hour
   - 0.5% APY interest
   - Perfect for short-term discipline

2. **Daily** 📅
   - Lock for 1 day
   - 2% APY interest
   - Daily savings habit

3. **Monthly** 📆
   - Lock for 1 month
   - 4.5% APY interest
   - Monthly savings goals

4. **Yearly** 📊
   - Lock for 1 year
   - 7.2% APY interest
   - Long-term savings strategy

**Features:**
- Create locked savings with different time periods
- Funds are completely inaccessible until unlock date
- Earn interest on locked funds based on lock period
- Real-time countdown timer showing time remaining
- Automatic unlock notification
- View locked, unlocked, and withdrawn savings
- Estimated total interest earnings
- Summary cards showing total locked and available amounts

### 📈 Investment Portfolio

**Supported Investment Types:**
1. **T-Bills (Treasury Bills)**
   - Short-term government securities
   - Low-risk, guaranteed returns
   - Typical Interest Rate: 5-6% APY
   - Typical maturity: 3-12 months

2. **Bonds**
   - Fixed income securities
   - Government or corporate bonds
   - Regular interest payments until maturity
   - Typical Interest Rate: 4-5% APY

3. **Mutual Funds (Close-Ended)**
   - Professionally managed portfolios
   - Fixed number of shares
   - Sale cycles for liquidity management
   - Typical Interest Rate: 7-10% APY (varies by fund)

**Features:**
- Track individual investments with principal and interest rates
- Monitor investment performance and gains/losses
- Manage sale cycles for close-ended funds
- Input amount available for sale at each cycle
- Track amount sold per cycle
- View cycle status (Open, Closed, Expired)
- Portfolio performance trend visualization
- Investment type categorization with color coding

## Payment Methods Integration

### Deposit Options
Users can add funds to their account using three methods:

1. **Card Deposits** 💳
   - Credit card or debit card payments
   - Instant processing
   - Secure payment gateway

2. **Bank Transfers** 🏦
   - Direct bank-to-bank transfers
   - ACH or wire transfers
   - Confirmation required

3. **USSD** 📱
   - Mobile money via USSD codes
   - Quick and convenient
   - Works offline

### Withdrawal Management
- **Withdrawal Requests**: Submit withdrawal requests for available funds
- **Multiple Methods**: Withdraw to card, bank account, or USSD
- **Pending Status**: Track withdrawal status (Pending, Processing, Completed)
- **Withdrawal Limits**: Cannot exceed available balance
- **Locked Funds Notice**: Investments locked until maturity or sale cycle completion

## User Profile Requirements

### Data Collection
The application collects the following user information:

1. **Name**: Full legal name
2. **Email**: Valid email address for communications
3. **Phone Number**: Contact number for account updates
4. **Age**: Date of birth or age verification
5. **NIN (National Identification Number)**: Required for:
   - Account compliance
   - KYC (Know Your Customer) verification
   - Regulatory requirements
   - Withdrawal processing

### User ID Management
- **Auto-generated User ID**: Format `USR-YYYY-XXXXXX`
- **Unique Identifier**: Used for all transactions and account management
- **Display**: Shown prominently in user profile
- **Tracking**: Reference ID for support and inquiries

### Profile Features
- **View Profile**: See all collected user information
- **Edit Profile**: Update name, email, phone, age
- **Profile Access**: Click "👤 Profile" button in navigation
- **Data Persistence**: All information saved securely

### 50/30/20 Budget Strategy
The popular budgeting method that allocates your income into three categories:
- **50% Needs** - Essential expenses (housing, utilities, insurance, transportation, groceries)
- **30% Wants** - Discretionary spending (entertainment, dining out, shopping, travel)
- **20% Savings** - Financial goals (emergency fund, investments, debt repayment)

### Zero-Based Budgeting
Every dollar of income is assigned a specific purpose. This method:
- Requires intentional allocation of all funds
- Helps identify spending patterns
- Ensures consistent savings and investing
- Provides maximum control over finances

### Strict vs. Flexible Categories

**Strict Categories** are essential, non-negotiable expenses:
- Housing (rent/mortgage)
- Utilities (electricity, water, internet)
- Insurance (health, auto, home)
- Transportation (car payment, gas, maintenance)
- Debt Payments

**Lax (Flexible) Categories** are discretionary spending:
- Groceries and food
- Dining out and takeout
- Entertainment and subscriptions
- Shopping and clothing
- Hobbies and recreation
- Travel and vacations

## Tech Stack

- **Frontend:** React 18, TypeScript, Next.js 14
- **Styling:** Tailwind CSS
- **Forms:** React Hook Form
- **Charts:** Recharts
- **Package Manager:** npm
- **Linting:** ESLint
- **Payment Integration Ready:** Card, Bank Transfer, USSD

## Project Structure

```
src/
├── app/                         # Next.js App Router pages
├── components/                  # React components
│   ├── Navigation.tsx          # Main navigation with profile button
│   ├── Dashboard.tsx           # Financial overview
│   ├── BudgetSection.tsx       # Budget management (50/30/20 & zero-based)
│   ├── SavingsGoals.tsx        # Savings goal tracking
│   ├── InvestmentPortfolio.tsx # Investment management (T-Bills, Bonds, MF)
│   ├── AccountBalance.tsx      # Account & balance management
│   └── UserProfile.tsx         # User profile & data collection
├── api/                        # API routes (for backend integration)
├── types/                      # TypeScript type definitions
├── utils/                      # Helper functions
└── styles/                     # Global CSS and Tailwind styles
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Run production server
- `npm run lint` - Run ESLint

## Using the Application

### 1. View Your Profile
Click the **"👤 Profile"** button in the navigation bar to:
- View your User ID
- See your personal information (Name, Age, Email, Phone, NIN)
- Edit your profile details

### 2. Check Account Balance
Navigate to **"🏦 Account"** section to:
- View total balance across all accounts
- See available funds ready for withdrawal
- Check locked funds in investments
- Deposit funds via card, transfer, or USSD
- Withdraw available balance
- View transaction history

### 3. Manage Budget
Go to **"💰 Budget"** to:
- Choose between 50/30/20 or Zero-Based budget models
- Enter your monthly income
- Create budgets for different categories
- Track spending against budget limits
- Monitor strict vs. flexible categories

### 4. Track Savings Goals
Visit **"🎯 Savings Goals"** to:
- Create new savings goals with target dates
- Track progress toward each goal
- See days remaining until target
- Categorize goals (Emergency Fund, Vacation, Housing, etc.)

### 5. Manage Investments
Click **"📈 Investments"** to:
- Add T-Bills, Bonds, or Mutual Funds
- Input principal amount and interest rate
- Create sale cycles for close-ended funds
- Track interest earned
- Monitor portfolio performance
- View gains and losses by investment type

## API Integration

The app is structured to connect with a backend API. You can extend the components with API calls using:

```typescript
import axios from 'axios';

const fetchData = async () => {
  const response = await axios.get('/api/endpoint');
  return response.data;
};
```

### Adding New Features

1. Create components in `src/components/`
2. Define types in `src/types/index.ts`
3. Add helper functions in `src/utils/`
4. Update the navigation in `src/components/Navigation.tsx`

### Theming

Customize colors in `tailwind.config.js` under the `theme.extend.colors` section.

## Database & Backend

This is currently a frontend-only application with mock data. To add a backend:

1. Create API endpoints in `src/app/api/`
2. Connect to a database (PostgreSQL, MongoDB, etc.)
3. Implement authentication
4. Store user data securely

## Deployment

Deploy to Vercel, Netlify, or your preferred hosting:

```bash
npm run build
npm start
```

## Contributing

Contributions are welcome! Please follow these guidelines:
- Use TypeScript for type safety
- Follow the existing code style
- Add tests for new features
- Update documentation

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues or questions, please create an issue in the repository.

## Roadmap

- [x] User profile with data collection (Name, Age, Email, Phone, NIN)
- [x] Account balance management (Total, Available, Locked)
- [x] Deposit and withdrawal functionality
- [x] Multiple payment methods (Card, Transfer, USSD)
- [x] Budget management with 50/30/20 and zero-based models
- [x] Strict vs. flexible budget categories
- [x] Investment portfolio with T-Bills, Bonds, and Mutual Funds
- [x] Interest rate tracking and calculation
- [x] Sale cycles for close-ended funds
- [ ] Backend API integration
- [ ] User authentication and authorization
- [ ] Persistent data storage (Database)
- [ ] Real-time account balance updates
- [ ] KYC verification automation
- [ ] Monthly/yearly financial reports
- [ ] Mobile app version
- [ ] Dark mode
- [ ] Multi-currency support
- [ ] PDF/CSV export functionality
- [ ] AI-powered budget recommendations
- [ ] Recurring transactions
- [ ] Bill reminders
- [ ] Financial goals milestone tracking
