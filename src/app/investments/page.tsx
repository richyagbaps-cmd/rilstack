"use client";
import React, { useState, useEffect } from 'react';
import InvestmentPortfolio from '../../components/InvestmentPortfolio';

type TBill = {
  id: string;
  name: string;
  tenor: number;
  expectedYield: string;
  minUnit: string;
  auctionClose: string;
  issueDate: string;
  maturityDate: string;
  discountRate: string;
  interestCalc: string;
};

type PrimaryBond = {
  id: string;
  name: string;
  coupon: string;
  offerAmount: string;
  auctionClose: string;
  issueDate: string;
  maturityDate: string;
  interestPayment: string;
};

type SecondaryBond = {
  id: string;
  name: string;
  isin: string;
  coupon: string;
  maturity: string;
  bid: string;
  ask: string;
  ytm: string;
  accruedInterest: string;
  settlement: string;
};

type MutualFund = {
  id: string;
  name: string;
  manager: string;
  oneYearReturn: string;
  risk: string;
  expenseRatio: string;
  minSubscription: string;
  factSheetUrl: string;
  portfolio: string;
  navHistory: number[];
};

const TBILLS = [
  {
    id: 'tbill-91',
    name: '91-day T-bill',
    tenor: 91,
    expectedYield: '7.5%',
    minUnit: '₦50,000',
    auctionClose: 'Apr 18, 2026',
    issueDate: 'Apr 21, 2026',
    maturityDate: 'Jul 21, 2026',
    discountRate: '7.2%',
    interestCalc: 'Interest is the difference between your bid price and the par value (₦100). Paid upfront.',
  },
  {
    id: 'tbill-182',
    name: '182-day T-bill',
    tenor: 182,
    expectedYield: '8.1%',
    minUnit: '₦50,000',
    auctionClose: 'Apr 18, 2026',
    issueDate: 'Apr 21, 2026',
    maturityDate: 'Oct 20, 2026',
    discountRate: '7.8%',
    interestCalc: 'Interest is the difference between your bid price and the par value (₦100). Paid upfront.',
  },
  {
    id: 'tbill-364',
    name: '364-day T-bill',
    tenor: 364,
    expectedYield: '9.3%',
    minUnit: '₦50,000',
    auctionClose: 'Apr 18, 2026',
    issueDate: 'Apr 21, 2026',
    maturityDate: 'Apr 20, 2027',
    discountRate: '8.9%',
    interestCalc: 'Interest is the difference between your bid price and the par value (₦100). Paid upfront.',
  },
];

const PRIMARY_BONDS = [
  {
    id: 'bond-2029',
    name: 'FGN 2029 Bond',
    coupon: '13.5%',
    offerAmount: '₦50,000,000,000',
    auctionClose: 'Apr 25, 2026',
    issueDate: 'Apr 28, 2026',
    maturityDate: 'Mar 20, 2029',
    interestPayment: 'Semi-annual',
  },
];

const SECONDARY_BONDS: SecondaryBond[] = [
  {
    id: 'sec-bond-2029',
    name: 'FGN 2029 Bond',
    isin: 'NGFGN2029',
    coupon: '13.5%',
    maturity: 'Mar 2029',
    bid: '₦102.10',
    ask: '₦102.45',
    ytm: '12.8%',
    accruedInterest: '₦1,200',
    settlement: 'T+2',
  },
  {
    id: 'sec-bond-2035',
    name: 'FGN 2035 Bond',
    isin: 'NGFGN2035',
    coupon: '14.2%',
    maturity: 'Jan 2035',
    bid: '₦97.80',
    ask: '₦98.10',
    ytm: '13.7%',
    accruedInterest: '₦2,050',
    settlement: 'T+1',
  },
];

const MUTUAL_FUNDS: MutualFund[] = [
  {
    id: 'mf-stanbic',
    name: 'Stanbic IBTC Balanced Fund',
    manager: 'Stanbic IBTC Asset Management',
    oneYearReturn: '13.2%',
    risk: 'Moderate',
    expenseRatio: '1.5%',
    minSubscription: '₦10,000',
    factSheetUrl: '#',
    portfolio: '50% Equities, 30% Bonds, 20% Money Market',
    navHistory: [2340, 2350, 2360, 2375, 2380, 2390, 2340],
  },
  {
    id: 'mf-arm',
    name: 'ARM Aggressive Growth Fund',
    manager: 'ARM Investment Managers',
    oneYearReturn: '18.7%',
    risk: 'High',
    expenseRatio: '2.1%',
    minSubscription: '₦20,000',
    factSheetUrl: '#',
    portfolio: '70% Equities, 20% Bonds, 10% Money Market',
    navHistory: [1980, 2000, 2020, 2050, 2070, 2080, 1980],
  },
];

