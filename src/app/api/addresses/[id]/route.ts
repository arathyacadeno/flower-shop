import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth/jwt";
import { neon } from "@neondatabase/serverless";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuthenticatedUser(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const db = getDb();

    const existing = db.prepare("SELECT * FROM addresses WHERE id = ? AND user_id = ?").get(id, auth.userId);
    if (!existing && !process.env.DATABASE_URL) {
      return NextResponse.json({ success: false, error: "Address not found" }, { status: 404 });
    }

    const now = new Date().toISOString();
    if (body.isDefault) {
      db.prepare("UPDATE addresses SET is_default = 0 WHERE user_id = ?").run(auth.userId);
    }

    db.prepare(`
      UPDATE addresses
      SET full_name = COALESCE(?, full_name),
          phone = COALESCE(?, phone),
          house = COALESCE(?, house),
          street = COALESCE(?, street),
          area = COALESCE(?, area),
          city = COALESCE(?, city),
          state = COALESCE(?, state),
          pin_code = COALESCE(?, pin_code),
          latitude = COALESCE(?, latitude),
          longitude = COALESCE(?, longitude),
          type = COALESCE(?, type),
          is_default = COALESCE(?, is_default),
          updated_at = ?
      WHERE id = ? AND user_id = ?
    `).run(
      body.fullName,
      body.phone,
      body.house,
      body.street,
      body.area,
      body.city,
      body.state,
      body.pinCode,
      body.latitude !== undefined ? Number(body.latitude) : null,
      body.longitude !== undefined ? Number(body.longitude) : null,
      body.type,
      body.isDefault !== undefined ? (body.isDefault ? 1 : 0) : null,
      now,
      id,
      auth.userId
    );

    // Also update in Neon PostgreSQL
    if (process.env.DATABASE_URL) {
      try {
        const sql = neon(process.env.DATABASE_URL);
        if (body.isDefault) {
          await sql`UPDATE addresses SET is_default = 0 WHERE user_id = ${auth.userId}`;
        }
        await sql`
          UPDATE addresses
          SET full_name = COALESCE(${body.fullName || null}, full_name),
              phone = COALESCE(${body.phone || null}, phone),
              house = COALESCE(${body.house || null}, house),
              street = COALESCE(${body.street || null}, street),
              area = COALESCE(${body.area || null}, area),
              city = COALESCE(${body.city || null}, city),
              state = COALESCE(${body.state || null}, state),
              pin_code = COALESCE(${body.pinCode || null}, pin_code),
              type = COALESCE(${body.type || null}, type),
              is_default = COALESCE(${body.isDefault !== undefined ? (body.isDefault ? 1 : 0) : null}, is_default),
              updated_at = ${now}
          WHERE id = ${id} AND user_id = ${auth.userId}
        `;
      } catch (neonErr) {
        console.warn("Neon address PUT error:", neonErr);
      }
    }

    return NextResponse.json({ success: true, message: "Address updated successfully" });
  } catch (error: any) {
    console.error("Address PUT error:", error);
    return NextResponse.json({ success: false, error: "Failed to update address" }, { status: 500 });
  }
}

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuthenticatedUser(_request);
    if (!auth) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
    }

    const { id } = await params;
    const db = getDb();

    db.prepare("UPDATE addresses SET is_default = 0 WHERE user_id = ?").run(auth.userId);
    db.prepare("UPDATE addresses SET is_default = 1 WHERE id = ? AND user_id = ?").run(id, auth.userId);

    if (process.env.DATABASE_URL) {
      try {
        const sql = neon(process.env.DATABASE_URL);
        await sql`UPDATE addresses SET is_default = 0 WHERE user_id = ${auth.userId}`;
        await sql`UPDATE addresses SET is_default = 1 WHERE id = ${id} AND user_id = ${auth.userId}`;
      } catch (neonErr) {
        console.warn("Neon address PATCH error:", neonErr);
      }
    }

    return NextResponse.json({ success: true, message: "Default address updated" });
  } catch (error: any) {
    console.error("Address default set error:", error);
    return NextResponse.json({ success: false, error: "Failed to set default address" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuthenticatedUser(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
    }

    const { id } = await params;
    const db = getDb();

    db.prepare("DELETE FROM addresses WHERE id = ? AND user_id = ?").run(id, auth.userId);

    if (process.env.DATABASE_URL) {
      try {
        const sql = neon(process.env.DATABASE_URL);
        await sql`DELETE FROM addresses WHERE id = ${id} AND user_id = ${auth.userId}`;
      } catch (neonErr) {
        console.warn("Neon address DELETE error:", neonErr);
      }
    }

    return NextResponse.json({ success: true, message: "Address deleted successfully" });
  } catch (error: any) {
    console.error("Address DELETE error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete address" }, { status: 500 });
  }
}
