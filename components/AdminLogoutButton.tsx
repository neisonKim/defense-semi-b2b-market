"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminLogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    if (loading) {
      return;
    }

    setLoading(true);

    try {
      await fetch("/api/admin/logout", {
        method: "POST",
      });
    } finally {
      router.replace("/admin/login");
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      aria-label="관리자 로그아웃"
      style={{
        position: "fixed",
        right: "20px",
        top: "92px",
        zIndex: 70,
        minHeight: "38px",
        padding: "0 13px",
        border: "1px solid #d7e1ec",
        borderRadius: "9px",
        background: "rgba(255,255,255,0.96)",
        boxShadow:
          "0 8px 24px rgba(15,44,78,0.10)",
        color: "#355472",
        fontSize: "12px",
        fontWeight: 800,
        cursor: loading ? "wait" : "pointer",
        opacity: loading ? 0.65 : 1,
      }}
    >
      {loading ? "로그아웃 중..." : "Admin Logout"}
    </button>
  );
}

export default AdminLogoutButton;
