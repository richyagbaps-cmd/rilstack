const PAYSTACK_BASE_URL = "https://api.paystack.co";

export type PaystackChannel = "card" | "bank_transfer" | "ussd";

export interface PaystackApiResponse<T> {
  status: boolean;
  message: string;
  data: T;
}

interface PaystackCustomer {
  id: number;
  customer_code: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
}

interface PaystackDedicatedAccount {
  id: number;
  account_name?: string;
  account_number?: string;
  bank?: {
    name?: string;
    slug?: string;
  };
  assigned_bank?: {
    name?: string;
    slug?: string;
  };
  customer?: {
    id?: number;
    customer_code?: string;
    email?: string;
  };
}

export interface PaystackWalletDetails {
  walletId: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
}

export function getPaystackSecretKey() {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;

  if (!secretKey) {
    throw new Error(
      "Payment service not configured. Add PAYSTACK_SECRET_KEY to environment variables.",
    );
  }

  return secretKey;
}

export async function paystackRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<PaystackApiResponse<T>> {
  const secretKey = getPaystackSecretKey();
  const headers = new Headers(init.headers);

  headers.set("Authorization", `Bearer ${secretKey}`);
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${PAYSTACK_BASE_URL}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  const payload = await response.json();

  if (!response.ok || payload.status === false) {
    throw new Error(payload.message || "Paystack request failed.");
  }

  return payload as PaystackApiResponse<T>;
}

export function encodeEmailForReference(email: string) {
  return Buffer.from(email.trim().toLowerCase()).toString("base64url");
}

export function buildWithdrawalReference(email: string) {
  return `WTH_${encodeEmailForReference(email)}_${Date.now()}`;
}

export function isReferenceForEmail(
  reference: string | undefined,
  email: string,
) {
  if (!reference) return false;
  return reference.startsWith(`WTH_${encodeEmailForReference(email)}_`);
}

export function mapDepositMethodToChannel(
  method: "card" | "transfer" | "ussd",
): PaystackChannel {
  if (method === "transfer") return "bank_transfer";
  if (method === "ussd") return "ussd";
  return "card";
}

export function mapPaystackChannelToMethod(
  channel?: string,
): "card" | "transfer" | "ussd" {
  if (channel === "bank_transfer" || channel === "bank") return "transfer";
  if (channel === "ussd") return "ussd";
  return "card";
}

function splitName(fullName?: string) {
  const trimmed = fullName?.trim();

  if (!trimmed) {
    return {
      firstName: "RILSTACK",
      lastName: "User",
    };
  }

  const [first, ...rest] = trimmed.split(/\s+/);

  return {
    firstName: first || "RILSTACK",
    lastName: rest.join(" ") || "User",
  };
}

function mapDedicatedAccountToWallet(
  account: PaystackDedicatedAccount,
): PaystackWalletDetails | null {
  if (!account.account_number) return null;

  const bankName =
    account.bank?.name ||
    account.assigned_bank?.name ||
    "Paystack Bank";

  return {
    walletId: String(account.id),
    accountName: account.account_name || "RILSTACK Wallet",
    accountNumber: account.account_number,
    bankName,
  };
}

async function getCustomerByEmail(email: string) {
  try {
    const response = await paystackRequest<PaystackCustomer>(
      `/customer/${encodeURIComponent(email)}`,
      {
        method: "GET",
      },
    );

    return response.data;
  } catch {
    return null;
  }
}

export async function ensurePaystackWalletForEmail(
  email: string,
  profile?: { name?: string; phone?: string; bvn?: string },
): Promise<PaystackWalletDetails> {
  const normalizedEmail = email.trim().toLowerCase();
  const { firstName, lastName } = splitName(profile?.name);

  let customer = await getCustomerByEmail(normalizedEmail);

  if (!customer) {
    const createdCustomer = await paystackRequest<PaystackCustomer>(
      "/customer",
      {
        method: "POST",
        body: JSON.stringify({
          email: normalizedEmail,
          first_name: firstName,
          last_name: lastName,
          phone: profile?.phone || undefined,
        }),
      },
    );

    customer = createdCustomer.data;
  }

  // If BVN provided, validate customer identity with Paystack (required for live DVA).
  if (profile?.bvn) {
    try {
      await paystackRequest(`/customer/${customer.customer_code}/identification`, {
        method: "POST",
        body: JSON.stringify({
          country: "NG",
          type: "bvn",
          value: profile.bvn,
          first_name: firstName,
          last_name: lastName,
        }),
      });
    } catch {
      // Already validated or validation in progress — not fatal
    }
  }

  const dedicatedAccounts = await paystackRequest<PaystackDedicatedAccount[]>(
    `/dedicated_account?active=true&customer=${encodeURIComponent(customer.customer_code)}`,
    {
      method: "GET",
    },
  );

  const existingWallet = dedicatedAccounts.data
    .filter((account) => {
      const accountCustomerCode = account.customer?.customer_code;
      const accountCustomerId = account.customer?.id;

      return (
        accountCustomerCode === customer?.customer_code ||
        accountCustomerId === customer?.id
      );
    })
    .map(mapDedicatedAccountToWallet)
    .find((wallet): wallet is PaystackWalletDetails => Boolean(wallet));

  if (existingWallet) {
    return existingWallet;
  }

  const createdDedicatedAccount =
    await paystackRequest<PaystackDedicatedAccount>("/dedicated_account", {
      method: "POST",
      body: JSON.stringify({
        customer: customer.customer_code,
        preferred_bank:
          process.env.PAYSTACK_DEDICATED_ACCOUNT_BANK || "wema-bank",
      }),
    });

  const createdWallet = mapDedicatedAccountToWallet(
    createdDedicatedAccount.data,
  );

  if (!createdWallet) {
    throw new Error("Unable to provision Paystack wallet account.");
  }

  return createdWallet;
}
