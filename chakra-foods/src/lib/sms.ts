/**
 * SMS notifications via Africa's Talking
 * Uganda-specific implementation
 */

const AT_API_KEY = process.env.AFRICASTALKING_API_KEY ?? "";
const AT_USERNAME = process.env.AFRICASTALKING_USERNAME ?? "sandbox";
const AT_SENDER_ID = process.env.AFRICASTALKING_SENDER_ID ?? "CHAKULA";

export async function sendSMS(
  to: string | string[],
  message: string
): Promise<void> {
  if (!AT_API_KEY || AT_API_KEY === "your-africastalking-api-key-here") {
    console.log(`[SMS - not configured] To: ${to} | ${message}`);
    return;
  }

  const recipients = Array.isArray(to) ? to.join(",") : to;

  const params = new URLSearchParams({
    username: AT_USERNAME,
    to: recipients,
    message,
    from: AT_SENDER_ID,
  });

  const baseUrl =
    AT_USERNAME === "sandbox"
      ? "https://api.sandbox.africastalking.com/version1/messaging"
      : "https://api.africastalking.com/version1/messaging";

  try {
    const res = await fetch(baseUrl, {
      method: "POST",
      headers: {
        apiKey: AT_API_KEY,
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: params.toString(),
    });

    const data = await res.json();
    console.log("SMS sent:", data);
  } catch (err) {
    console.error("SMS send failed:", err);
  }
}

export async function sendOrderConfirmation(
  phone: string,
  orderNumber: string,
  total: number
) {
  const message = `Dear Customer, your Chakula Foods order #${orderNumber} has been confirmed. Total: UGX ${total.toLocaleString()}. We'll notify you when it's ready. Thank you!`;
  return sendSMS(phone, message);
}

export async function sendOrderReady(phone: string, orderNumber: string) {
  const message = `Your Chakula Foods order #${orderNumber} is ready! Please come to the counter to collect. Thank you for choosing Chakula Foods!`;
  return sendSMS(phone, message);
}

export async function sendSubscriptionReminder(
  phone: string,
  planName: string
) {
  const message = `Hi! Your Chakula Foods ${planName} subscription is active. Your meals will be prepared fresh for you today. Enjoy!`;
  return sendSMS(phone, message);
}

export async function sendPaymentConfirmation(
  phone: string,
  amount: number,
  method: string
) {
  const message = `Chakula Foods: Payment of UGX ${amount.toLocaleString()} via ${method} received. Thank you for your payment!`;
  return sendSMS(phone, message);
}
