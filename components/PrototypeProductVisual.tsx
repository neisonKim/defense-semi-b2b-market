"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type ProductVisualSource = {
  slug?: string;
  name?: string;
  category?: string;
  material?: string;
  process?: string;
  equipment?: string;
};

type KnowledgeVisualSource = {
  slug?: string;
  title?: string;
  category?: string;
  relatedProcess?: string;
};

type SupplierVisualSource = {
  slug?: string;
  name?: string;
  meta?: string;
  processes?: string[];
};

type VisualAsset = {
  src: string;
  alt: string;
  fit: "contain" | "cover";
  tone: "light" | "dark";
};

const ASSETS = {
  focusRing: { src: "/images/ai/focus-ring.webp", alt: "SiC Focus Ring semiconductor chamber component", fit: "contain", tone: "light" },
  tim: { src: "/images/ai/tim-material.webp", alt: "Thermal and electronic material samples", fit: "contain", tone: "light" },
  tester: { src: "/images/ai/thermal-tester.webp", alt: "Semiconductor thermal transient test equipment", fit: "contain", tone: "light" },
  cfd: { src: "/images/ai/cfd-thermal-simulation.webp", alt: "Electronics CFD thermal airflow simulation", fit: "cover", tone: "dark" },
  etch: { src: "/images/ai/plasma-etch.webp", alt: "Semiconductor plasma etching chamber", fit: "cover", tone: "dark" },
  packaging: { src: "/images/ai/advanced-packaging.webp", alt: "Advanced semiconductor 3D package stack", fit: "cover", tone: "dark" },
  thermal: { src: "/images/ai/thermal-management.webp", alt: "Electronics heat sink thermal management", fit: "cover", tone: "dark" },
  wafer: { src: "/images/ai/wafer-inspection.webp", alt: "Semiconductor wafer inspection equipment", fit: "cover", tone: "dark" },
} satisfies Record<string, VisualAsset>;

type AssetKey = keyof typeof ASSETS;

const PRODUCT_ASSET_BY_SLUG: Record<string, AssetKey> = {
  "cvd-sic-focus-ring": "focusRing",
  "plasma-etch-equipment": "etch",
  "high-purity-process-material": "tim",
  "lithography-system": "wafer",
  "tim-material": "tim",
  "underfill-material": "packaging",
  "thermal-transient-tester": "tester",
  "cfd-thermal-simulation": "cfd",
};

const KNOWLEDGE_ASSET_BY_SLUG: Record<string, AssetKey> = {
  "what-is-cfd": "cfd",
  "cfd-convergence-checklist": "thermal",
  "thermal-transient-testing": "tester",
  "hbm-thermal-management": "packaging",
  "plasma-etch-focus-ring": "etch",
  "semiconductor-sourcing-data": "wafer",
};

const PROCESS_ASSET_BY_NAME: Record<string, AssetKey> = {
  lithography: "wafer",
  etching: "etch",
  deposition: "wafer",
  cleaning: "wafer",
  cmp: "wafer",
  "advanced packaging": "packaging",
  "thermal management": "thermal",
  reliability: "tester",
};

const SUPPLIER_ASSET_BY_SLUG: Record<string, AssetKey> = {
  tck: "focusRing",
  tel: "etch",
  entegris: "tim",
  asml: "wafer",
  "delta-es": "cfd",
  "thermal-demo": "thermal",
  "packaging-demo": "packaging",
  "test-semiconductor": "etch",
};

const PRODUCT_GALLERY_BY_SLUG: Record<string, AssetKey[]> = {
  "cvd-sic-focus-ring": ["focusRing", "etch", "wafer", "tester"],
  "plasma-etch-equipment": ["etch", "focusRing", "wafer", "tester"],
  "high-purity-process-material": ["tim", "wafer", "etch", "packaging"],
  "lithography-system": ["wafer", "packaging", "etch", "tim"],
  "tim-material": ["tim", "thermal", "packaging", "cfd"],
  "underfill-material": ["packaging", "tim", "thermal", "wafer"],
  "thermal-transient-tester": ["tester", "thermal", "cfd", "wafer"],
  "cfd-thermal-simulation": ["cfd", "thermal", "tester", "packaging"],
};

function assetClass(asset: VisualAsset) {
  return `fit-${asset.fit} tone-${asset.tone}`;
}

function normalize(value?: string) {
  return (value ?? "").trim().toLowerCase();
}

