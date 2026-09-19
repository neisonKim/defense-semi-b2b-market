"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "defense-semi-initial-loader-seen";

export function InitialLoader() {
  const [visible, setVisible] = useState(true);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const alreadySeen =
      sessionStorage.getItem(STORAGE_KEY) === "1";

    if (alreadySeen || reducedMotion) {
      sessionStorage.setItem(STORAGE_KEY, "1");
      setVisible(false);
      return;
    }

    sessionStorage.setItem(STORAGE_KEY, "1");

    const fadeTimer = window.setTimeout(() => {
      setClosing(true);
    }, 850);

    const removeTimer = window.setTimeout(() => {
      setVisible(false);
    }, 1150);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(removeTimer);
    };
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <div
      className={`initialLoader ${
        closing ? "isClosing" : ""
      }`}
      role="status"
      aria-live="polite"
      aria-label="DEFENSE SEMI B2B MARKET 로딩 중"
    >
      <div className="initialLoaderInner">
        <div
          className="initialLoaderMark"
          aria-hidden="true"
        >
          DS
        </div>

        <div className="initialLoaderBrand">
          <strong>DEFENSE SEMI</strong>
          <span>B2B MARKET</span>
        </div>

        <p>
          SEMICONDUCTOR INTELLIGENCE + SOURCING
        </p>

        <div
          className="initialLoaderProgress"
          aria-hidden="true"
        >
          <span />
        </div>
      </div>
    </div>
  );
}

export default InitialLoader;
