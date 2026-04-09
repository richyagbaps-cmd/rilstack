'use client';

import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#F8F9FC] text-[#1E2A3A] dark:bg-[#181C23] dark:text-[#F8F9FC]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="mx-auto max-w-[820px] px-6 py-16">
        <Link href="/" className="text-[#2c3e5f] dark:text-[#6EE7B7] font-semibold hover:underline text-sm">&larr; Back to Rilstack</Link>

        <h1 className="text-[2.4rem] font-extrabold mt-8 mb-2">Privacy Policy</h1>
        <p className="text-[#4A5B6E] mb-10">Last updated: April 6, 2026</p>

        <div className="space-y-8 text-[#4A5B6E] leading-relaxed text-[0.95rem]">
          <section>
            <h2 className="text-xl font-bold text-[#1E2A3A] dark:text-[#F8F9FC] mb-3">1. Introduction</h2>
            <p>Rilstack (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is a product of Rick Investments Limited (RC: 1768492), registered in Nigeria. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use Rilstack&apos;s budgeting, Safelock savings, and investment services (collectively, the &quot;Service&quot;).</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1E2A3A] dark:text-[#F8F9FC] mb-3">2. Information We Collect</h2>
            <h3 className="font-semibold text-[#1E2A3A] dark:text-[#F8F9FC] mt-4 mb-2">2.1 Personal Information</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Full name, email address, phone number, date of birth, and gender</li>
              <li>National Identification Number (NIN) and Bank Verification Number (BVN)</li>
              <li>State of origin and residential address</li>
              <li>Account credentials (encrypted password)</li>
            </ul>
            <h3 className="font-semibold text-[#1E2A3A] dark:text-[#F8F9FC] mt-4 mb-2">2.2 Financial Information</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Budget categories, income, and expense data you enter</li>
              <li>Safelock vault configurations and savings goals</li>
              <li>Investment portfolio selections and transaction history</li>
              <li>Payment and withdrawal details processed through our payment partners</li>
            </ul>
            <h3 className="font-semibold text-[#1E2A3A] dark:text-[#F8F9FC] mt-4 mb-2">2.3 Automatically Collected Information</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Device type, browser type, operating system, and IP address</li>
              <li>Usage patterns, session duration, and feature interactions</li>
              <li>Cookies and similar tracking technologies for session management</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1E2A3A] dark:text-[#F8F9FC] mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>To create, verify, and maintain your account via BVN/NIN verification</li>
              <li>To provide budgeting, Safelock, and investment features</li>
              <li>To process deposits, withdrawals, and investment transactions</li>
              <li>To detect, prevent, and investigate fraud and unauthorized access</li>
              <li>To comply with applicable Nigerian financial regulations (CBN, SEC, NDIC)</li>
              <li>To communicate service updates, security alerts, and account notifications</li>
              <li>To improve and personalize your experience</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1E2A3A] dark:text-[#F8F9FC] mb-3">4. Legal Basis for Processing</h2>
            <p>We process your data under the Nigeria Data Protection Regulation (NDPR) 2019 and the Nigeria Data Protection Act (NDPA) 2023. Our legal bases include:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li><strong>Consent:</strong> You consent to data collection when creating an account</li>
              <li><strong>Contractual necessity:</strong> Processing required to deliver our Service</li>
              <li><strong>Legal obligation:</strong> Compliance with KYC/AML regulations</li>
              <li><strong>Legitimate interest:</strong> Fraud prevention and service improvement</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1E2A3A] dark:text-[#F8F9FC] mb-3">5. Data Sharing and Disclosure</h2>
            <p>We do not sell your personal data. We may share information with:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li><strong>Payment processors:</strong> Paystack and banking partners for transaction processing</li>
              <li><strong>Identity verification providers:</strong> For NIN/BVN validation</li>
              <li><strong>Regulatory authorities:</strong> When required by law (CBN, EFCC, SEC, NFIU)</li>
              <li><strong>Service providers:</strong> Cloud hosting, analytics, and email services operating under strict data processing agreements</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1E2A3A] dark:text-[#F8F9FC] mb-3">6. Data Security</h2>
            <p>We implement industry-standard security measures including:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>256-bit SSL/TLS encryption for all data in transit</li>
              <li>AES-256 encryption for data at rest</li>
              <li>Bcrypt hashing for password storage</li>
              <li>Regular security audits and penetration testing</li>
              <li>Role-based access controls and multi-factor authentication for internal systems</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1E2A3A] dark:text-[#F8F9FC] mb-3">7. Data Retention</h2>
            <p>We retain your personal data for as long as your account is active. Upon account closure, we retain financial records for a minimum of 6 years as required by Nigerian financial regulations. Non-essential data is deleted within 90 days of account closure.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1E2A3A] dark:text-[#F8F9FC] mb-3">8. Your Rights</h2>
            <p>Under the NDPR and NDPA, you have the right to:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Access your personal data held by us</li>
              <li>Rectify inaccurate or incomplete data</li>
              <li>Request deletion of your data (subject to regulatory retention requirements)</li>
              <li>Restrict or object to certain processing activities</li>
              <li>Data portability — receive your data in a structured, machine-readable format</li>
              <li>Withdraw consent at any time</li>
            </ul>
            <p className="mt-2">To exercise these rights, contact us at <strong>rickinvestmentslimited@gmail.com</strong>.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1E2A3A] dark:text-[#F8F9FC] mb-3">9. Cookies</h2>
            <p>We use essential cookies for authentication and session management. We do not use third-party advertising cookies. You can manage cookie preferences through your browser settings.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1E2A3A] dark:text-[#F8F9FC] mb-3">10. Children&apos;s Privacy</h2>
            <p>Rilstack is not intended for use by individuals under 18 years of age. We do not knowingly collect personal information from minors. If we discover that a minor has provided us with personal data, we will delete it promptly.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1E2A3A] dark:text-[#F8F9FC] mb-3">11. Changes to This Policy</h2>
            <p>We may update this Privacy Policy periodically. We will notify you of material changes via email or in-app notification at least 30 days before they take effect. Continued use of the Service after changes constitutes acceptance.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1E2A3A] dark:text-[#F8F9FC] mb-3">12. Contact Us</h2>
            <p>If you have questions or concerns about this Privacy Policy or our data practices:</p>
            <div className="mt-3 bg-white dark:bg-[#232f3e] rounded-2xl p-5 border border-[#E9EDF2] dark:border-[#1E2A3A] text-sm">
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
