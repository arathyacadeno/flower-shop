import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { signUserToken } from "@/lib/auth/jwt";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phoneNumber, otp } = body;

    if (!phoneNumber || !otp) {
      return NextResponse.json(
        { success: false, error: "Mobile number and OTP are required." },
        { status: 400 }
      );
    }

    const cleanPhone = phoneNumber.replace(/\D/g, "").slice(-10);
    const cleanOtp = otp.toString().trim();

    if (cleanPhone.length !== 10) {
      return NextResponse.json(
        { success: false, error: "Invalid mobile number format." },
        { status: 400 }
      );
    }

    const db = getDb();

    db.exec(`
      CREATE TABLE IF NOT EXISTS phone_otps (
        phone TEXT PRIMARY KEY,
        otp TEXT NOT NULL,
        expires_at INTEGER NOT NULL,
        created_at TEXT NOT NULL
      );
    `);

    // Check OTP record in database
    const otpRecord = db.prepare("SELECT * FROM phone_otps WHERE phone = ?").get(cleanPhone);

    if (!otpRecord) {
      return NextResponse.json(
        { success: false, error: "No active OTP request found. Please request a new OTP." },
        { status: 400 }
      );
    }

    // Check expiration
    if (Date.now() > otpRecord.expires_at) {
      db.prepare("DELETE FROM phone_otps WHERE phone = ?").run(cleanPhone);
      return NextResponse.json(
        { success: false, error: "OTP has expired. Please click 'Resend OTP'." },
        { status: 400 }
      );
    }

    // Verify OTP code
    if (otpRecord.otp !== cleanOtp) {
      return NextResponse.json(
        { success: false, error: "Incorrect verification code. Please check and try again." },
        { status: 400 }
      );
    }

    // OTP is valid - delete from active OTPs
    db.prepare("DELETE FROM phone_otps WHERE phone = ?").run(cleanPhone);

    const fullPhone = `+91${cleanPhone}`;
    const generatedEmail = `${cleanPhone}@phone.occasions.in`;
    const now = new Date().toISOString();

    // Check if user already exists
    let user = db.prepare(`
      SELECT * FROM users 
      WHERE phone = ? OR phone = ? OR phone = ? OR email = ?
    `).get(fullPhone, cleanPhone, `+91 ${cleanPhone}`, generatedEmail);

    if (user) {
      // Existing user: ensure updated timestamp
      db.prepare(`
        UPDATE users 
        SET phone = COALESCE(phone, ?),
            updated_at = ?
        WHERE id = ?
      `).run(fullPhone, now, user.id);

      user = db.prepare("SELECT * FROM users WHERE id = ?").get(user.id);
    } else {
      // Create new customer account
      const userId = "usr-p-" + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
      const displayName = `Customer (${cleanPhone})`;

      db.prepare(`
        INSERT INTO users (id, name, email, phone, role, created_at, updated_at)
        VALUES (?, ?, ?, ?, 'customer', ?, ?)
      `).run(userId, displayName, generatedEmail, fullPhone, now, now);

      user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
    }

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || fullPhone,
      role: user.role as "customer" | "admin",
      image: user.image || null,
    };

    const token = signUserToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role as "customer" | "admin",
    });

    const response = NextResponse.json({
      success: true,
      user: userData,
      token,
    });

    // Set secure HTTP-only cookie
    response.cookies.set("occasions_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("OTP verification error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to verify OTP. Please try again." },
      { status: 500 }
    );
  }
}
