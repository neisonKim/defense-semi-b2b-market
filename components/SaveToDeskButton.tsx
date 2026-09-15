"use client";

import { useEffect, useMemo, useState } from "react";

type SaveType = "product" | "supplier" | "knowledge";

const STORAGE_KEY: Record<SaveType, string> = {
  product: "defense-semi-favorite-products",
  supplier: "defense-semi-favorite-suppliers",
  knowledge: "defense-semi-saved-knowledge",
};

export function SaveToDeskButton({ type, slug, label }: { type: SaveType; slug: string; label?: string }) {
  const key = useMemo(() => STORAGE_KEY[type], [type]);
  const [saved, setSaved] = useState(false);

  const readSaved = () => {
    try {
      const parsed = JSON.parse(localStorage.getItem(key) || "[]");
      return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
    } catch {
      return [];
    }
  };

  useEffect(() => {
    setSaved(readSaved().includes(slug));
  }, [key, slug]);

  const toggle = () => {
    const values = readSaved();
    const next = values.includes(slug) ? values.filter((item) => item !== slug) : [slug, ...values];
    localStorage.setItem(key, JSON.stringify(next));
    setSaved(next.includes(slug));
  };

  const compact = Boolean(label && label.trim().length <= 2);

  return (
    <button type="button" className={`btn ${saved ? "savedDeskBtn" : ""}`} onClick={toggle}>
      {saved ? (compact ? "★" : "★ My Desk 저장됨") : label ?? "☆ My Desk 저장"}
    </button>
  );
}