function sourceText(source: ProductVisualSource) {
  return [source.slug, source.name, source.category, source.material, source.process, source.equipment]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function getFallbackProductAsset(source: ProductVisualSource): VisualAsset {
  const text = sourceText(source);

  if (text.includes("focus ring") || text.includes("cvd-sic") || text.includes("sic")) return ASSETS.focusRing;
  if (text.includes("thermal interface") || text.includes("tim") || text.includes("underfill")) return ASSETS.tim;
  if (text.includes("transient") || text.includes("tester") || text.includes("reliability")) return ASSETS.tester;
  if (text.includes("cfd") || text.includes("simulation") || text.includes("software")) return ASSETS.cfd;
  if (text.includes("etch") || text.includes("plasma")) return ASSETS.etch;
  if (text.includes("packaging") || text.includes("hbm") || text.includes("3d")) return ASSETS.packaging;
  if (text.includes("thermal") || text.includes("cooling") || text.includes("heat")) return ASSETS.thermal;
  if (text.includes("lithography") || text.includes("wafer")) return ASSETS.wafer;
  if (text.includes("material") || text.includes("chemical")) return ASSETS.tim;

  return ASSETS.wafer;
}

export function getPrimaryProductAsset(source: ProductVisualSource): VisualAsset {
  const explicitKey = source.slug ? PRODUCT_ASSET_BY_SLUG[normalize(source.slug)] : undefined;
  return explicitKey ? ASSETS[explicitKey] : getFallbackProductAsset(source);
}

function uniqueAssets(items: VisualAsset[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.src)) return false;
    seen.add(item.src);
    return true;
  });
}

function getProductGalleryAssets(source: ProductVisualSource): VisualAsset[] {
  const explicitKeys = source.slug ? PRODUCT_GALLERY_BY_SLUG[normalize(source.slug)] : undefined;
  if (explicitKeys?.length) return explicitKeys.map((key) => ASSETS[key]);

  const primary = getPrimaryProductAsset(source);
  const text = sourceText(source);
  let related: VisualAsset[] = [ASSETS.wafer, ASSETS.packaging, ASSETS.thermal, ASSETS.cfd];

  if (text.includes("focus ring") || text.includes("sic") || text.includes("etch")) {
    related = [ASSETS.etch, ASSETS.wafer, ASSETS.focusRing, ASSETS.tester];
  } else if (text.includes("tim") || text.includes("underfill") || text.includes("thermal interface")) {
    related = [ASSETS.thermal, ASSETS.packaging, ASSETS.cfd, ASSETS.tim];
  } else if (text.includes("transient") || text.includes("tester") || text.includes("reliability")) {
    related = [ASSETS.thermal, ASSETS.cfd, ASSETS.wafer, ASSETS.tester];
  } else if (text.includes("cfd") || text.includes("simulation") || text.includes("software")) {
    related = [ASSETS.thermal, ASSETS.tester, ASSETS.packaging, ASSETS.cfd];
  } else if (text.includes("packaging") || text.includes("hbm") || text.includes("3d")) {
    related = [ASSETS.packaging, ASSETS.tim, ASSETS.thermal, ASSETS.wafer];
  }

  return uniqueAssets([primary, ...related]).slice(0, 4);
}

function getKnowledgeAsset(source: KnowledgeVisualSource): VisualAsset {
  const explicitKey = source.slug ? KNOWLEDGE_ASSET_BY_SLUG[normalize(source.slug)] : undefined;
  if (explicitKey) return ASSETS[explicitKey];

  const text = [source.slug, source.title, source.category, source.relatedProcess]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (text.includes("cfd") || text.includes("simulation")) return ASSETS.cfd;
  if (text.includes("convergence")) return ASSETS.thermal;
  if (text.includes("transient") || text.includes("reliability") || text.includes("junction")) return ASSETS.tester;
  if (text.includes("hbm") || text.includes("2.5d") || text.includes("3d") || text.includes("packaging")) return ASSETS.packaging;
  if (text.includes("focus ring") || text.includes("etch") || text.includes("plasma")) return ASSETS.etch;
  if (text.includes("thermal") || text.includes("cooling")) return ASSETS.thermal;
  if (text.includes("rfq") || text.includes("sourcing")) return ASSETS.wafer;

  return ASSETS.wafer;
}

function getProcessAsset(process: string): VisualAsset {
  const key = normalize(process);
  const explicitKey = PROCESS_ASSET_BY_NAME[key];
  if (explicitKey) return ASSETS[explicitKey];

  if (key.includes("etch")) return ASSETS.etch;
  if (key.includes("packaging")) return ASSETS.packaging;
  if (key.includes("thermal")) return ASSETS.thermal;
  if (key.includes("reliability")) return ASSETS.tester;
  return ASSETS.wafer;
}

function getSupplierAsset(supplier: SupplierVisualSource, product?: ProductVisualSource): VisualAsset {
  const explicitKey = supplier.slug ? SUPPLIER_ASSET_BY_SLUG[normalize(supplier.slug)] : undefined;
  if (explicitKey) return ASSETS[explicitKey];

  if (product) return getPrimaryProductAsset(product);

  const text = [supplier.name, supplier.meta, ...(supplier.processes ?? [])].filter(Boolean).join(" ").toLowerCase();
  if (text.includes("etch") || text.includes("plasma")) return ASSETS.etch;
  if (text.includes("thermal") || text.includes("cooling")) return ASSETS.thermal;
  if (text.includes("reliability")) return ASSETS.tester;
  if (text.includes("packaging")) return ASSETS.packaging;
  if (text.includes("material")) return ASSETS.tim;
  if (text.includes("cfd") || text.includes("cae")) return ASSETS.cfd;
  if (text.includes("lithography")) return ASSETS.wafer;
  return ASSETS.wafer;
}

