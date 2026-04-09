'use client';

import Link from 'next/link';

export default function SecurityAndFraud() {
  return (
    <div className="min-h-screen bg-[#F8F9FC] text-[#1E2A3A]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="mx-auto max-w-[820px] px-6 py-16">
        <Link href="/" className="text-[#2c3e5f] font-semibold hover:underline text-sm">&larr; Back to Rilstack</Link>

        <h1 className="text-[2.4rem] font-extrabold mt-8 mb-2">Security &amp; Fraud Prevention</h1>
        <p className="text-[#4A5B6E] mb-10">Last updated: April 6, 2026</p>

        <div className="space-y-8 text-[#4A5B6E] leading-relaxed text-[0.95rem]">
          <section>
            <h2 className="text-xl font-bold text-[#1E2A3A] mb-3">1. Our Security Commitment</h2>
            <p>At Rilstack, security is foundational — not an afterthought. We employ bank-grade security infrastructure to protect your personal data, financial information, and transactions. Our security practices are aligned with Central Bank of Nigeria (CBN) guidelines and international standards.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1E2A3A] mb-3">2. Data Encryption</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>In Transit:</strong> All data transmitted between your device and our servers is protected with 256-bit SSL/TLS encryption</li>
              <li><strong>At Rest:</strong> Sensitive data including NIN, BVN, and financial records are encrypted using AES-256 encryption</li>
              <li><strong>Passwords:</strong> Stored using bcrypt with salt rounds — we never store plaintext passwords</li>
              <li><strong>API Communications:</strong> All internal and third-party API calls use encrypted channels with certificate pinning</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1E2A3A] mb-3">3. Identity Verification (KYC)</h2>
            <p>Rilstack requires Know Your Customer verification to protect you and the platform:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li><strong>NIN Verification:</strong> Mandatory for all accounts — validates your identity against the National Identity Management Commission (NIMC) database</li>
              <li><strong>BVN Verification:</strong> Optional but recommended — provides additional identity confirmation through the Nigeria Inter-Bank Settlement System (NIBSS)</li>
              <li><strong>Purpose:</strong> Prevents identity theft, money laundering, and account fraud</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1E2A3A] mb-3">4. Fraud Detection and Prevention</h2>
            <p>We employ multiple layers of fraud prevention:</p>
            <div className="mt-4 space-y-4">
              <div className="bg-white rounded-2xl p-5 border border-[#E9EDF2]">
                <h3 className="font-semibold text-[#1E2A3A] mb-2">🔍 Transaction Monitoring</h3>
                <p>Real-time monitoring of all transactions for suspicious patterns including unusual withdrawal amounts, rapid successive transactions, and activity from unfamiliar locations.</p>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-[#E9EDF2]">
                <h3 className="font-semibold text-[#1E2A3A] mb-2">🛡️ Account Protection</h3>
                <p>Automatic account lockout after multiple failed login attempts. Session management with secure token rotation. Device fingerprinting to detect unauthorized access.</p>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-[#E9EDF2]">
                <h3 className="font-semibold text-[#1E2A3A] mb-2">⚠️ Suspicious Activity Alerts</h3>
                <p>Instant email notifications for login from new devices, password changes, large transactions, and withdrawal requests. You will always be informed of account activity.</p>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-[#E9EDF2]">
                <h3 className="font-semibold text-[#1E2A3A] mb-2">🏦 Anti-Money Laundering (AML)</h3>
                <p>Compliance with CBN AML/CFT regulations. Suspicious transactions are flagged and reported to the Nigerian Financial Intelligence Unit (NFIU) as required by law.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1E2A3A] mb-3">5. Infrastructure Security</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Hosted on enterprise-grade cloud infrastructure with SOC 2 compliance</li>
              <li>DDoS protection and Web Application Firewall (WAF)</li>
              <li>Regular penetration testing by independent security firms</li>
              <li>Automated vulnerability scanning and patch management</li>
              <li>Role-based access controls (RBAC) for all internal systems</li>
              <li>Comprehensive audit logging of all administrative actions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1E2A3A] mb-3">6. Your Responsibilities</h2>
            <p>Security is a shared responsibility. We recommend:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Use a strong, unique password (minimum 8 characters with mixed case, numbers, and symbols)</li>
              <li>Never share your login credentials, OTPs, or PINs with anyone</li>
              <li>Rilstack will <strong>never</strong> ask for your password via email, phone, or chat</li>
              <li>Enable screen lock on your devices</li>
              <li>Log out after using Rilstack on shared or public devices</li>
              <li>Keep your email address and phone number up to date for security alerts</li>
              <li>Report any suspicious activity immediately</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1E2A3A] mb-3">7. Fraud Liability</h2>
            <p>If unauthorized transactions occur on your account due to a security breach on our end, Rilstack will investigate and reimburse verified fraudulent transactions. Our $0 fraud liability guarantee applies when:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>You report the unauthorized activity within 48 hours</li>
              <li>You did not willingly share your credentials</li>
              <li>The breach is confirmed through our investigation</li>
            </ul>
            <p className="mt-2">Claims are reviewed on a case-by-case basis. We aim to resolve fraud disputes within 10 business days.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1E2A3A] mb-3">8. Reporting Fraud or Security Issues</h2>
            <p>If you suspect fraud or a security vulnerability, contact us immediately:</p>
            <div className="mt-3 bg-white rounded-2xl p-5 border border-[#E9EDF2] text-sm">
              <p><strong>Emergency Fraud Line:</strong> rickinvestmentslimited@gmail.com (Subject: URGENT FRAUD)</p>
              <p className="mt-1"><strong>Security Vulnerability Reporting:</strong> rickinvestmentslimited@gmail.com</p>
              <p className="mt-1"><strong>General Support:</strong> rickinvestmentslimited@gmail.com</p>
              <p className="mt-3 text-[#4A5B6E]">We respond to fraud reports within 4 hours during business days (Mon–Fri, 8AM–6PM WAT).</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1E2A3A] mb-3">9. Regulatory Compliance</h2>
            <p>Rilstack operates in compliance with:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Central Bank of Nigeria (CBN) guidelines on electronic banking</li>
              <li>Nigeria Data Protection Act (NDPA) 2023</li>
              <li>Money Laundering (Prevention and Prohibition) Act 2022</li>
              <li>Cybercrimes (Prohibition, Prevention, etc.) Act 2015</li>
              <li>Securities and Exchange Commission (SEC) regulations for investment services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1E2A3A] mb-3">10. Updates to This Policy</h2>
            <p>We continuously enhance our security practices. Changes to this document will be communicated via email and in-app notification. We encourage you to review this page periodically.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
