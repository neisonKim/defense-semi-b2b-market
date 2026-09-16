"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useEffect,
  useState,
  type CSSProperties,
} from "react";

const NAV_ITEMS = [
  { label: "Marketplace", href: "/" },
  { label: "Process", href: "/#process" },
  { label: "Products", href: "/products" },
  { label: "Suppliers", href: "/suppliers" },
  { label: "Knowledge", href: "/knowledge" },
  { label: "RFQ", href: "/rfq" },
  { label: "My Desk", href: "/my-desk" },
  { label: "Admin CMS", href: "/admin" },
];

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  /* 페이지 이동 시 메뉴 닫기 */
  useEffect(() => {
    closeMenu();
  }, [pathname]);

  /* 메뉴가 열리면 body 스크롤 잠금 */
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  /* ESC 키로 메뉴 닫기 */
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <>
      <header className={`siteHeader ${menuOpen ? "menuOpen" : ""}`}>
        <div className="container headerInner">
          {/* BRAND */}
          <Link href="/" className="brand">
            <span className="brandMark">DS</span>

            <span className="brandText">
              <strong>DEFENSE SEMI B2B MARKET</strong>
              <small>Semiconductor Intelligence + Sourcing</small>
            </span>
          </Link>

          {/* RIGHT AREA */}
          <div className="headerRight">
            {/* DESKTOP NAV */}
            <nav className="desktopNav" aria-label="Main navigation">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* RFQ CTA */}
            <Link
              href="/rfq"
              className="headerCta"
            >
              RFQ 요청
            </Link>

            {/* TABLET / MOBILE MENU BUTTON */}
            <button
              type="button"
              className={`navToggle ${menuOpen ? "active" : ""}`}
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label={menuOpen ? "메뉴 닫기" : "메뉴 열기"}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      {/* TABLET / MOBILE MENU */}
      <div
        className={`tabletNavOverlay ${menuOpen ? "open" : ""}`}
        onClick={closeMenu}
        aria-hidden={!menuOpen}
      >
        <aside
          id="mobile-navigation"
          className="tabletNavPanel"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="tabletNavHead">
            <div>
              <strong>DEFENSE SEMI</strong>
              <small>B2B MARKET</small>
            </div>

            <button
              type="button"
              className="navClose"
              onClick={closeMenu}
              aria-label="메뉴 닫기"
            >
              ×
            </button>
          </div>

          <nav
            className="tabletNavLinks"
            aria-label="Mobile navigation"
          >
            {NAV_ITEMS.map((item, index) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={closeMenu}
                style={
                  {
                    "--nav-index": index,
                  } as CSSProperties
                }
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <Link
            href="/rfq"
            className="btn primary tabletRfqButton"
            onClick={closeMenu}
          >
            RFQ 요청하기
          </Link>
        </aside>
      </div>
    </>
  );
}