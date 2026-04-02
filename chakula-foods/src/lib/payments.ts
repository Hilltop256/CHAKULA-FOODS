/**
 * Payment integrations for Uganda market:
 * - MTN Mobile Money (MoMo)
 * - Airtel Money
 * - Visa/Mastercard via Flutterwave
 */

import { normalizePhone } from "./utils";

// ── MTN Mobile Money ───────────────────────────────────────────────────────────
const MTN_BASE_URL =
  process.env.MTN_MOMO_BASE_URL ?? "https://sandbox.momodeveloper.mtn.com";
const MTN_SUBSCRIPTION_KEY = process.env.MTN_SUBSCRIPTION_KEY ?? "";
const MTN_API_USER = process.env.MTN_API_USER ?? "";
const MTN_API_KEY = process.env.MTN_API_KEY ?? "";

async function getMTNToken(): Promise<string> {
  const credentials = Buffer.from(`${MTN_API_USER}:${MTN_API_KEY}`).toString(
    "base64"
  );
  const res = await fetch(`${MTN_BASE_URL}/collection/token/`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Ocp-Apim-Subscription-Key": MTN_SUBSCRIPTION_KEY,
    },
  });
  if (!res.ok) throw new Error("Failed to get MTN token");
  const data = await res.json();
  return data.access_token;
}

export async function initiateMTNPayment({
  amount,
  phone,
  orderId,
  description,
}: {
  amount: number;
  phone: string;
  orderId: string;
  description: string;
}) {
  const token = await getMTNToken();
  const referenceId = crypto.randomUUID();
  const normalizedPhone = normalizePhone(phone);

  const res = await fetch(`${MTN_BASE_URL}/collection/v1_0/requesttopay`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Reference-Id": referenceId,
      "X-Target-Environment": process.env.MTN_ENVIRONMENT ?? "sandbox",
      "Ocp-Apim-Subscription-Key": MTN_SUBSCRIPTION_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: String(amount),
      currency: "UGX",
      externalId: orderId,
      payer: {
        partyIdType: "MSISDN",
        partyId: normalizedPhone,
      },
      payerMessage: description,
      payeeNote: `Chakula Foods - ${description}`,
    }),
  });

  if (!res.ok) {
    throw new Error("MTN payment initiation failed");
  }

  return { referenceId, status: "PENDING" };
}

export async function checkMTNPaymentStatus(referenceId: string) {
  const token = await getMTNToken();

  const res = await fetch(
    `${MTN_BASE_URL}/collection/v1_0/requesttopay/${referenceId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Target-Environment": process.env.MTN_ENVIRONMENT ?? "sandbox",
        "Ocp-Apim-Subscription-Key": MTN_SUBSCRIPTION_KEY,
      },
    }
  );

  return res.json();
}

// ── Airtel Money ───────────────────────────────────────────────────────────────
const AIRTEL_BASE_URL =
  process.env.AIRTEL_BASE_URL ?? "https://openapiuat.airtel.africa";
const AIRTEL_CLIENT_ID = process.env.AIRTEL_CLIENT_ID ?? "";
const AIRTEL_CLIENT_SECRET = process.env.AIRTEL_CLIENT_SECRET ?? "";

async function getAirtelToken(): Promise<string> {
  const res = await fetch(`${AIRTEL_BASE_URL}/auth/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: AIRTEL_CLIENT_ID,
      client_secret: AIRTEL_CLIENT_SECRET,
      grant_type: "client_credentials",
    }),
  });
  if (!res.ok) throw new Error("Failed to get Airtel token");
  const data = await res.json();
  return data.access_token;
}

export async function initiateAirtelPayment({
  amount,
  phone,
  orderId,
  description,
}: {
  amount: number;
  phone: string;
  orderId: string;
  description: string;
}) {
  const token = await getAirtelToken();
  const transactionId = crypto.randomUUID().replace(/-/g, "").slice(0, 20);
  const normalizedPhone = normalizePhone(phone);

  const res = await fetch(`${AIRTEL_BASE_URL}/merchant/v2/payments/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-Country": "UG",
      "X-Currency": "UGX",
    },
    body: JSON.stringify({
      reference: description,
      subscriber: {
        country: "UG",
        currency: "UGX",
        msisdn: normalizedPhone,
      },
      transaction: {
        amount,
        country: "UG",
        currency: "UGX",
        id: transactionId,
      },
    }),
  });

  const data = await res.json();

  if (data.status?.code !== "200") {
    throw new Error(data.status?.message ?? "Airtel payment initiation failed");
  }

  return { transactionId, status: "PENDING" };
}

export async function checkAirtelPaymentStatus(transactionId: string) {
  const token = await getAirtelToken();

  const res = await fetch(
    `${AIRTEL_BASE_URL}/standard/v1/payments/${transactionId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Country": "UG",
        "X-Currency": "UGX",
      },
    }
  );

  return res.json();
}

// ── Flutterwave (Visa/Mastercard) ──────────────────────────────────────────────
const FLW_SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY ?? "";

export async function initiateFlutterwavePayment({
  amount,
  email,
  phone,
  name,
  orderId,
  description,
  redirectUrl,
}: {
  amount: number;
  email: string;
  phone: string;
  name: string;
  orderId: string;
  description: string;
  redirectUrl: string;
}) {
  const res = await fetch("https://api.flutterwave.com/v3/payments", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${FLW_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tx_ref: orderId,
      amount,
      currency: "UGX",
      redirect_url: redirectUrl,
      customer: {
        email,
        phonenumber: phone,
        name,
      },
      customizations: {
        title: "Chakula Foods",
        description,
        logo: `${process.env.NEXT_PUBLIC_BASE_URL}/logo.png`,
      },
      payment_options: "card",
      meta: { orderId },
    }),
  });

  const data = await res.json();

  if (data.status !== "success") {
    throw new Error(data.message ?? "Payment initiation failed");
  }

  return { paymentLink: data.data.link, txRef: orderId };
}

export async function verifyFlutterwavePayment(transactionId: string) {
  const res = await fetch(
    `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,
    {
      headers: { Authorization: `Bearer ${FLW_SECRET_KEY}` },
    }
  );
  return res.json();
}
