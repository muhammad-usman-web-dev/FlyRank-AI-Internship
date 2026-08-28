"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PRODUCT_COLORS, type ProductColor } from "@/lib/product";

const ProductScene = dynamic(() => import("./ProductScene"), {
  ssr: false,
  loading: () => <div className="scene-loading">Loading 3D preview…</div>,
});

export default function ProductConfigurator() {
  const [color, setColor] = useState<ProductColor>(PRODUCT_COLORS[0].value);
  const [autoRotate, setAutoRotate] = useState(true);
  const [metalness, setMetalness] = useState(0.58);
  const [roughness, setRoughness] = useState(0.28);
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lowPower = "deviceMemory" in navigator && Number((navigator as Navigator & { deviceMemory?: number }).deviceMemory) <= 2;
    if (reducedMotion || lowPower) {
      setAutoRotate(false);
    }
    if (reducedMotion) {
      setUseFallback(true);
    }
  }, []);

  const selectedName = useMemo(
    () => PRODUCT_COLORS.find((item) => item.value === color)?.name ?? "Graphite",
    [color]
  );

  return (
    <main className="page-shell">
      <header className="topbar">
        <Link href="/" className="brand" aria-label="Orbit One home">
          <span className="brand-title">ORBIT ONE</span>
          <span className="brand-subtitle">3D PRODUCT CONFIGURATOR</span>
        </Link>
        <div className="topbar-note">Interactive product study · 01</div>
      </header>

      <section className="intro">
        <div>
          <p className="eyebrow">3D PRODUCT CONFIGURATOR</p>
          <h1>One object.<br />Made yours.</h1>
        </div>
        <p className="intro-copy">
          Explore Orbit One from every angle. Change its finish and surface response in real time.
        </p>
      </section>

      <section className="viewer-layout">
        <div className="scene-card" aria-label="Interactive 3D product viewer">
          {useFallback ? (
            <div className="fallback-card">
              <div className="fallback-object" style={{ background: color }} />
              <button className="secondary-button" onClick={() => setUseFallback(false)}>
                Enable 3D
              </button>
            </div>
          ) : (
            <ProductScene
              color={color}
              autoRotate={autoRotate}
              metalness={metalness}
              roughness={roughness}
            />
          )}
          <div className="scene-hint">
            <span>Drag to rotate</span>
            <span>Scroll / pinch to zoom</span>
          </div>
        </div>

        <aside className="controls" aria-label="Product controls">
          <div className="control-header">
            <div>
              <p className="eyebrow">CONFIGURE</p>
              <h2>Orbit One</h2>
            </div>
            <span className="live-pill">LIVE</span>
          </div>

          <div className="control-group">
            <div className="label-row">
              <label>Finish</label>
              <span>{selectedName}</span>
            </div>
            <div className="swatches">
              {PRODUCT_COLORS.map((item) => (
                <button
                  key={item.value}
                  className={`swatch ${color === item.value ? "selected" : ""}`}
                  style={{ backgroundColor: item.value }}
                  aria-label={`Choose ${item.name}`}
                  aria-pressed={color === item.value}
                  onClick={() => setColor(item.value)}
                />
              ))}
            </div>
          </div>

          <div className="control-group">
            <p className="eyebrow" style={{ marginBottom: "12px" }}>Surface</p>
            <div style={{ marginBottom: "12px" }}>
              <div className="label-row">
                <label htmlFor="metalness">Metalness</label>
                <span>{metalness.toFixed(2)}</span>
              </div>
              <input
                id="metalness"
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={metalness}
                onChange={(event) => setMetalness(Number(event.target.value))}
              />
            </div>
            <div>
              <div className="label-row">
                <label htmlFor="roughness">Roughness</label>
                <span>{roughness.toFixed(2)}</span>
              </div>
              <input
                id="roughness"
                type="range"
                min="0.08"
                max="0.9"
                step="0.01"
                value={roughness}
                onChange={(event) => setRoughness(Number(event.target.value))}
              />
            </div>
          </div>

          <div className="control-group" style={{ borderBottom: "none", marginBottom: 0 }}>
            <p className="eyebrow" style={{ marginBottom: "12px" }}>Motion</p>
            <div className="toggle-row">
              <strong>Auto rotate</strong>
              <button
                className={`toggle ${autoRotate ? "on" : ""}`}
                onClick={() => setAutoRotate((value) => !value)}
                aria-pressed={autoRotate}
                aria-label="Toggle auto rotate"
              >
                <span />
              </button>
            </div>
            <button className="fallback-link" onClick={() => setUseFallback((value) => !value)}>
              {useFallback ? "Return to 3D view" : "View static fallback"}
            </button>
          </div>

          <div className="specs">
            <div>
              <span>Interaction</span>
              <strong>Touch + mouse</strong>
            </div>
            <div>
              <span>Geometry</span>
              <strong>Procedural</strong>
            </div>
            <div>
              <span>Motion</span>
              <strong>Reduced-motion aware</strong>
            </div>
          </div>
        </aside>
      </section>

      <footer className="footer">
        <span>Built with Next.js + React Three Fiber</span>
        <a href="/health">System health →</a>
      </footer>
    </main>
  );
}
