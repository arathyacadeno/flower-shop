"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OrderSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    const search = typeof window !== "undefined" ? window.location.search : "";
    router.replace(`/thank-you${search}`);
  }, [router]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "#666", fontSize: "1.1rem" }}>Redirecting to your order details...</p>
    </div>
  );
}
