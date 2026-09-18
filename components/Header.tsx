"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const navItems = [
  { href: "/", label: "Marketplace" },
  { href: "/#process", label: "Process", anchor: true },
  { href: "/products", label: "Products" },
  { href: "/suppliers", label: "Suppliers" },
  { href: "/knowledge", label: "Knowledge" },
  { href: "/rfq", label: "RFQ" },
  { href: "/my-desk", label: "My Desk" },
] as const;

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  const isActive = (
    href: string,
    anchor?: boolean,
  ) => {
    if (anchor) return false;
    if (href === "/") return pathname === "/";

    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  };

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow =
      document.body.style.overflow;

    const handleKeyDown = (
      event: KeyboardEvent,
    ) => {
      if (event.key === "Escape") {
        close();
      }
    };

    document.body.style.overflow =
      "hidden";

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [open]);

  return (
    <>
      <header
        className={`siteHeader ${
          open ? "menuOpen" : ""
        }`}
      >
        <div className="container headerInner">
          <Link
            className="brand"
            href="/"
            onClick={close}
            aria-label="DEFENSE SEMI B2B MARKET 홈"
          >
            <span className="brandMark">
              DS
            </span>

            <span className="brandText">
              <strong>
                DEFENSE SEMI B2B MARKET
              </strong>

              <small>
                Semiconductor Intelligence + Sourcing
              </small>
            </span>
          </Link>

          <div className="headerRight">
            <nav
              className="desktopNav"
              aria-label="주요 메뉴"
            >
              {navItems.map(
                ({
                  href,
                  label,
                  anchor,
                }) => {
                  const active =
                    isActive(
                      href,
                      anchor,
                    );

                  return (
                    <Link
                      key={href}
                      href={href}
                      className={
                        active
                          ? "active"
                          : undefined
                      }
                      aria-current={
                        active
                          ? "page"
                          : undefined
                      }
                    >
                      {label}
                    </Link>
                  );
                },
              )}
            </nav>

            <div className="headerActions">
              <Link
                className="headerCta"
                href="/rfq"
              >
                RFQ 요청
              </Link>

              <button
                className={`navToggle ${
                  open ? "active" : ""
                }`}
                type="button"
                aria-label={
                  open
                    ? "메뉴 닫기"
                    : "메뉴 열기"
                }
                aria-expanded={open}
                aria-controls="responsive-navigation"
                onClick={() =>
                  setOpen(
                    (value) => !value,
                  )
                }
              >
                <span />
                <span />
                <span />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div
        className={`tabletNavOverlay ${
          open ? "open" : ""
        }`}
        onClick={close}
        aria-hidden={!open}
      >
        <nav
          id="responsive-navigation"
          className="tabletNavPanel"
          aria-label="반응형 메뉴"
          onClick={(event) =>
            event.stopPropagation()
          }
        >
          <div className="tabletNavHead">
            <div>
              <small>
                DEFENSE SEMI
              </small>

              <strong>
                Sourcing Navigation
              </strong>
            </div>

            <button
              className="navClose"
              type="button"
              onClick={close}
              aria-label="메뉴 닫기"
            >
              ×
            </button>
          </div>

          <div className="tabletNavIntro">
            <span>
              TECHNOLOGY DISCOVERY + SOURCING
            </span>

            <p>
              Knowledge에서 제품·공급사를 탐색하고 RFQ까지 연결합니다.
            </p>
          </div>

          <div className="tabletNavLinks">
            {navItems.map(
              ({
                href,
                label,
                anchor,
              }) => {
                const active =
                  isActive(
                    href,
                    anchor,
                  );

                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={close}
                    className={
                      active
                        ? "active"
                        : undefined
                    }
                    aria-current={
                      active
                        ? "page"
                        : undefined
                    }
                  >
                    <span>
                      {label}
                    </span>

                    <b>
                      →
                    </b>
                  </Link>
                );
              },
            )}
          </div>

          <div className="tabletNavUtility">
            <Link
              href="/admin"
              onClick={close}
            >
              Admin CMS
            </Link>

            <Link
              className="btn primary tabletRfqButton"
              href="/rfq"
              onClick={close}
            >
              RFQ 요청
            </Link>
          </div>
        </nav>
      </div>
    </>
  );
}

export default Header;