// Dummy user balance and settlement accounts for validation
const USER_BALANCE = 200000; // ₦200,000
const SETTLEMENT_ACCOUNTS = [
  { id: 'wallet', label: 'Wallet (₦200,000)' },
  { id: 'bank', label: 'Bank Account' },
];

// Dummy trading hours: 9am-2pm
function isMarketOpen() {
  const now = new Date();
  const hour = now.getHours();
  return hour >= 9 && hour < 14;
}

function TBillDetailModal({ tbill, onClose }: { tbill: TBill; onClose: () => void }) {
  if (!tbill) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative">
        <button className="absolute top-3 right-3 text-slate-400 hover:text-slate-700" onClick={onClose}>✕</button>
        <h3 className="text-xl font-bold mb-2">{tbill.name} Details</h3>
        <ul className="space-y-2 text-sm">
          <li><span className="font-semibold">Tenor:</span> {tbill.tenor} days</li>
          <li><span className="font-semibold">Expected Yield:</span> {tbill.expectedYield}</li>
          <li><span className="font-semibold">Minimum Unit:</span> {tbill.minUnit}</li>
          <li><span className="font-semibold">Auction Closing Date:</span> {tbill.auctionClose}</li>
          <li><span className="font-semibold">Issue Date:</span> {tbill.issueDate}</li>
          <li><span className="font-semibold">Maturity Date:</span> {tbill.maturityDate}</li>
          <li><span className="font-semibold">Discount Rate:</span> {tbill.discountRate}</li>
          <li><span className="font-semibold">Interest Calculation:</span> {tbill.interestCalc}</li>
        </ul>
      </div>
    </div>
  );
}

function BondAuctionDetailModal({ bond, onClose }: { bond: PrimaryBond; onClose: () => void }) {
  if (!bond) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative">
        <button className="absolute top-3 right-3 text-slate-400 hover:text-slate-700" onClick={onClose}>✕</button>
        <h3 className="text-xl font-bold mb-2">{bond.name} Auction Details</h3>
        <ul className="space-y-2 text-sm">
          <li><span className="font-semibold">Coupon Rate:</span> {bond.coupon}</li>
          <li><span className="font-semibold">Offer Amount:</span> {bond.offerAmount}</li>
          <li><span className="font-semibold">Auction Closing Date:</span> {bond.auctionClose}</li>
          <li><span className="font-semibold">Issue Date:</span> {bond.issueDate}</li>
          <li><span className="font-semibold">Maturity Date:</span> {bond.maturityDate}</li>
          <li><span className="font-semibold">Interest Payment:</span> {bond.interestPayment}</li>
        </ul>
      </div>
    </div>
  );
}

function MutualFundDetailModal({ fund, onClose }: { fund: MutualFund; onClose: () => void }) {
  if (!fund) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative">
        <button className="absolute top-3 right-3 text-slate-400 hover:text-slate-700" onClick={onClose}>✕</button>
        <h3 className="text-xl font-bold mb-2">{fund.name} Details</h3>
        <ul className="space-y-2 text-sm mb-4">
          <li><span className="font-semibold">Manager:</span> {fund.manager}</li>
          <li><span className="font-semibold">1-Year Return:</span> {fund.oneYearReturn}</li>
          <li><span className="font-semibold">Risk Level:</span> {fund.risk}</li>
          <li><span className="font-semibold">Expense Ratio:</span> {fund.expenseRatio}</li>
          <li><span className="font-semibold">Min Subscription:</span> {fund.minSubscription}</li>
          <li><span className="font-semibold">Portfolio:</span> {fund.portfolio}</li>
          <li><span className="font-semibold">Fact Sheet:</span> <a href={fund.factSheetUrl} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">Download</a></li>
        </ul>
        <div className="mb-2 font-semibold text-sm">Historical NAV (chart placeholder):</div>
        <div className="w-full h-24 bg-slate-100 rounded flex items-end gap-1 p-2">
          {fund.navHistory.map((nav, i) => (
            <div key={i} style={{height: `${10 + (nav - Math.min(...fund.navHistory))}px`}} className="flex-1 bg-emerald-400 rounded-t" />
          ))}
        </div>
      </div>
    </div>
  );
}

