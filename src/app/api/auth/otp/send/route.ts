import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { sendFast2SmsOtp } from "@/lib/sms/fast2sms";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phoneNumber } = body;

    if (!phoneNumber) {
      return NextResponse.json(
        { success: false, error: "Mobile number is required." },
        { status: 400 }
      );
    }

    const cleanPhone = phoneNumber.replace(/\D/g, "").slice(-10);

    if (cleanPhone.length !== 10) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid 10-digit mobile number." },
        { status: 400 }
      );
    }

    // Generate 6-digit random OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
    const now = new Date().toISOString();

    const db = getDb();

    db.exec(`
      CREATE TABLE IF NOT EXISTS phone_otps (
        phone TEXT PRIMARY KEY,
        otp TEXT NOT NULL,
        expires_at INTEGER NOT NULL,
        created_at TEXT NOT NULL
      );
    `);

    // Store in phone_otps table
    db.prepare(`
      INSERT OR REPLACE INTO phone_otps (phone, otp, expires_at, created_at)
      VALUES (?, ?, ?, ?)
    `).run(cleanPhone, otp, expiresAt, now);

    // Send SMS via Fast2SMS
    const smsResult = await sendFast2SmsOtp(cleanPhone, otp);

    if (!smsResult.success) {
      return NextResponse.json(
        { success: false, error: smsResult.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: smsResult.message,
      phoneNumber: `+91 ${cleanPhone}`,
    });
  } catch (error: any) {
    console.error("OTP send error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to send OTP. Please try again." },
      { status: 500 }
    );
  }
}
