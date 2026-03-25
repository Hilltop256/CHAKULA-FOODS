import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  initiateMTNPayment,
  initiateAirtelPayment,
  initiateFlutterwavePayment,
} from "@/lib/payments";
import { sendPaymentConfirmation } from "@/lib/sms";
import { PaymentStatus, PaymentMethod } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { orderId, subscriptionId, amount, method, phone } = body;

    if (!amount || !method) {
      return NextResponse.json(
        { error: "Amount and method are required" },
        { status: 400 }
      );
    }

    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        orderId: orderId ?? null,
        subscriptionId: subscriptionId ?? null,
        amount: parseFloat(amount),
        method: method as PaymentMethod,
        status: "PENDING" as PaymentStatus,
        phoneNumber: phone ?? null,
      },
    });

    let providerResult;

    if (method === "MTN_MOMO") {
      providerResult = await initiateMTNPayment({
        amount: parseFloat(amount),
        phone,
        orderId: orderId ?? subscriptionId ?? payment.id,
        description: `Chakula Foods Order - ${orderId ?? subscriptionId}`,
      });
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          providerRef: providerResult.referenceId,
          status: "PROCESSING" as PaymentStatus,
        },
      });
    } else if (method === "AIRTEL_MONEY") {
      providerResult = await initiateAirtelPayment({
        amount: parseFloat(amount),
        phone,
        orderId: orderId ?? subscriptionId ?? payment.id,
        description: `Chakula Foods Order - ${orderId ?? subscriptionId}`,
      });
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          providerRef: providerResult.transactionId,
          status: "PROCESSING" as PaymentStatus,
        },
      });
    } else if (method === "VISA_MASTERCARD") {
      const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
      providerResult = await initiateFlutterwavePayment({
        amount: parseFloat(amount),
        email: user.email,
        phone: phone ?? user.phone,
        name: user.name,
        orderId: orderId ?? subscriptionId ?? payment.id,
        description: "Chakula Foods Order",
        redirectUrl: `${baseUrl}/payment/callback`,
      });
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          providerRef: providerResult.txRef,
          status: "PROCESSING" as PaymentStatus,
        },
      });
      return NextResponse.json({
        payment,
        paymentLink: providerResult.paymentLink,
      });
    } else {
      // CASH — mark as paid immediately
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "PAID" as PaymentStatus, paidAt: new Date() },
      });
      if (orderId) {
        await prisma.order.update({
          where: { id: orderId },
          data: { status: "CONFIRMED" },
        });
      }
    }

    return NextResponse.json({ payment, providerResult });
  } catch (error) {
    console.error("Payment error:", error);
    return NextResponse.json(
      { error: "Payment initiation failed" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { paymentId, status, transactionId } = body;

    if (!paymentId || !status) {
      return NextResponse.json(
        { error: "paymentId and status required" },
        { status: 400 }
      );
    }

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { user: true, order: true },
    });

    if (!payment) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: status as PaymentStatus,
        transactionId: transactionId ?? undefined,
        paidAt: status === "PAID" ? new Date() : undefined,
      },
    });

    if (status === "PAID") {
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Payment update error:", error);
    return NextResponse.json(
      { error: "Payment update failed" },
      { status: 500 }
    );
  }
}
