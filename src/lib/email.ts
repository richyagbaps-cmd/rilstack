import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.EMAIL_FROM || "rickinvestmentslimited@gmail.com";

export async function sendWelcomeEmail(email: string, name: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "Welcome to RILSTACK! 🎉",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1e293b;">Welcome to RILSTACK, ${name}! 🎉</h1>
          <p style="color: #475569; font-size: 16px;">
            Thank you for joining RILSTACK, your all-in-one financial management platform.
          </p>
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #1e293b; font-size: 18px;">What you can do with RILSTACK:</h2>
            <ul style="color: #475569;">
              <li>💰 Track your income and expenses</li>
              <li>📊 Manage budgets with the 50/30/20 rule</li>
              <li>🔒 Create locked savings with interest</li>
              <li>📈 Build your investment portfolio</li>
              <li>💳 Make deposits and withdrawals</li>
            </ul>
          </div>
          <p style="color: #475569;">
            Get started by exploring your dashboard and setting up your financial goals!
          </p>
          <a href="https://rilstack.xyz" style="display: inline-block; background: #1e293b; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 20px;">
            Go to Dashboard
          </a>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
          <p style="color: #94a3b8; font-size: 12px;">
            © ${new Date().getFullYear()} RILSTACK. All rights reserved.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Failed to send welcome email:", error);
    return { success: false, error };
  }
}

export async function sendTransactionEmail(
  email: string,
  name: string,
  type: "deposit" | "withdrawal",
  amount: number,
  status: string,
) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Transaction Alert: ${type === "deposit" ? "Deposit" : "Withdrawal"} of ₦${amount.toLocaleString()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1e293b;">Transaction Alert</h1>
          <div style="background: ${type === "deposit" ? "#dcfce7" : "#fee2e2"}; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="font-size: 24px; font-weight: bold; color: ${type === "deposit" ? "#166534" : "#991b1b"};">
              ${type === "deposit" ? "+" : "-"} ₦${amount.toLocaleString()}
            </p>
            <p style="color: ${type === "deposit" ? "#166534" : "#991b1b"};">
              ${type === "deposit" ? "Deposit" : "Withdrawal"} - ${status}
            </p>
          </div>
          <p style="color: #475569;">
            Hello ${name}, your ${type} of ₦${amount.toLocaleString()} has been ${status}.
          </p>
          <a href="https://rilstack.xyz/?section=account" style="display: inline-block; background: #1e293b; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 20px;">
            View Account
          </a>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Failed to send transaction email:", error);
    return { success: false, error };
  }
}