function SubscribeAuctionModal({ product, unit, deadline, onClose, onSubmit }: { product: { name: string }, unit: number, deadline: string, onClose: () => void, onSubmit?: (amount: number, bidYield: string, idempotencyKey?: string) => void }) {
  const [amount, setAmount] = useState(unit);
  const [bidYield, setBidYield] = useState('');
  const [account, setAccount] = useState(SETTLEMENT_ACCOUNTS[0].id);
  const [error, setError] = useState('');
  const deadlinePassed = new Date(deadline) < new Date();
  const idempotencyKey = `${product.name}-${deadline}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (deadlinePassed) {
      setError('Auction deadline has passed.');
      return;
    }
    if (amount % unit !== 0) {
      setError(`Amount must be a multiple of ₦${unit.toLocaleString()}`);
      return;
    }
    if (amount > USER_BALANCE) {
      setError('Insufficient balance.');
      return;
    }
    if (onSubmit) {
      onSubmit(amount, bidYield, idempotencyKey);
    } else {
      onClose();
      alert('Subscription submitted!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative">
        <button className="absolute top-3 right-3 text-slate-400 hover:text-slate-700" onClick={onClose}>✕</button>
        <h3 className="text-xl font-bold mb-4">Subscribe to {product.name}</h3>
        {deadlinePassed && <div className="mb-2 text-red-600 font-semibold">Auction deadline has passed. Next auction: [show next date]</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Amount (₦)</label>
            <input
              type="number"
              min={unit}
              step={unit}
              value={amount}
              onChange={e => setAmount(Number(e.target.value))}
              className="w-full rounded border border-slate-200 px-3 py-2"
              required
              disabled={deadlinePassed}
            />
            <div className="text-xs text-slate-500 mt-1">Must be a multiple of ₦{unit.toLocaleString()}</div>
            {amount > USER_BALANCE && <div className="text-xs text-red-600 mt-1">Insufficient funds. <button type="button" className="underline text-blue-600">Add money</button></div>}
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Bid Yield (%) <span className="text-slate-400">(optional)</span></label>
            <input
              type="number"
              step="0.01"
              value={bidYield}
              onChange={e => setBidYield(e.target.value)}
              className="w-full rounded border border-slate-200 px-3 py-2"
              placeholder="Non-competitive bid"
              disabled={deadlinePassed}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Settlement Account</label>
            <select
              value={account}
              onChange={e => setAccount(e.target.value)}
              className="w-full rounded border border-slate-200 px-3 py-2"
              disabled={deadlinePassed}
            >
              {SETTLEMENT_ACCOUNTS.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.label}</option>
              ))}
            </select>
          </div>
          {error && <div className="text-red-600 text-sm font-semibold">{error}</div>}
          <button
            type="submit"
            className="w-full rounded bg-[#2c3e5f] py-2 font-semibold text-white mt-2 disabled:opacity-50"
            disabled={deadlinePassed}
          >
            Subscribe
          </button>
        </form>
      </div>
    </div>
  );
}

function BuySecondaryBondModal({ bond, onClose }: { bond: SecondaryBond; onClose: () => void }) {
  const [quantity, setQuantity] = useState(10000);
  const [priceType, setPriceType] = useState<'market' | 'limit'>('market');
  const [limitPrice, setLimitPrice] = useState(bond.ask.replace(/[^\d.]/g, ''));
  const [error, setError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [latestAsk, setLatestAsk] = useState(bond.ask);
  const marketOpen = isMarketOpen();
  const nominal = Number(quantity);
  const price = priceType === 'market' ? Number(latestAsk.replace(/[^\d.]/g, '')) : Number(limitPrice);
  const accrued = Number(bond.accruedInterest.replace(/[^\d.]/g, ''));
  const fees = Math.round(nominal * 0.002); // 0.2% fee
  const total = nominal * price / 100 + accrued + fees;

  // Simulate real-time price updates every 3s
  useEffect(() => {
    if (priceType === 'market') {
      const interval = setInterval(() => {
        // Simulate price change ±0.05
        setLatestAsk((prev) => {
          const base = Number(prev.replace(/[^\d.]/g, ''));
          const delta = (Math.random() - 0.5) * 0.1;
          const newPrice = Math.max(90, Math.min(110, base + delta));
          return `₦${newPrice.toFixed(2)}`;
        });
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [priceType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!marketOpen && !showConfirm) {
      setError('Market is closed. You can place as "Good for Next Open".');
      return;
    }
    if (nominal < 10000) {
      setError('Minimum quantity is ₦10,000 nominal.');
      return;
    }
    if (price <= 0) {
      setError('Invalid price.');
      return;
    }
    setShowReview(true);
  };
  const handleReviewConfirm = () => {
    setShowReview(false);
    setShowConfirm(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative">
        <button className="absolute top-3 right-3 text-slate-400 hover:text-slate-700" onClick={onClose}>✕</button>
        <h3 className="text-xl font-bold mb-4">Buy {bond.name}</h3>
        {!marketOpen && (
          <div className="mb-2 text-yellow-700 font-semibold">Market is closed. You can place this order as "Good for Next Open".
            <label className="ml-2 text-xs"><input type="checkbox" checked={showConfirm} onChange={e=>setShowConfirm(e.target.checked)} /> Good for Next Open</label>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Quantity (Nominal ₦)</label>
            <input
              type="number"
              min={10000}
              step={1000}
              value={quantity}
              onChange={e => setQuantity(Number(e.target.value))}
              className="w-full rounded border border-slate-200 px-3 py-2"
              required
            />
            <div className="text-xs text-slate-500 mt-1">Minimum ₦10,000 nominal</div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Price Type</label>
            <div className="flex gap-4 mt-1">
              <label className="flex items-center gap-1">
                <input type="radio" checked={priceType === 'market'} onChange={() => setPriceType('market')} />
                <span className="text-xs">Market ({latestAsk})</span>
              </label>
              <label className="flex items-center gap-1">
                <input type="radio" checked={priceType === 'limit'} onChange={() => setPriceType('limit')} />
                <span className="text-xs">Limit</span>
              </label>
            </div>
            {priceType === 'limit' && (
              <input
                type="number"
                min={1}
                step={0.01}
                value={limitPrice}
                onChange={e => setLimitPrice(e.target.value)}
                className="w-full rounded border border-slate-200 px-3 py-2 mt-2"
                placeholder="Limit price"
                required
              />
            )}
          </div>
          <div className="text-sm text-slate-700 bg-slate-50 rounded p-3">
            <div>Principal: ₦{(nominal * price / 100).toLocaleString(undefined, {maximumFractionDigits:2})}</div>
            <div>Accrued Interest: ₦{accrued.toLocaleString()}</div>
            <div>Fees: ₦{fees.toLocaleString()}</div>
            <div className="font-bold mt-1">Total Cost: ₦{total.toLocaleString(undefined, {maximumFractionDigits:2})}</div>
          </div>
          {error && <div className="text-red-600 text-sm font-semibold">{error}</div>}
          <button
            type="submit"
            className="w-full rounded bg-[#2c3e5f] py-2 font-semibold text-white mt-2"
            disabled={!marketOpen}
          >
            Place Buy Order
          </button>
        </form>
        {showReview && (
          <SecondaryBondReviewModal
            bond={bond}
            quantity={nominal}
            price={price}
            accrued={accrued}
            fees={fees}
            total={total}
            settlement={bond.settlement}
            onClose={() => setShowReview(false)}
            onConfirm={handleReviewConfirm}
          />
        )}
        {showConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-xs relative z-10">
              <h4 className="text-lg font-bold mb-2">Order Placed</h4>
              <div className="text-sm mb-2">Buy order submitted to backend!</div>
              <div className="flex gap-2 mt-4">
                <button className="flex-1 rounded bg-[#2c3e5f] py-2 font-semibold text-white" onClick={onClose}>Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Review & Confirmation Modal (generic for all products) ---
function RiskCheckbox({ checked, onChange }: { checked: boolean, onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 mt-4 mb-2">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span className="text-xs text-slate-700">I acknowledge the risks associated with this investment.</span>
    </label>
  );
}

// T-bill Auction Review
function TBillReviewModal({ tbill, amount, bidYield, onConfirm, onClose }: { tbill: TBill, amount: number, bidYield: string, onConfirm: () => void, onClose: () => void }) {
  const [risk, setRisk] = useState(false);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative">
        <button className="absolute top-3 right-3 text-slate-400 hover:text-slate-700" onClick={onClose}>✕</button>
        <h3 className="text-xl font-bold mb-4">Review Subscription</h3>
        <ul className="text-sm mb-3 space-y-1">
          <li><b>Product:</b> {tbill.name}</li>
          <li><b>Amount:</b> ₦{amount.toLocaleString()}</li>
          <li><b>Bid Type:</b> {bidYield ? `Competitive (${bidYield}%)` : 'Non-competitive'}</li>
          <li><b>Auction Date:</b> {tbill.auctionClose}</li>
          <li><b>Est. Discount/Yield:</b> {tbill.discountRate}</li>
        </ul>
        <RiskCheckbox checked={risk} onChange={setRisk} />
        <button className="w-full rounded bg-[#2c3e5f] py-2 font-semibold text-white mt-2 disabled:opacity-50" disabled={!risk} onClick={onConfirm}>Confirm & Submit</button>
      </div>
    </div>
  );
}

// Primary Bond Review
function BondReviewModal({ bond, amount, onConfirm, onClose }: { bond: PrimaryBond, amount: number, onConfirm: () => void, onClose: () => void }) {
  const [risk, setRisk] = useState(false);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative">
        <button className="absolute top-3 right-3 text-slate-400 hover:text-slate-700" onClick={onClose}>✕</button>
        <h3 className="text-xl font-bold mb-4">Review Subscription</h3>
        <ul className="text-sm mb-3 space-y-1">
          <li><b>Product:</b> {bond.name}</li>
          <li><b>Amount:</b> ₦{amount.toLocaleString()}</li>
          <li><b>Coupon Rate:</b> {bond.coupon}</li>
          <li><b>Issue Date:</b> {bond.issueDate}</li>
          <li><b>Interest Payment:</b> {bond.interestPayment}</li>
        </ul>
        <RiskCheckbox checked={risk} onChange={setRisk} />
        <button className="w-full rounded bg-[#2c3e5f] py-2 font-semibold text-white mt-2 disabled:opacity-50" disabled={!risk} onClick={onConfirm}>Confirm & Submit</button>
      </div>
    </div>
  );
}

// Secondary Bond Review
function SecondaryBondReviewModal({ bond, quantity, price, accrued, fees, total, settlement, onConfirm, onClose }: { bond: SecondaryBond, quantity: number, price: number, accrued: number, fees: number, total: number, settlement: string, onConfirm: () => void, onClose: () => void }) {
  const [risk, setRisk] = useState(false);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative">
        <button className="absolute top-3 right-3 text-slate-400 hover:text-slate-700" onClick={onClose}>✕</button>
        <h3 className="text-xl font-bold mb-4">Review Buy Order</h3>
        <ul className="text-sm mb-3 space-y-1">
          <li><b>Product:</b> {bond.name}</li>
          <li><b>Clean Price:</b> ₦{price.toLocaleString(undefined, {maximumFractionDigits:2})}</li>
          <li><b>Quantity:</b> ₦{quantity.toLocaleString()}</li>
          <li><b>Accrued Interest:</b> ₦{accrued.toLocaleString()}</li>
          <li><b>Fees:</b> ₦{fees.toLocaleString()}</li>
          <li><b>Total Debit:</b> ₦{total.toLocaleString(undefined, {maximumFractionDigits:2})}</li>
          <li><b>Settlement Date:</b> {settlement}</li>
        </ul>
        <RiskCheckbox checked={risk} onChange={setRisk} />
        <button className="w-full rounded bg-[#2c3e5f] py-2 font-semibold text-white mt-2 disabled:opacity-50" disabled={!risk} onClick={onConfirm}>Confirm & Submit</button>
      </div>
    </div>
  );
}

// Mutual Fund Review
function MutualFundReviewModal({ fund, amount, units, navDateStr, redemption, onConfirm, onClose }: { fund: MutualFund, amount: number, units: number, navDateStr: string, redemption: string, onConfirm: () => void, onClose: () => void }) {
  const [risk, setRisk] = useState(false);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative">
        <button className="absolute top-3 right-3 text-slate-400 hover:text-slate-700" onClick={onClose}>✕</button>
        <h3 className="text-xl font-bold mb-4">Review Investment</h3>
        <ul className="text-sm mb-3 space-y-1">
          <li><b>Product:</b> {fund.name}</li>
          <li><b>Amount:</b> ₦{amount.toLocaleString()}</li>
          <li><b>Est. Units:</b> {units.toLocaleString(undefined, {maximumFractionDigits:2})}</li>
          <li><b>NAV Date:</b> {navDateStr}</li>
          <li><b>Redemption Policy:</b> {redemption}</li>
        </ul>
        <RiskCheckbox checked={risk} onChange={setRisk} />
        <button className="w-full rounded bg-[#2c3e5f] py-2 font-semibold text-white mt-2 disabled:opacity-50" disabled={!risk} onClick={onConfirm}>Confirm & Submit</button>
      </div>
    </div>
  );
}

const TBillBondAuctions = ({ addPending }: { addPending: (order: any) => void }) => {
  const [selectedTBill, setSelectedTBill] = useState<TBill | null>(null);
  const [showSubscribe, setShowSubscribe] = useState<{tbill: TBill, unit: number, deadline: string} | null>(null);
  const [review, setReview] = useState<{tbill: TBill, amount: number, bidYield: string} | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Upcoming T‑bill Auctions</h2>
      <ul className="divide-y divide-slate-200">
        {TBILLS.map((tbill) => (
          <li key={tbill.id} className="py-3 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold">{tbill.name}</span>
              <div className="flex gap-2">
                <button className="text-xs text-[#2c3e5f] underline font-semibold" onClick={() => setSelectedTBill(tbill)}>Details</button>
                <button className="text-xs text-emerald-700 underline font-semibold" onClick={() => setShowSubscribe({tbill, unit: 1000, deadline: tbill.auctionClose})}>Subscribe</button>
              </div>
            </div>
            <span className="text-xs text-slate-500">Tenor: {tbill.tenor} days</span>
            <span className="text-xs text-slate-500">Expected Yield: {tbill.expectedYield}</span>
            <span className="text-xs text-slate-500">Min Unit: {tbill.minUnit}</span>
            <span className="text-xs text-slate-500">Auction Closes: {tbill.auctionClose}</span>
          </li>
        ))}
      </ul>
      {selectedTBill && <TBillDetailModal tbill={selectedTBill} onClose={() => setSelectedTBill(null)} />}
      {showSubscribe && (
        <SubscribeAuctionModal
          product={showSubscribe.tbill}
          unit={showSubscribe.unit}
          deadline={showSubscribe.deadline}
          onClose={() => setShowSubscribe(null)}
          onSubmit={(amount: number, bidYield: string) => {
            setShowSubscribe(null);
            setReview({tbill: showSubscribe.tbill, amount, bidYield});
          }}
        />
      )}
      {review && (
        <TBillReviewModal
          tbill={review.tbill}
          amount={review.amount}
          bidYield={review.bidYield}
          onClose={() => setReview(null)}
          onConfirm={() => {
            setReview(null);
            setFeedback('Subscription received. Allocation will be confirmed after auction date.');
            addPending({
              product: review.tbill.name,
              amount: review.amount,
              status: 'Pending Auction',
              details: `Auction: ${review.tbill.auctionClose}`
            });
          }}
        />
      )}
      {feedback && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded p-4 mt-4">{feedback}</div>
      )}
    </div>
  );
};

const PrimaryBondAuctions = ({ addPending }: { addPending: (order: any) => void }) => {
  const [selectedBond, setSelectedBond] = useState<PrimaryBond | null>(null);
  const [showSubscribe, setShowSubscribe] = useState<{bond: PrimaryBond, unit: number, deadline: string} | null>(null);
  const [review, setReview] = useState<{bond: PrimaryBond, amount: number} | null>(null);
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Primary Market Bond Auctions</h2>
      <ul className="divide-y divide-slate-200">
        {PRIMARY_BONDS.map((bond) => (
          <li key={bond.id} className="py-3 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold">{bond.name}</span>
              <div className="flex gap-2">
                <button className="text-xs text-[#2c3e5f] underline font-semibold" onClick={() => setSelectedBond(bond)}>Details</button>
                <button className="text-xs text-emerald-700 underline font-semibold" onClick={() => setShowSubscribe({bond, unit: 1000, deadline: bond.auctionClose})}>Subscribe</button>
              </div>
            </div>
            <span className="text-xs text-slate-500">Coupon: {bond.coupon}</span>
            <span className="text-xs text-slate-500">Offer Amount: {bond.offerAmount}</span>
            <span className="text-xs text-slate-500">Auction Closes: {bond.auctionClose}</span>
          </li>
        ))}
      </ul>
      {selectedBond && <BondAuctionDetailModal bond={selectedBond} onClose={() => setSelectedBond(null)} />}
      {showSubscribe && (
        <SubscribeAuctionModal
          product={showSubscribe.bond}
          unit={showSubscribe.unit}
          deadline={showSubscribe.deadline}
          onClose={() => setShowSubscribe(null)}
          onSubmit={(amount: number) => {
            setShowSubscribe(null);
            setReview({bond: showSubscribe.bond, amount});
          }}
        />
      )}
      {review && (
        <BondReviewModal
          bond={review.bond}
          amount={review.amount}
          onClose={() => setReview(null)}
          onConfirm={() => {
            setReview(null);
            alert('Subscription submitted to backend!');
          }}
        />
      )}
    </div>
  );
};

const SecondaryMarketBonds = ({ addPending }: { addPending: (order: any) => void }) => {
  const [selectedBond, setSelectedBond] = useState<SecondaryBond | null>(null);
  const [showBuy, setShowBuy] = useState<SecondaryBond | null>(null);
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Secondary Market Bonds</h2>
      <ul className="divide-y divide-slate-200">
        {SECONDARY_BONDS.map((bond: SecondaryBond) => (
          <li key={bond.id} className="py-3 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold">{bond.name}</span>
              <div className="flex gap-2">
                <button className="text-xs text-[#2c3e5f] underline font-semibold" onClick={() => setSelectedBond(bond)}>Details</button>
                <button className="text-xs text-emerald-700 underline font-semibold" onClick={() => setShowBuy(bond)}>Buy</button>
              </div>
            </div>
            <span className="text-xs text-slate-500">ISIN: {bond.isin}</span>
            <span className="text-xs text-slate-500">Coupon: {bond.coupon}</span>
            <span className="text-xs text-slate-500">Maturity: {bond.maturity}</span>
            <span className="text-xs text-slate-500">Bid: {bond.bid} | Ask: {bond.ask}</span>
            <span className="text-xs text-slate-500">YTM: {bond.ytm} | Accrued Interest: {bond.accruedInterest}</span>
            <span className="text-xs text-slate-500">Settlement: {bond.settlement}</span>
            <div className="flex gap-2 mt-1">
              <button className="px-3 py-1 rounded bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700" onClick={() => setShowBuy(bond)}>Buy</button>
              <button className="px-3 py-1 rounded bg-red-500 text-white text-xs font-semibold hover:bg-red-600">Sell</button>
            </div>
          </li>
        ))}
      </ul>
      {/* {selectedBond && <SecondaryBondDetailModal bond={selectedBond} onClose={() => setSelectedBond(null)} />} */}
      {showBuy && <BuySecondaryBondModal bond={showBuy} onClose={() => setShowBuy(null)} />}
    </div>
  );
};

const MutualFunds = ({ addPending }: { addPending: (order: any) => void }) => {
  const [selectedFund, setSelectedFund] = useState<MutualFund | null>(null);
  const [showInvest, setShowInvest] = useState<MutualFund | null>(null);
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Mutual Funds</h2>
      <ul className="divide-y divide-slate-200">
        {MUTUAL_FUNDS.map((fund) => (
          <li key={fund.id} className="py-3 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold">{fund.name}</span>
              <div className="flex gap-2">
                <button className="text-xs text-[#2c3e5f] underline font-semibold" onClick={() => setSelectedFund(fund)}>Details</button>
                <button className="text-xs text-emerald-700 underline font-semibold" onClick={() => setShowInvest(fund)}>Invest</button>
              </div>
            </div>
            <span className="text-xs text-slate-500">1-Year Return: {fund.oneYearReturn}</span>
            <span className="text-xs text-slate-500">Risk: {fund.risk}</span>
            <span className="text-xs text-slate-500">Expense Ratio: {fund.expenseRatio}</span>
            <span className="text-xs text-slate-500">Min Subscription: {fund.minSubscription}</span>
          </li>
        ))}
      </ul>
      {selectedFund && <MutualFundDetailModal fund={selectedFund} onClose={() => setSelectedFund(null)} />}
      {showInvest && <MutualFundInvestModal fund={showInvest} onClose={() => setShowInvest(null)} />}
    </div>
  );
};

const usePendingOrders = () => {
  const [pending, setPending] = useState<any[]>([]);
  return { pending, addPending: (order: any) => setPending((p) => [...p, order]), setPending };
};


export default function InvestmentsPage() {
  const [activeTab, setActiveTab] = useState('auctions');
  const pendingState = usePendingOrders();

  const TABS = [
    { key: 'auctions', label: 'T-bill/Bond Auctions', component: <TBillBondAuctions addPending={pendingState.addPending} /> },
    { key: 'secondary', label: 'Secondary Market', component: <SecondaryMarketBonds addPending={pendingState.addPending} /> },
    { key: 'mutual', label: 'Mutual Funds', component: <MutualFunds addPending={pendingState.addPending} /> },
    // { key: 'pending', label: 'Pending', component: <PendingOrdersTab orders={pendingState.pending} /> },
    { key: 'portfolio', label: 'My Portfolio', component: <InvestmentPortfolio /> },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Investments</h1>
      <div className="flex gap-2 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg font-semibold transition border-b-2 ${activeTab === tab.key ? 'border-[#2c3e5f] text-[#2c3e5f] bg-white' : 'border-transparent text-slate-600 bg-slate-100 hover:bg-white'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="bg-white rounded-xl shadow p-6 min-h-[350px]">
        {TABS.find((tab) => tab.key === activeTab)?.component}
      </div>
    </div>
  );
}

function MutualFundInvestModal({ fund, onClose }: { fund: MutualFund; onClose: () => void }) {
  const [mode, setMode] = useState<'lump' | 'sip'>('lump');
  const [amount, setAmount] = useState(Number(fund.minSubscription.replace(/[^\d]/g, '')) || 10000);
  const [dividend, setDividend] = useState<'growth' | 'idcw'>('growth');
  const [sipFreq, setSipFreq] = useState<'monthly' | 'quarterly'>('monthly');
  const [sipStart, setSipStart] = useState(() => new Date().toISOString().slice(0,10));
  const [error, setError] = useState('');
  const [showReview, setShowReview] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const now = new Date();
  const cutoff = new Date(); cutoff.setHours(14,0,0,0);
  const afterCutoff = now > cutoff;
  const navDate = afterCutoff ? new Date(now.getTime() + 24*60*60*1000) : now;
  const navDateStr = navDate.toLocaleDateString();

  // Calculate units and redemption policy
  const nav = fund.navHistory?.[fund.navHistory.length - 1] || 1;
  const units = amount / nav;
  const redemption = fund.risk === 'Low' ? 'T+1 (Next business day)' : 'T+3 (3 business days)';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (amount < Number(fund.minSubscription.replace(/[^\d]/g, '')) || amount % 1000 !== 0) {
      setError(`Minimum amount is ${fund.minSubscription}, in multiples of ₦1,000.`);
      return;
    }
    setShowReview(true);
  };
  const handleReviewConfirm = () => {
    setShowReview(false);
    setShowConfirm(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative">
        <button className="absolute top-3 right-3 text-slate-400 hover:text-slate-700" onClick={onClose}>✕</button>
        <h3 className="text-xl font-bold mb-4">Invest in {fund.name}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Investment Type</label>
            <div className="flex gap-4 mt-1">
              <label className="flex items-center gap-1">
                <input type="radio" checked={mode === 'lump'} onChange={() => setMode('lump')} />
                <span className="text-xs">Lump Sum</span>
              </label>
              <label className="flex items-center gap-1">
                <input type="radio" checked={mode === 'sip'} onChange={() => setMode('sip')} />
                <span className="text-xs">Recurring SIP</span>
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Amount (₦)</label>
            <input
              type="number"
              min={Number(fund.minSubscription.replace(/[^\d]/g, ''))}
              step={1000}
              value={amount}
              onChange={e => setAmount(Number(e.target.value))}
              className="w-full rounded border border-slate-200 px-3 py-2"
              required
            />
            <div className="text-xs text-slate-500 mt-1">Minimum {fund.minSubscription}, multiples of ₦1,000</div>
          </div>
          {mode === 'sip' && (
            <div className="flex gap-2">
              <div>
                <label className="block text-sm font-semibold mb-1">SIP Frequency</label>
                <select value={sipFreq} onChange={e => setSipFreq(e.target.value as 'monthly' | 'quarterly')} className="rounded border border-slate-200 px-2 py-1">
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Start Date</label>
                <input type="date" value={sipStart} onChange={e => setSipStart(e.target.value)} className="rounded border border-slate-200 px-2 py-1" />
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold mb-1">Dividend Option</label>
            <div className="flex gap-4 mt-1">
              <label className="flex items-center gap-1">
                <input type="radio" checked={dividend === 'growth'} onChange={() => setDividend('growth')} />
                <span className="text-xs">Growth</span>
              </label>
              <label className="flex items-center gap-1">
                <input type="radio" checked={dividend === 'idcw'} onChange={() => setDividend('idcw')} />
                <span className="text-xs">IDCW</span>
              </label>
            </div>
          </div>
          <div className="text-xs text-slate-700 bg-slate-50 rounded p-3">
            Order will be executed at next NAV ({navDateStr}) {afterCutoff && <span className="text-red-600">(after cut-off time)</span>}.
          </div>
        </form>
        {showReview && (
          <MutualFundReviewModal
            fund={fund}
            amount={amount}
            units={units}
            navDateStr={navDateStr}
            redemption={redemption}
            onClose={() => setShowReview(false)}
            onConfirm={handleReviewConfirm}
          />
        )}
        {showConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-xs relative z-10">
              <h4 className="text-lg font-bold mb-2">Order Placed</h4>
              <div className="text-sm mb-2">Investment order submitted to backend!</div>
              <div className="flex gap-2 mt-4">
                <button className="flex-1 rounded bg-[#2c3e5f] py-2 font-semibold text-white" onClick={onClose}>Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
// ...existing code...
