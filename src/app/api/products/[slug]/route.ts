import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth/jwt";
import { ADDON_PRODUCTS } from "@/data/addons";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const db = getDb();

    let product: any = db.prepare(`
      SELECT
        p.id, p.name, p.slug, p.description, p.images, p.price, p.discount_price,
        p.stock, p.sku, p.featured, p.active, p.rating, p.reviews_count,
        p.delivery_info, p.offers, p.includes, p.badge, p.created_at, p.updated_at,
        c.name as category_name, c.slug as category_slug,
        ft.name as flower_type_name, ft.slug as flower_type_slug,
        o.name as occasion_name, o.slug as occasion_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN flower_types ft ON p.flower_type_id = ft.id
      LEFT JOIN occasions o ON p.occasion_id = o.id
      WHERE p.slug = ? OR p.id = ?
    `).get(slug, slug);

    if (!product && typeof slug === "string" && slug.startsWith("addon-")) {
      const stripped = slug.replace(/^addon-/, "");
      product = db.prepare(`
        SELECT
          p.id, p.name, p.slug, p.description, p.images, p.price, p.discount_price,
          p.stock, p.sku, p.featured, p.active, p.rating, p.reviews_count,
          p.delivery_info, p.offers, p.includes, p.badge, p.created_at, p.updated_at,
          c.name as category_name, c.slug as category_slug,
          ft.name as flower_type_name, ft.slug as flower_type_slug,
          o.name as occasion_name, o.slug as occasion_slug
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN flower_types ft ON p.flower_type_id = ft.id
        LEFT JOIN occasions o ON p.occasion_id = o.id
        WHERE p.slug = ? OR p.id = ?
      `).get(stripped, stripped);
    }

    if (!product) {
      const addon = ADDON_PRODUCTS.find(
        (a) => a.id === slug || a.href.endsWith(`/${slug}`) || a.name.toLowerCase() === slug.toLowerCase()
      );
      if (addon) {
        product = {
          id: addon.id,
          name: addon.name,
          slug: addon.id,
          description: addon.name,
          images: JSON.stringify([addon.image]),
          price: addon.price,
          discount_price: null,
          stock: 100,
          sku: `SKU-${addon.id.toUpperCase()}`,
          featured: 0,
          active: 1,
          rating: 5.0,
          reviews_count: 24,
          delivery_info: "Same-day delivery available across Kerala",
          offers: "[]",
          includes: "[]",
          badge: null,
          category_name: addon.category,
          category_slug: addon.category.toLowerCase(),
          flower_type_name: null,
          flower_type_slug: null,
          occasion_name: null,
          occasion_slug: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }
    }

    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    let parsedImages = [];
    try {
      parsedImages = JSON.parse(product.images);
    } catch {
      parsedImages = [product.images];
    }

    let parsedOffers = [];
    try {
      parsedOffers = JSON.parse(product.offers || "[]");
    } catch {
      parsedOffers = [];
    }

    let parsedIncludes = [];
    try {
      parsedIncludes = JSON.parse(product.includes || "[]");
    } catch {
      parsedIncludes = [];
    }

    return NextResponse.json({
      success: true,
      product: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price,
        originalPrice: product.discount_price,
        image:
          parsedImages.find((img: string) => img && !img.includes("/side-view/")) ||
          parsedImages[0] ||
          "/images/lily-6-stems.png",
        images: parsedImages,
        stock: product.stock,
        sku: product.sku,
        category: product.category_slug || "flower",
        categoryLabel: product.category_name || "Flowers",
        flowerType: product.flower_type_slug,
        flowerTypeLabel: product.flower_type_name,
        occasion: product.occasion_slug,
        occasionLabel: product.occasion_name,
        featured: !!product.featured,
        active: !!product.active,
        rating: product.rating,
        reviewsCount: product.reviews_count,
        deliveryInfo: product.delivery_info,
        offers: parsedOffers,
        includes: parsedIncludes,
        badge: product.badge,
        createdAt: product.created_at,
      },
    });
  } catch (error: any) {
    console.error("Product get error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch product" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const auth = getAuthenticatedUser(request);
    if (!auth || auth.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { slug } = await params;
    const body = await request.json();
    const db = getDb();
    const now = new Date().toISOString();

    const product = db.prepare("SELECT id FROM products WHERE slug = ? OR id = ?").get(slug, slug);
    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    const updates: string[] = ["updated_at = ?"];
    const values: any[] = [now];

    if (body.name !== undefined) { updates.push("name = ?"); values.push(body.name); }
    if (body.description !== undefined) { updates.push("description = ?"); values.push(body.description); }
    if (body.price !== undefined) { updates.push("price = ?"); values.push(Number(body.price)); }
    if (body.originalPrice !== undefined) { updates.push("discount_price = ?"); values.push(body.originalPrice ? Number(body.originalPrice) : null); }
    if (body.stock !== undefined) { updates.push("stock = ?"); values.push(Number(body.stock)); }
    if (body.active !== undefined) { updates.push("active = ?"); values.push(body.active ? 1 : 0); }
    if (body.featured !== undefined) { updates.push("featured = ?"); values.push(body.featured ? 1 : 0); }
    if (body.images !== undefined) { updates.push("images = ?"); values.push(JSON.stringify(body.images)); }
    if (body.badge !== undefined) { updates.push("badge = ?"); values.push(body.badge); }

    values.push(product.id);

    db.prepare(`UPDATE products SET ${updates.join(", ")} WHERE id = ?`).run(...values);

    return NextResponse.json({ success: true, message: "Product updated successfully" });
  } catch (error: any) {
    console.error("Product update error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const auth = getAuthenticatedUser(request);
    if (!auth || auth.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { slug } = await params;
    const db = getDb();

    db.prepare("DELETE FROM products WHERE slug = ? OR id = ?").run(slug, slug);

    return NextResponse.json({ success: true, message: "Product deleted successfully" });
  } catch (error: any) {
    console.error("Product delete error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to delete product" }, { status: 500 });
  }
}
