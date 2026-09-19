"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const TARGET_SELECTOR = "main section, main [data-scroll-reveal]";

export function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const targets = Array.from(
      document.querySelectorAll<HTMLElement>(TARGET_SELECTOR)
    );

    if (reducedMotion) {
      targets.forEach((target) => {
        target.classList.add("scrollRevealTarget", "isVisible");
      });
      return;
    }

    targets.forEach((target) => {
      target.classList.add("scrollRevealTarget");

      const rect = target.getBoundingClientRect();

      if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) {
        target.classList.add("isVisible");
      } else {
        target.classList.remove("isVisible");
      }
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const target = entry.target as HTMLElement;

          if (entry.isIntersecting) {
            target.classList.add("isVisible");
          } else {
            target.classList.remove("isVisible");
          }
        });
      },
      {
        root: null,
        threshold: 0.12,
        rootMargin: "0px 0px -7% 0px",
      }
    );

    targets.forEach((target) => observer.observe(target));

    return () => {
      observer.disconnect();

      targets.forEach((target) => {
        target.classList.remove("scrollRevealTarget", "isVisible");
      });
    };
  }, [pathname]);

  return null;
}

export default ScrollReveal;
