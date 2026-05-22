"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EditorRoot() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const session = localStorage.getItem("verence_editor_session");
    if (session) {
      router.replace("/editor/dashboard");
    } else {
      router.replace("/editor/login");
    }
  }, [router]);

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#001c12",
      color: "#e6f6f0",
      fontFamily: "var(--font-montserrat), sans-serif",
    }}>
      <div style={{ textAlign: "center" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1rem", letterSpacing: "0.05em" }}>VERENCE EDITORIAL</h2>
        <p style={{ color: "rgba(230, 246, 240, 0.7)", fontSize: "0.9rem" }}>Loading workspace environment...</p>
      </div>
    </div>
  );
}
