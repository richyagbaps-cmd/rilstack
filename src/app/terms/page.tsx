'use client';

import Link from 'next/link';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#F8F9FC] text-[#1E2A3A]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="mx-auto max-w-[820px] px-6 py-16">
        <Link href="/" className="text-[#2c3e5f] font-semibold hover:underline text-sm">&larr; Back to Rilstack</Link>

        <h1 className="text-[2.4rem] font-extrabold mt-8 mb-2">Terms of Service</h1>
        <p className="text-[#4A5B6E] mb-10">Last updated: April 6, 2026</p>

        <div className="space-y-8 text-[#4A5B6E] leading-relaxed text-[0.95rem]">
          <section>
            <h2 className="text-xl font-bold text-[#1E2A3A] mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using Rilstack (&quot;the Service&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). The Service is operated by Rick Investments Limited (RC: 1768492), a company registered in Nigeria. If you do not agree to these Terms, do not use the Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1E2A3A] mb-3">2. Eligibility</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>You must be at least 18 years of age</li>
              <li>You must be a resident of Nigeria or an eligible jurisdiction</li>
              <li>You must provide a valid National Identification Number (NIN)</li>
              <li>You must provide accurate and truthful personal information</li>
              <li>You may only hold one Rilstack account per individual</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1E2A3A] mb-3">3. Account Registration and KYC</h2>
            <p>To use Rilstack, you must complete Know Your Customer (KYC) verification, which includes providing your NIN and optionally your BVN. You are responsible for:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Maintaining the confidentiality of your login credentials</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized use at rickinvestmentslimited@gmail.com</li>
              <li>Keeping your profile information accurate and up to date</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1E2A3A] mb-3">4. Services Provided</h2>
            <h3 className="font-semibold text-[#1E2A3A] mt-4 mb-2">4.1 Budgeting</h3>
            <p>Rilstack provides personal budgeting tools that allow you to categorize income and expenses, set spending limits, and track financial goals. Strict Mode locks surplus funds automatically; Relaxed Mode provides flexibility.</p>
            <h3 className="font-semibold text-[#1E2A3A] mt-4 mb-2">4.2 Safelock Savings</h3>
            <p>Safelock allows you to create goal-based savings vaults with optional lock periods. Locked funds may not be withdrawn before the maturity date without applicable penalties. Interest or returns on Safelock may vary based on prevailing market conditions.</p>
            <h3 className="font-semibold text-[#1E2A3A] mt-4 mb-2">4.3 Investing</h3>
            <p>Rilstack facilitates access to investment opportunities including but not limited to mutual funds, fixed-income securities, and fractional shares. All investments carry risk, including the potential loss of principal. Past performance is not indicative of future results.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1E2A3A] mb-3">5. Deposits and Withdrawals</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Deposits are processed through our authorized payment partner (Paystack) and credited upon confirmation</li>
              <li>Withdrawal requests are processed within 1–3 business days</li>
              <li>We reserve the right to delay or refuse withdrawals where fraud is suspected or regulatory holds apply</li>
              <li>Transaction fees, if applicable, will be clearly disclosed before confirmation</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1E2A3A] mb-3">6. User Obligations</h2>
            <p>You agree NOT to:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Use the Service for money laundering, terrorist financing, or any illegal activity</li>
              <li>Provide false, misleading, or fraudulent information</li>
              <li>Attempt to gain unauthorized access to other accounts or our systems</li>
              <li>Use automated scripts, bots, or scrapers against the Service</li>
              <li>Reverse-engineer, decompile, or disassemble any part of the Service</li>
              <li>Circumvent security features or budget mode restrictions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1E2A3A] mb-3">7. Investment Disclaimer</h2>
            <p>Rilstack is a technology platform and does not provide personalized financial, investment, or legal advice. Investment products available through the Service are subject to market risks. You acknowledge that:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>The value of investments can go down as well as up</li>
              <li>You may receive back less than you originally invested</li>
              <li>Historical returns do not guarantee future performance</li>
              <li>You should seek independent financial advice if uncertain</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1E2A3A] mb-3">8. Intellectual Property</h2>
            <p>All content, trademarks, logos, software, and design elements of Rilstack are the exclusive property of Rick Investments Limited. You may not reproduce, distribute, or create derivative works without our prior written consent.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1E2A3A] mb-3">9. Account Suspension and Termination</h2>
            <p>We reserve the right to suspend or terminate your account if:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>You violate these Terms or applicable laws</li>
              <li>Fraudulent or suspicious activity is detected</li>
              <li>Required by regulatory or law enforcement authorities</li>
              <li>Your KYC information cannot be verified</li>
            </ul>
            <p className="mt-2">Upon termination, any remaining lawful funds will be returned to your verified bank account within 30 business days.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1E2A3A] mb-3">10. Limitation of Liability</h2>
            <p>To the maximum extent permitted by Nigerian law:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Rilstack is provided &quot;as is&quot; without warranties of any kind</li>
              <li>We are not liable for investment losses arising from market fluctuations</li>
              <li>We are not liable for service interruptions caused by events beyond our control</li>
              <li>Our total liability shall not exceed the fees paid by you in the 12 months preceding the claim</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1E2A3A] mb-3">11. Dispute Resolution</h2>
            <p>Any dispute arising from or related to these Terms shall be resolved through:</p>
            <ol className="list-decimal pl-6 space-y-1 mt-2">
              <li><strong>Negotiation:</strong> Good-faith discussions between the parties for 30 days</li>
              <li><strong>Mediation:</strong> Through a mutually agreed mediator in Lagos, Nigeria</li>
              <li><strong>Arbitration:</strong> Under the Arbitration and Mediation Act 2023 of Nigeria, with proceedings in Lagos</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1E2A3A] mb-3">12. Governing Law</h2>
            <p>These Terms are governed by and construed in accordance with the laws of the Federal Republic of Nigeria, including the Investments and Securities Act, the CBN Act, and the Nigeria Data Protection Act 2023.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1E2A3A] mb-3">13. Changes to Terms</h2>
            <p>We may modify these Terms at any time. Material changes will be communicated via email or in-app notification at least 30 days in advance. Continued use after changes take effect constitutes acceptance of the revised Terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1E2A3A] mb-3">14. Contact</h2>
            <div className="mt-3 bg-white rounded-2xl p-5 border border-[#E9EDF2] text-sm">
              <p><strong>Rick Investments Limited</strong></p>
              <p>19, Gabriel Bankole Close, Amuwo Odofin, Lagos, Nigeria</p>
              <p>Email: rickinvestmentslimited@gmail.com</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
