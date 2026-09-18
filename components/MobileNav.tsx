"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type IconName =
  | "home"
  | "product"
  | "rfq"
  | "supplier"
  | "desk";

const items: {
  href: string;
  label: string;
  icon: IconName;
  primary?: boolean;
}[] = [
  {
    href: "/",
    label: "홈",
    icon: "home",
  },
  {
    href: "/products",
    label: "제품",
    icon: "product",
  },
  {
    href: "/rfq",
    label: "RFQ",
    icon: "rfq",
    primary: true,
  },
  {
    href: "/suppliers",
    label: "공급사",
    icon: "supplier",
  },
  {
    href: "/my-desk",
    label: "Desk",
    icon: "desk",
  },
];

function NavIcon({
  name,
}: {
  name: IconName;
}) {
  if (name === "home") {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M3.5 10.8 12 3.8l8.5 7v9.1H14v-5.7h-4v5.7H3.5z" />
      </svg>
    );
  }

  if (name === "product") {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="m12 3 8 4.2v9.6L12 21l-8-4.2V7.2z" />
        <path d="m4.3 7.4 7.7 4 7.7-4M12 11.4V21" />
      </svg>
    );
  }

  if (name === "rfq") {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M6 3.5h9l3 3v14H6z" />
        <path d="M15 3.5v4h3M9 11h6M9 15h6" />
      </svg>
    );
  }

  if (name === "supplier") {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M4 20V8l5-3v15M9 20V4l11 4v12" />
        <path d="M12 9h2M16 9h2M12 13h2M16 13h2M12 17h2M16 17h2" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M5 4h14v16H5z" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </svg>
  );
}

export function MobileNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return (
      pathname === href ||
      pathname.startsWith(
        `${href}/`,
      )
    );
  };

  return (
    <nav
      className="mobileNav"
      aria-label="모바일 주요 메뉴"
    >
      {items.map(
        ({
          href,
          label,
          icon,
          primary,
        }) => {
          const active =
            isActive(href);

          return (
            <Link
              key={href}
              href={href}
              className={[
                primary
                  ? "mobileNavPrimary"
                  : "",
                active
                  ? "active"
                  : "",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-current={
                active
                  ? "page"
                  : undefined
              }
            >
              <span className="mobileNavIcon">
                <NavIcon
                  name={icon}
                />
              </span>

              <span className="mobileNavLabel">
                {label}
              </span>
            </Link>
          );
        },
      )}
    </nav>
  );
}

export default MobileNav;
