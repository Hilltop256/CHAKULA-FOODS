import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyFlutterwavePayment } from "@/lib/payments";
import { sendPaymentConfirmation } from "@/lib/sms";

/**
 * Flutterwave redirects to /payment/callback?transaction_id=xxx&tx_ref=yyy&status=zzz
 * This API route handles the webhook/callback server-side.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const transactionId = searchParams.get("transaction_id");
  const txRef = searchParams.get("tx_ref");
  const status = searchParams.get("status");

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

  if (status !== "successful" || !transactionId) {
    return NextResponse.redirect(`${baseUrl}/payment/callback?status=failed`);
  }

  try {
    const verification = await verifyFlutterwavePayment(transactionId);

    if (
      verification.status !== "success" ||
      verification.data?.status !== "successful"
    ) {
      return NextResponse.redirect(`${baseUrl}/payment/callback?status=failed`);
    }

    // Find the payment by providerRef (tx_ref)
    const payment = await prisma.payment.findFirst({
      where: { providerRef: txRef ?? undefined },
      include: { user: true, order: true },
    });

    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "PAID",
          transactionId,
          paidAt: new Date(),
        },
      });

      if (payment.orderId) {
        await prisma.order.update({
          where: { id: payment.orderId },
          data: { status: "CONFIRMED" },
        });
      }

      sendPaymentConfirmation(
        payment.user.phone,
        payment.amount,
        payment.method
      ).catch(console.error);
    }

    return NextResponse.redirect(
      `${baseUrl}/payment/callback?status=success&ref=${txRef}`
    );
  } catch (error) {
    console.error("Flutterwave callback error:", error);
    return NextResponse.redirect(`${baseUrl}/payment/callback?status=error`);
  }
}
