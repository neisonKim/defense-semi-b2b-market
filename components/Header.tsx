"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const navItems = [
  ["/", "Marketplace"],
  ["/#process", "Process"],
  ["/products", "Products"],
  ["/suppliers", "Suppliers"],
  ["/knowledge", "Knowledge"],
  ["/rfq", "RFQ"],
  ["/my-desk", "My Desk"],
  ["/admin", "Admin CMS"],
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <>
      <header className={`siteHeader ${open ? "menuOpen" : ""}`}>
        <div className="container headerInner">
          <Link className="brand" href="/" onClick={close}>
            <span className="brandMark">DS</span>
            <span>
              <strong>DEFENSE SEMI B2B MARKET</strong>
              <small>Semiconductor intelligence + sourcing</small>
            </span>
          </Link>

          <nav className="desktopNav" aria-label="주요 메뉴">
            {navItems.map(([href, label]) => (
              <Link key={href} href={href}>{label}</Link>
            ))}
          </nav>

          <div className="headerActions">
            <div className="headerCta">
              <Link className="btn primary" href="/rfq">RFQ 요청</Link>
            </div>

            <button
              className={`navToggle ${open ? "isOpen" : ""}`}
              type="button"
              aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
              aria-expanded={open}
              aria-controls="responsive-navigation"
              onClick={() => setOpen((value) => !value)}
            >
              <span className="navToggleLine" />
              <span className="navToggleLine" />
              <span className="navToggleLine" />
            </button>
          </div>
        </div>
      </header>

      <div
        className={`tabletNavOverlay ${open ? "open" : ""}`}
        onClick={close}
        aria-hidden={!open}
      >
        <nav
          id="responsive-navigation"
          className="tabletNavPanel"
          aria-label="반응형 메뉴"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="tabletNavHeading">
            <span>Navigation</span>
            <strong>메뉴</strong>
          </div>

          {navItems.map(([href, label]) => (
            <Link key={href} href={href} onClick={close}>{label}</Link>
          ))}

          <Link className="btn primary full" href="/rfq" onClick={close}>RFQ 요청</Link>
        </nav>
      </div>
    </>
  );
}
