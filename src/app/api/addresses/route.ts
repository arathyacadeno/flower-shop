import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth/jwt";
import { neon } from "@neondatabase/serverless";

export async function GET(request: Request) {
  try {
    const auth = getAuthenticatedUser(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
    }

    let addresses: any[] = [];
    const db = getDb();

    // 1. Try fetching from Neon Postgres if configured
    if (process.env.DATABASE_URL) {
      try {
        const sql = neon(process.env.DATABASE_URL);
        const neonRows = await sql`
          SELECT
            id, full_name, phone, house, street, area, city, state, pin_code,
            latitude, longitude, type, is_default, created_at, updated_at
          FROM addresses
          WHERE user_id = ${auth.userId}
          ORDER BY is_default DESC, updated_at DESC
        `;
        if (neonRows && neonRows.length > 0) {
          addresses = neonRows.map((r: any) => ({
            id: r.id,
            fullName: r.full_name,
            phone: r.phone,
            house: r.house,
            street: r.street,
            area: r.area,
            city: r.city,
            state: r.state,
            pinCode: r.pin_code,
            latitude: r.latitude ? Number(r.latitude) : null,
            longitude: r.longitude ? Number(r.longitude) : null,
            type: r.type || "Home",
            isDefault: !!r.is_default,
            createdAt: r.created_at,
          }));
        }
      } catch (err) {
        console.warn("Neon addresses GET fallback:", err);
      }
    }

    // 2. If no addresses from Neon, check SQLite
    if (addresses.length === 0) {
      const rows = db.prepare(`
        SELECT
          id, full_name, phone, house, street, area, city, state, pin_code,
          latitude, longitude, type, is_default, created_at, updated_at
        FROM addresses
        WHERE user_id = ?
        ORDER BY is_default DESC, updated_at DESC
      `).all(auth.userId);

      if (rows && rows.length > 0) {
        addresses = rows.map((r: any) => ({
          id: r.id,
          fullName: r.full_name,
          phone: r.phone,
          house: r.house,
          street: r.street,
          area: r.area,
          city: r.city,
          state: r.state,
          pinCode: r.pin_code,
          latitude: r.latitude,
          longitude: r.longitude,
          type: r.type || "Home",
          isDefault: !!r.is_default,
          createdAt: r.created_at,
        }));
      }
    }

    // 3. Fallback: If user has 0 saved addresses, check past orders for previously used delivery address
    if (addresses.length === 0) {
      let orderWithAddr: any = null;

      if (process.env.DATABASE_URL) {
        try {
          const sql = neon(process.env.DATABASE_URL);
          const oRows = await sql`
            SELECT delivery_address, customer_name, customer_phone, created_at
            FROM orders
            WHERE user_id = ${auth.userId} AND delivery_address IS NOT NULL
            ORDER BY created_at DESC LIMIT 1
          `;
          if (oRows && oRows.length > 0) orderWithAddr = oRows[0];
        } catch {}
      }

      if (!orderWithAddr) {
        try {
          orderWithAddr = db.prepare(`
            SELECT delivery_address, customer_name, customer_phone, created_at
            FROM orders
            WHERE user_id = ? AND delivery_address IS NOT NULL
            ORDER BY created_at DESC LIMIT 1
          `).get(auth.userId);
        } catch {}
      }

      if (orderWithAddr) {
        let addr: any = null;
        try {
          addr = typeof orderWithAddr.delivery_address === "string"
            ? JSON.parse(orderWithAddr.delivery_address)
            : orderWithAddr.delivery_address;
        } catch {}

        if (addr && (addr.houseBuilding || addr.house)) {
          const addrId = "addr-" + Math.random().toString(36).substring(2, 10);
          const fullName = (addr.receiverName || addr.senderName || orderWithAddr.customer_name || auth.name || "Customer").trim();
          const phone = (addr.receiverMobile || addr.senderMobile || orderWithAddr.customer_phone || "+91 8606464700").trim();
          const house = (addr.houseBuilding || addr.house || "").trim();
          const street = (addr.street || "").trim();
          const area = (addr.landmark || addr.area || "").trim();
          const city = (addr.city || "Kozhikode (Calicut)").trim();
          const state = (addr.state || "Kerala").trim();
          const pinCode = (addr.pinCode || addr.pin_code || "673602").trim();
          const now = new Date().toISOString();

          // Save to SQLite
          try {
            db.prepare(`
              INSERT INTO addresses (
                id, user_id, full_name, phone, house, street, area, city, state, pin_code,
                type, is_default, created_at, updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Home', 1, ?, ?)
            `).run(addrId, auth.userId, fullName, phone, house, street, area, city, state, pinCode, now, now);
          } catch {}

          // Save to Neon
          if (process.env.DATABASE_URL) {
            try {
              const sql = neon(process.env.DATABASE_URL);
              await sql`
                INSERT INTO addresses (
                  id, user_id, full_name, phone, house, street, area, city, state, pin_code,
                  type, is_default, created_at, updated_at
                ) VALUES (
                  ${addrId}, ${auth.userId}, ${fullName}, ${phone}, ${house}, ${street}, ${area}, ${city}, ${state}, ${pinCode},
                  'Home', 1, ${now}, ${now}
                )
              `;
            } catch {}
          }

          addresses = [{
            id: addrId,
            fullName,
            phone,
            house,
            street,
            area,
            city,
            state,
            pinCode,
            type: "Home",
            isDefault: true,
            createdAt: now,
          }];
        }
      }
    }

    return NextResponse.json({ success: true, addresses });
  } catch (error: any) {
    console.error("Addresses GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch addresses" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = getAuthenticatedUser(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
    }

    const body = await request.json();
    const {
      fullName,
      phone,
      house,
      street,
      area,
      city,
      state,
      pinCode,
      latitude,
      longitude,
      type = "Home",
      isDefault = false,
    } = body;

    if (!fullName || !phone || !house || !pinCode) {
      return NextResponse.json(
        { success: false, error: "Full name, phone, house/building, and PIN code are required" },
        { status: 400 }
      );
    }

    const db = getDb();
    const now = new Date().toISOString();
    const addressId = "addr-" + Math.random().toString(36).substring(2, 10);

    // If setting default or if it's the user's first address, make it default
    const existingCount = db.prepare("SELECT count(*) as count FROM addresses WHERE user_id = ?").get(auth.userId)?.count || 0;
    const shouldBeDefault = isDefault || existingCount === 0;

    if (shouldBeDefault) {
      db.prepare("UPDATE addresses SET is_default = 0 WHERE user_id = ?").run(auth.userId);
    }

    db.prepare(`
      INSERT INTO addresses (
        id, user_id, full_name, phone, house, street, area, city, state, pin_code,
        latitude, longitude, type, is_default, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      addressId,
      auth.userId,
      fullName.trim(),
      phone.trim(),
      house.trim(),
      (street || "").trim(),
      (area || "").trim(),
      (city || "Kozhikode").trim(),
      (state || "Kerala").trim(),
      pinCode.trim(),
      latitude ? Number(latitude) : null,
      longitude ? Number(longitude) : null,
      type || "Home",
      shouldBeDefault ? 1 : 0,
      now,
      now
    );

    // Also persist into Neon Postgres
    if (process.env.DATABASE_URL) {
      try {
        const sql = neon(process.env.DATABASE_URL);
        if (shouldBeDefault) {
          await sql`UPDATE addresses SET is_default = 0 WHERE user_id = ${auth.userId}`;
        }
        await sql`
          INSERT INTO addresses (
            id, user_id, full_name, phone, house, street, area, city, state, pin_code,
            latitude, longitude, type, is_default, created_at, updated_at
          ) VALUES (
            ${addressId}, ${auth.userId}, ${fullName.trim()}, ${phone.trim()}, ${house.trim()},
            ${(street || "").trim()}, ${(area || "").trim()}, ${(city || "Kozhikode").trim()},
            ${(state || "Kerala").trim()}, ${pinCode.trim()},
            ${latitude ? Number(latitude) : null}, ${longitude ? Number(longitude) : null},
            ${type || "Home"}, ${shouldBeDefault ? 1 : 0}, ${now}, ${now}
          )
        `;
      } catch (neonErr) {
        console.warn("Neon address POST error:", neonErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Address saved successfully",
      addressId,
      address: {
        id: addressId,
        fullName: fullName.trim(),
        phone: phone.trim(),
        house: house.trim(),
        street: (street || "").trim(),
        area: (area || "").trim(),
        city: (city || "Kozhikode").trim(),
        state: (state || "Kerala").trim(),
        pinCode: pinCode.trim(),
        type: type || "Home",
        isDefault: shouldBeDefault,
      },
    });
  } catch (error: any) {
    console.error("Address POST error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to save address" }, { status: 500 });
  }
}
