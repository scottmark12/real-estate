"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import type { CircleMarker, Map as LeafletMap } from "leaflet";
import { NEIGHBORHOODS, PRICE_TIERS, REGIONS, type Region } from "@/lib/neighborhoods";

const BLUE = "#3262a6";
const GRAY = "#a3a3a3";

function escape(text: string) {
  return text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

export default function NeighborhoodMap() {
  const el = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markers = useRef<Record<string, CircleMarker>>({});
  const [region, setRegion] = useState<Region | "All">("All");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = await import("leaflet");
      if (cancelled || !el.current || mapRef.current) return;
      const map = L.map(el.current, { scrollWheelZoom: false, zoomControl: true });
      mapRef.current = map;
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 16,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        className: "ms-map-tiles",
      }).addTo(map);

      for (const n of NEIGHBORHOODS) {
        const m = L.circleMarker([n.lat, n.lng], {
          radius: 8,
          color: "#ffffff",
          weight: 2,
          fillColor: BLUE,
          fillOpacity: 1,
        })
          .bindTooltip(escape(n.name), { direction: "top", offset: [0, -8] })
          .bindPopup(
            `<div class="ms-pop"><p class="ms-pop-region">${escape(n.region)}</p>` +
              `<p class="ms-pop-name">${escape(n.name)}</p>` +
              `<p class="ms-pop-tag">${escape(n.tagline)}</p>` +
              `<p class="ms-pop-price">${escape(PRICE_TIERS[n.priceTier])}</p>` +
              `<a class="ms-pop-link" href="/neighborhoods/${n.slug}">See ${escape(n.name)}</a></div>`,
            { maxWidth: 260 }
          )
          .addTo(map);
        markers.current[n.slug] = m;
      }
      map.fitBounds(
        L.latLngBounds(NEIGHBORHOODS.map((n) => [n.lat, n.lng] as [number, number])),
        { padding: [30, 30] }
      );
    })();
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markers.current = {};
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const shown = NEIGHBORHOODS.filter((n) => region === "All" || n.region === region);
    for (const n of NEIGHBORHOODS) {
      const m = markers.current[n.slug];
      if (!m) continue;
      const on = region === "All" || n.region === region;
      m.setStyle({ fillColor: on ? BLUE : GRAY, fillOpacity: on ? 1 : 0.5, radius: on ? 8 : 5 });
      if (on) m.bringToFront();
    }
    map.closePopup();
    map.fitBounds(
      shown.map((n) => [n.lat, n.lng] as [number, number]),
      { padding: [40, 40], maxZoom: 13 }
    );
  }, [region]);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {(["All", ...REGIONS] as const).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRegion(r)}
            className={`border px-3 py-1.5 text-xs font-semibold tracking-wide transition-colors ${
              region === r ? "border-blue bg-blue text-cream" : "border-navy/20 text-navy hover:border-navy"
            }`}
          >
            {r === "All" ? "All of San Diego" : r}
          </button>
        ))}
      </div>
      <div
        ref={el}
        className="relative z-0 mt-4 h-[520px] w-full border border-sand bg-cream-deep max-[600px]:h-[420px]"
        aria-label="Map of San Diego neighborhoods"
      />
      <style>{`
        .ms-map-tiles { filter: grayscale(1) contrast(0.95) brightness(1.04); }
        .leaflet-container { font: inherit; }
        .leaflet-popup-content-wrapper { border-radius: 0; box-shadow: 0 8px 24px rgba(0,0,0,.12); }
        .leaflet-popup-content { margin: 14px 16px; }
        .ms-pop p { margin: 0; }
        .ms-pop-region { font-size: 10px; letter-spacing: .14em; text-transform: uppercase; font-weight: 600; color: ${BLUE}; }
        .ms-pop-name { margin-top: 4px !important; font-family: Georgia, serif; font-size: 20px; color: #141414; }
        .ms-pop-tag { margin-top: 6px !important; font-size: 13px; line-height: 1.45; color: #3a3a3a; }
        .ms-pop-price { margin-top: 6px !important; font-size: 12px; color: #6b6b6b; }
        .ms-pop-link { display: inline-block; margin-top: 10px; font-size: 11px; letter-spacing: .12em; text-transform: uppercase; font-weight: 600; color: ${BLUE} !important; text-decoration: underline; }
      `}</style>
    </div>
  );
}
