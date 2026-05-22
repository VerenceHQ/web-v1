"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminRoot() {
  const router = useRouter();

  useEffect(() => {
    // Check if admin is logged in
    const session = localStorage.getItem("verence_admin_session");
    if (session) {
      router.replace("/admin/dashboard");
    } else {
      router.replace("/admin/login");
    }
  }, [router]);

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#00120b",
      color: "#e6f6f0",
      fontFamily: "var(--font-montserrat), sans-serif",
    }}>
      <div style={{ textAlign: "center" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1rem", letterSpacing: "0.05em", color: "#009c65" }}>VERENCE CONTROL PANEL</h2>
        <p style={{ color: "rgba(230, 246, 240, 0.7)", fontSize: "0.9rem" }}>Initializing security handshake...</p>
      </div>
    </div>
  );
}
