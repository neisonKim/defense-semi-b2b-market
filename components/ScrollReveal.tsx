"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const TARGET_SELECTOR = "main section, main [data-scroll-reveal]";

export function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const observed = new Set<HTMLElement>();

    const revealIfInView = (target: HTMLElement) => {
      const rect = target.getBoundingClientRect();

      const inView =
        rect.bottom > 0 &&
        rect.top < window.innerHeight * 0.96;

      if (inView) {
        target.classList.add("isVisible");
      }
    };

    if (reducedMotion) {
      const showAll = () => {
        document
          .querySelectorAll<HTMLElement>(TARGET_SELECTOR)
          .forEach((target) => {
            target.classList.add(
              "scrollRevealTarget",
              "isVisible",
            );
          });
      };

      showAll();

      const mutationObserver = new MutationObserver(showAll);
      mutationObserver.observe(document.body, {
        childList: true,
        subtree: true,
      });

      return () => mutationObserver.disconnect();
    }

    /*
     * threshold: 0 이 중요합니다.
     *
     * Product / Supplier / Knowledge처럼 세로 길이가 긴 section은
     * 모바일 화면에서 section 전체 면적의 12%가 동시에 viewport에
     * 들어오지 못할 수 있습니다.
     *
     * 기존 threshold: 0.12에서는 이런 긴 section이 영원히
     * isVisible을 받지 못해 내용은 존재하지만 opacity: 0 상태로
     * 남을 수 있었습니다.
     */
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
        threshold: 0,
        rootMargin: "0px 0px -4% 0px",
      },
    );

    const registerTargets = () => {
      document
        .querySelectorAll<HTMLElement>(TARGET_SELECTOR)
        .forEach((target) => {
          if (observed.has(target)) {
            revealIfInView(target);
            return;
          }

          observed.add(target);
          target.classList.add("scrollRevealTarget");

          revealIfInView(target);
          observer.observe(target);
        });
    };

    registerTargets();

    /*
     * usePublicData() 등 Client Component가 hydration 후 내용을
     * 갱신하거나 새로운 section을 추가하는 경우도 다시 등록합니다.
     */
    const mutationObserver = new MutationObserver(() => {
      registerTargets();
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    const handleResize = () => {
      observed.forEach(revealIfInView);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener("resize", handleResize);

      observed.forEach((target) => {
        target.classList.remove(
          "scrollRevealTarget",
          "isVisible",
        );
      });
    };
  }, [pathname]);

  return null;
}

export default ScrollReveal;