export function PrototypeProductThumb({ source, label }: { source: ProductVisualSource; label?: string }) {
  const asset = useMemo(() => getPrimaryProductAsset(source), [source]);
  return (
    <div className={`productVisualCompact actualProductThumb ${assetClass(asset)}`}>
      <img src={asset.src} alt={asset.alt} loading="lazy" />
      {label ? <span>{label}</span> : null}
    </div>
  );
}

export function PrototypeProductGallery({ source }: { source: ProductVisualSource }) {
  const assets = useMemo(() => getProductGalleryAssets(source), [source]);
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => setActiveIndex(0), [source.slug, source.name]);

  const active = assets[activeIndex] ?? assets[0];
  const hasMultipleImages = assets.length > 1;

  const showPrevious = () => {
    if (!hasMultipleImages) return;
    setActiveIndex((current) => (current - 1 + assets.length) % assets.length);
  };

  const showNext = () => {
    if (!hasMultipleImages) return;
    setActiveIndex((current) => (current + 1) % assets.length);
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return;

    const touchEndX = event.changedTouches[0]?.clientX ?? touchStartX.current;
    const distance = touchStartX.current - touchEndX;

    touchStartX.current = null;

    if (Math.abs(distance) < 45) return;

    if (distance > 0) {
      showNext();
    } else {
      showPrevious();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      showPrevious();
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      showNext();
    }
  };

  return (
    <div className="prototypeProductGallery actualProductGallery">
      <div className="prototypeThumbCol" aria-label="제품 비주얼 선택">
        {assets.map((asset, index) => (
          <button
            key={asset.src}
            type="button"
            className={`prototypeThumb actualImageThumb ${assetClass(asset)} ${activeIndex === index ? "active" : ""}`}
            onClick={() => setActiveIndex(index)}
            aria-label={`제품 이미지 ${index + 1}`}
            aria-pressed={activeIndex === index}
          >
            <img src={asset.src} alt="" loading="lazy" />
          </button>
        ))}
      </div>

      <div
        className={`prototypeMainVisual actualMainVisual ${assetClass(active)}`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="region"
        aria-label="제품 이미지 슬라이드"
      >
        <div
          className="prototypeSliderTrack"
          style={{ transform: `translate3d(-${activeIndex * 100}%, 0, 0)` }}
        >
          {assets.map((asset, index) => (
            <div
              key={asset.src}
              className={`prototypeSlide ${assetClass(asset)}`}
              aria-hidden={activeIndex !== index}
            >
              <img
                src={asset.src}
                alt={activeIndex === index ? asset.alt : ""}
                loading={index === 0 ? "eager" : "lazy"}
                draggable={false}
              />
            </div>
          ))}
        </div>

        {hasMultipleImages ? (
          <>
            <button
              type="button"
              className="prototypeGalleryArrow prototypeGalleryPrev"
              onClick={showPrevious}
              aria-label="이전 제품 이미지"
            >
              ‹
            </button>

            <button
              type="button"
              className="prototypeGalleryArrow prototypeGalleryNext"
              onClick={showNext}
              aria-label="다음 제품 이미지"
            >
              ›
            </button>
          </>
        ) : null}

        <small aria-live="polite">
          {activeIndex + 1}/{assets.length}
        </small>
      </div>
    </div>
  );
}

export function ProcessVisual({ process }: { process: string }) {
  const asset = useMemo(() => getProcessAsset(process), [process]);
  return (
    <div className={`processPhoto ${assetClass(asset)}`}>
      <img src={asset.src} alt={`${process} semiconductor process`} loading="lazy" />
    </div>
  );
}

export function KnowledgeVisual({ article, className = "" }: { article: KnowledgeVisualSource; className?: string }) {
  const asset = useMemo(() => getKnowledgeAsset(article), [article]);
  return (
    <div className={`knowledgePhoto ${assetClass(asset)} ${className}`.trim()}>
      <img src={asset.src} alt={asset.alt} loading="lazy" />
      {article.relatedProcess ? <span>{article.relatedProcess}</span> : null}
    </div>
  );
}

export function SupplierVisual({ source, supplier }: { source?: ProductVisualSource; supplier?: SupplierVisualSource }) {
  const asset = supplier ? getSupplierAsset(supplier, source) : source ? getPrimaryProductAsset(source) : ASSETS.wafer;
  return (
    <div className={`supplierVisual supplierActualVisual ${assetClass(asset)}`}>
      <img src={asset.src} alt={asset.alt} loading="lazy" />
    </div>
  );
}

export function SupplierDirectoryVisual({ supplier, source }: { supplier: SupplierVisualSource; source?: ProductVisualSource }) {
  const asset = useMemo(() => getSupplierAsset(supplier, source), [supplier, source]);
  return (
    <div className={`supplierDirectoryVisual ${assetClass(asset)}`}>
      <img src={asset.src} alt={`${supplier.name ?? "Supplier"} capability visual`} loading="lazy" />
      <span>{supplier.processes?.[0] ?? "Semiconductor"}</span>
    </div>
  );
}
