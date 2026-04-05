import { NextRequest, NextResponse } from 'next/server';
import { getPaystackLedgerForEmail } from '@/lib/account-ledger';

export const dynamic = 'force-dynamic';

interface StatementRequest {
  userEmail: string;
  deliveryEmail: string;
  accountName?: string;
}

const formatCurrency = (amount: number) => `N${amount.toLocaleString()}`;

const escapeCsv = (value: string) => `"${value.replace(/"/g, '""')}"`;

function buildStatementCsv(
  accountName: string,
  deliveryEmail: string,
  ledger: Awaited<ReturnType<typeof getPaystackLedgerForEmail>>,
) {
  const lines = [
    'RILSTACK Account Statement',
    `Account Holder,${escapeCsv(accountName)}`,
    `Statement Email,${escapeCsv(deliveryEmail)}`,
    `Generated At,${escapeCsv(new Date(ledger.summary.generatedAt).toLocaleString())}`,
    `Current Balance At Generation,${escapeCsv(formatCurrency(ledger.summary.totalBalance))}`,
    '',
    'Type,Reference,Amount,Status,Date and Time,Method,Description',
  ];

  ledger.transactions.forEach((transaction) => {
    lines.push(
      [
        escapeCsv(transaction.type),
        escapeCsv(transaction.reference),
        escapeCsv(formatCurrency(transaction.amount)),
        escapeCsv(transaction.status),
        escapeCsv(new Date(transaction.date).toLocaleString()),
        escapeCsv(transaction.method),
        escapeCsv(transaction.description || ''),
      ].join(','),
    );
  });

  return lines.join('\n');
}

function buildStatementHtml(
  accountName: string,
  deliveryEmail: string,
  ledger: Awaited<ReturnType<typeof getPaystackLedgerForEmail>>,
) {
  const rows = ledger.transactions
    .map(
      (transaction) => `
        <tr>
          <td style="padding:8px;border:1px solid #dbe2ea;">${transaction.type}</td>
          <td style="padding:8px;border:1px solid #dbe2ea;">${transaction.reference}</td>
          <td style="padding:8px;border:1px solid #dbe2ea;">${formatCurrency(transaction.amount)}</td>
          <td style="padding:8px;border:1px solid #dbe2ea;">${transaction.status}</td>
          <td style="padding:8px;border:1px solid #dbe2ea;">${new Date(transaction.date).toLocaleString()}</td>
          <td style="padding:8px;border:1px solid #dbe2ea;">${transaction.method}</td>
          <td style="padding:8px;border:1px solid #dbe2ea;">${transaction.description || ''}</td>
        </tr>
      `,
    )
    .join('');

  return `
    <div style="font-family:Arial,sans-serif;color:#0f172a;">
      <h1>RILSTACK Account Statement</h1>
      <p><strong>Account holder:</strong> ${accountName}</p>
      <p><strong>Statement email:</strong> ${deliveryEmail}</p>
      <p><strong>Generated at:</strong> ${new Date(ledger.summary.generatedAt).toLocaleString()}</p>
      <p><strong>Current balance at generation:</strong> ${formatCurrency(ledger.summary.totalBalance)}</p>
      <h2>Transactions</h2>
      <table style="border-collapse:collapse;width:100%;">
        <thead>
          <tr>
            <th style="padding:8px;border:1px solid #dbe2ea;text-align:left;">Type</th>
            <th style="padding:8px;border:1px solid #dbe2ea;text-align:left;">Reference</th>
            <th style="padding:8px;border:1px solid #dbe2ea;text-align:left;">Amount</th>
            <th style="padding:8px;border:1px solid #dbe2ea;text-align:left;">Status</th>
            <th style="padding:8px;border:1px solid #dbe2ea;text-align:left;">Date and Time</th>
            <th style="padding:8px;border:1px solid #dbe2ea;text-align:left;">Method</th>
            <th style="padding:8px;border:1px solid #dbe2ea;text-align:left;">Description</th>
          </tr>
        </thead>
        <tbody>
          ${rows || '<tr><td colspan="7" style="padding:8px;border:1px solid #dbe2ea;">No transactions found.</td></tr>'}
        </tbody>
      </table>
    </div>
  `;
}

export async function POST(request: NextRequest) {
  try {
    const body: StatementRequest = await request.json();
    const { userEmail, deliveryEmail, accountName } = body;

    if (!userEmail || !deliveryEmail) {
      return NextResponse.json({ error: 'User email and delivery email are required.' }, { status: 400 });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    const statementFromEmail = process.env.STATEMENT_FROM_EMAIL;

    if (!resendApiKey || !statementFromEmail) {
      return NextResponse.json(
        { error: 'Statement email is not configured. Add RESEND_API_KEY and STATEMENT_FROM_EMAIL.' },
        { status: 503 },
      );
    }

    const ledger = await getPaystackLedgerForEmail(userEmail);
    const recipientName = accountName || userEmail;
    const csv = buildStatementCsv(recipientName, deliveryEmail, ledger);
    const html = buildStatementHtml(recipientName, deliveryEmail, ledger);
    const fileName = `rilstack-statement-${new Date(ledger.summary.generatedAt).toISOString().slice(0, 10)}.csv`;

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: statementFromEmail,
        to: [deliveryEmail],
        subject: `RILSTACK Account Statement - ${new Date(ledger.summary.generatedAt).toLocaleDateString()}`,
        html,
        attachments: [
          {
            filename: fileName,
            content: Buffer.from(csv, 'utf8').toString('base64'),
          },
        ],
      }),
      cache: 'no-store',
    });

    const emailResult = await emailResponse.json();

    if (!emailResponse.ok) {
      throw new Error(emailResult.message || 'Failed to send account statement email.');
    }

    return NextResponse.json({
      success: true,
      generatedAt: ledger.summary.generatedAt,
      currentBalance: ledger.summary.totalBalance,
      deliveryEmail,
      message: 'Account statement sent successfully.',
    });
  } catch (error: any) {
    console.error('Statement email error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send account statement.' },
      { status: 500 },
    );
  }
}
