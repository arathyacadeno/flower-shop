import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { CATALOG_PRODUCTS } from '../src/data/catalog';

dotenv.config({ path: '.env.local' });

async function migrate() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set in .env.local');
  }

  console.log('Connecting to Neon PostgreSQL...');
  const sql = neon(databaseUrl);

  console.log('Creating tables in Neon...');

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      password_hash TEXT,
      google_id TEXT,
      image TEXT,
      role TEXT DEFAULT 'customer',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      image TEXT
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS flower_types (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS occasions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      images TEXT NOT NULL,
      price NUMERIC NOT NULL,
      discount_price NUMERIC,
      stock INT DEFAULT 50,
      sku TEXT,
      category_id TEXT,
      flower_type_id TEXT,
      occasion_id TEXT,
      featured INT DEFAULT 0,
      active INT DEFAULT 1,
      rating NUMERIC DEFAULT 4.8,
      reviews_count INT DEFAULT 12,
      delivery_info TEXT,
      offers TEXT,
      includes TEXT,
      badge TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS cart_items (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      quantity INT NOT NULL DEFAULT 1,
      variant_id TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS wishlist_items (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, product_id)
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS addresses (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      full_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      house TEXT NOT NULL,
      street TEXT NOT NULL,
      area TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      pin_code TEXT NOT NULL,
      latitude NUMERIC,
      longitude NUMERIC,
      type TEXT DEFAULT 'Home',
      is_default INT DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS coupons (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      discount_type TEXT NOT NULL,
      discount_value NUMERIC NOT NULL,
      min_order_value NUMERIC DEFAULT 0,
      max_discount NUMERIC,
      expiry_date TEXT,
      usage_limit INT DEFAULT 1000,
      times_used INT DEFAULT 0,
      active INT DEFAULT 1
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      subtotal NUMERIC NOT NULL,
      delivery_charge NUMERIC NOT NULL,
      discount NUMERIC DEFAULT 0,
      final_amount NUMERIC NOT NULL,
      coupon_code TEXT,
      delivery_address TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      payment_status TEXT NOT NULL,
      order_status TEXT NOT NULL,
      tracking_timeline TEXT NOT NULL,
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id TEXT NOT NULL,
      product_name TEXT NOT NULL,
      product_price NUMERIC NOT NULL,
      quantity INT NOT NULL,
      product_image TEXT,
      subtotal NUMERIC NOT NULL
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS delivery_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `;

  console.log('✅ Tables created successfully!');

  // Seed Admin
  console.log('Seeding admin user...');
  const adminPasswordHash = bcrypt.hashSync("admin123", 10);
  await sql`
    INSERT INTO users (id, name, email, phone, password_hash, role)
    VALUES ('admin-user-01', 'Occasions Admin', 'admin@occasions.com', '+91 8606464700', ${adminPasswordHash}, 'admin')
    ON CONFLICT (email) DO NOTHING;
  `;

  // Seed Categories
  console.log('Seeding categories...');
  const categories = [
    { id: "cat-flower-bouquet", name: "Flower Bouquet", slug: "flower-bouquet", description: "Fresh hand-tied flower bouquets for every celebration", image: "/images/lily-6-stems.png" },
    { id: "cat-flower-basket", name: "Flower Basket", slug: "flower-basket", description: "Artisanal woven baskets overflowing with seasonal blooms", image: "/images/flower-basket-pink-lilies.jpg" },
    { id: "cat-cakes", name: "Cakes", slug: "cakes", description: "Delicious gourmet celebration cakes and desserts", image: "/images/cake-chocolate.jpg" },
    { id: "cat-table-decor", name: "Table Decor", slug: "table-decor", description: "Stunning floral centerpieces and table arrangements", image: "/images/table-arrangement.jpg" },
    { id: "cat-wreath", name: "Wreath", slug: "wreath", description: "Handcrafted memorial and celebration floral wreaths", image: "/images/wreath-white-lilies.jpg" },
  ];
  for (const c of categories) {
    await sql`
      INSERT INTO categories (id, name, slug, description, image)
      VALUES (${c.id}, ${c.name}, ${c.slug}, ${c.description}, ${c.image})
      ON CONFLICT (id) DO NOTHING;
    `;
  }

  // Seed Flower Types
  console.log('Seeding flower types...');
  const flowerTypes = [
    { id: "ft-roses", name: "Roses", slug: "roses" },
    { id: "ft-lilies", name: "Lilies", slug: "lilies" },
    { id: "ft-orchids", name: "Orchids", slug: "orchids" },
    { id: "ft-sunflowers", name: "Sunflowers", slug: "sunflowers" },
    { id: "ft-mixed-flowers", name: "Mixed Flowers", slug: "mixed-flowers" },
  ];
  for (const ft of flowerTypes) {
    await sql`
      INSERT INTO flower_types (id, name, slug)
      VALUES (${ft.id}, ${ft.name}, ${ft.slug})
      ON CONFLICT (id) DO NOTHING;
    `;
  }

  // Seed Occasions
  console.log('Seeding occasions...');
  const occasions = [
    { id: "occ-birthday", name: "Birthday", slug: "birthday" },
    { id: "occ-anniversary", name: "Anniversary", slug: "anniversary" },
    { id: "occ-wedding", name: "Wedding", slug: "wedding" },
    { id: "occ-valentines", name: "Valentine's Day", slug: "valentines-day" },
    { id: "occ-housewarming", name: "Housewarming", slug: "housewarming" },
    { id: "occ-just-because", name: "Just Because", slug: "just-because" },
  ];
  for (const o of occasions) {
    await sql`
      INSERT INTO occasions (id, name, slug)
      VALUES (${o.id}, ${o.name}, ${o.slug})
      ON CONFLICT (id) DO NOTHING;
    `;
  }

  // Seed Coupons
  console.log('Seeding coupons...');
  const coupons = [
    { id: "cpn-occ10", code: "OCCASIONS10", type: "percentage", value: 10, minOrder: 500, maxDiscount: 200 },
    { id: "cpn-flower50", code: "FLOWER50", type: "fixed", value: 50, minOrder: 400, maxDiscount: 50 },
    { id: "cpn-welcome100", code: "WELCOME100", type: "fixed", value: 100, minOrder: 999, maxDiscount: 100 },
    { id: "cpn-love15", code: "LOVE15", type: "percentage", value: 15, minOrder: 1200, maxDiscount: 300 },
  ];
  for (const cp of coupons) {
    await sql`
      INSERT INTO coupons (id, code, discount_type, discount_value, min_order_value, max_discount, active)
      VALUES (${cp.id}, ${cp.code}, ${cp.type}, ${cp.value}, ${cp.minOrder}, ${cp.maxDiscount}, 1)
      ON CONFLICT (id) DO NOTHING;
    `;
  }

  // Seed Products from CATALOG_PRODUCTS
  console.log(`Seeding ${CATALOG_PRODUCTS.length} products...`);
  for (const p of CATALOG_PRODUCTS) {
    let categoryId = "cat-flower-bouquet";
    if (p.category === "cakes") categoryId = "cat-cakes";
    else if (p.slug.includes("basket")) categoryId = "cat-flower-basket";
    else if (p.slug.includes("table")) categoryId = "cat-table-decor";
    else if (p.slug.includes("wreath")) categoryId = "cat-wreath";

    let flowerTypeId = "ft-mixed-flowers";
    const lower = (p.name + " " + p.slug).toLowerCase();
    if (lower.includes("rose")) flowerTypeId = "ft-roses";
    else if (lower.includes("lily") || lower.includes("lilies")) flowerTypeId = "ft-lilies";
    else if (lower.includes("orchid")) flowerTypeId = "ft-orchids";
    else if (lower.includes("sunflower")) flowerTypeId = "ft-sunflowers";

    let occasionId = "occ-birthday";
    if (lower.includes("anniversary")) occasionId = "occ-anniversary";
    else if (lower.includes("wedding")) occasionId = "occ-wedding";
    else if (lower.includes("valentine") || lower.includes("love")) occasionId = "occ-valentines";
    else if (lower.includes("housewarming")) occasionId = "occ-housewarming";

    const allImages = Array.isArray(p.images) && p.images.length > 0 ? p.images : [p.image];

    await sql`
      INSERT INTO products (
        id, name, slug, description, images, price, discount_price, stock, sku,
        category_id, flower_type_id, occasion_id, featured, active, rating,
        reviews_count, delivery_info, offers, includes, badge
      ) VALUES (
        ${p.id},
        ${p.name},
        ${p.slug},
        ${p.description || ""},
        ${JSON.stringify(allImages)},
        ${p.price},
        ${p.originalPrice || null},
        45,
        ${`SKU-${p.id.toUpperCase()}`},
        ${categoryId},
        ${flowerTypeId},
        ${occasionId},
        ${p.badge ? 1 : 0},
        1,
        ${p.rating || 4.8},
        ${p.reviewsCount || 10},
        ${p.deliveryInfo || "Express same-day Calicut delivery available"},
        ${JSON.stringify(p.offers || [])},
        ${JSON.stringify(p.includes || [])},
        ${p.badge || null}
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        price = EXCLUDED.price,
        images = EXCLUDED.images,
        badge = EXCLUDED.badge;
    `;
  }

  // Seed Demo Orders
  console.log('Seeding demo orders...');
  const demoOrders = [
    {
      id: "OCC-100123",
      userId: "admin-user-01",
      customerName: "Arathy T P",
      customerEmail: "arathy@occasions.in",
      customerPhone: "+91 8606464700",
      subtotal: 1398,
      deliveryCharge: 0,
      discount: 139.8,
      finalAmount: 1258.2,
      couponCode: "OCCASIONS10",
      deliveryAddress: JSON.stringify({
        fullName: "Arathy T P",
        phone: "+91 8606464700",
        house: "Rose Villa, 4B",
        street: "Mavoor Road",
        area: "Arayidathupalam",
        city: "Kozhikode",
        state: "Kerala",
        pinCode: "673004",
      }),
      paymentMethod: JSON.stringify({ type: "UPI", id: "upi_demo_101" }),
      paymentStatus: "paid",
      orderStatus: "out_for_delivery",
      trackingTimeline: JSON.stringify([
        { title: "Order Placed", description: "Your order was successfully placed", time: "Today, 09:30 AM", status: "completed" },
        { title: "Confirmed & Prepared", description: "Florist has handpicked fresh flowers", time: "Today, 10:15 AM", status: "completed" },
        { title: "Quality Check", description: "Bouquet passed freshness inspection", time: "Today, 11:00 AM", status: "completed" },
        { title: "Out for Delivery", description: "Rider is heading to your address in Kozhikode", time: "Today, 11:45 AM", status: "active" },
        { title: "Delivered", description: "Handed over to recipient", time: "Est. 12:45 PM", status: "pending" },
      ]),
      items: [
        { id: "item-1", productId: "bouquet-pink-elegance", productName: "Pink Elegance Rose Bouquet", productPrice: 699, quantity: 2, productImage: "/images/flower-bouquet/pink-elegance.jpg", subtotal: 1398 },
      ],
    },
  ];

  for (const o of demoOrders) {
    await sql`
      INSERT INTO orders (
        id, user_id, customer_name, customer_email, customer_phone, subtotal,
        delivery_charge, discount, final_amount, coupon_code, delivery_address,
        payment_method, payment_status, order_status, tracking_timeline
      ) VALUES (
        ${o.id}, ${o.userId}, ${o.customerName}, ${o.customerEmail}, ${o.customerPhone},
        ${o.subtotal}, ${o.deliveryCharge}, ${o.discount}, ${o.finalAmount}, ${o.couponCode},
        ${o.deliveryAddress}, ${o.paymentMethod}, ${o.paymentStatus}, ${o.orderStatus}, ${o.trackingTimeline}
      )
      ON CONFLICT (id) DO NOTHING;
    `;

    for (const it of o.items) {
      await sql`
        INSERT INTO order_items (id, order_id, product_id, product_name, product_price, quantity, product_image, subtotal)
        VALUES (${it.id}, ${o.id}, ${it.productId}, ${it.productName}, ${it.productPrice}, ${it.quantity}, ${it.productImage}, ${it.subtotal})
        ON CONFLICT (id) DO NOTHING;
      `;
    }
  }

  console.log('✅ Migration & seeding to Neon completed successfully!');
}

migrate().catch(console.error);
