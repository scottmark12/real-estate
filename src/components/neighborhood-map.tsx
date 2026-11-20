"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef, useState } from "react";
import type { Map as MLMap, Marker, StyleSpecification } from "maplibre-gl";
import { NEIGHBORHOODS, PRICE_TIERS, REGIONS, type Region } from "@/lib/neighborhoods";

// Florida Coastal map colors: warm light land, soft blue water, dark pins,
// with yellow interstates.
const LAND = "#f2efea";
const WATER = "#8ab9d8";
const RIVER = "#a9cbe2";
const PARK = "#e4e7d9";
const ROAD = "#ffffff";
const ROAD_CASING = "#ddd8cf";
const INTERSTATE = "#f4c430";
const INTERSTATE_CASING = "#d6a51c";
const LABEL = "#5e6b6d";
const PIN = "#152a2e";
const PIN_OFF = "#9aa3a5";
const BLUE = "#3262a6";

const STYLE: StyleSpecification = {
  version: 8,
  glyphs: "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf",
  sources: {
    omt: { type: "vector", url: "https://tiles.openfreemap.org/planet" },
  },
  layers: [
    { id: "land", type: "background", paint: { "background-color": LAND } },
    {
      id: "park",
      type: "fill",
      source: "omt",
      "source-layer": "park",
      paint: { "fill-color": PARK, "fill-opacity": 0.7 },
    },
    {
      id: "water",
      type: "fill",
      source: "omt",
      "source-layer": "water",
      paint: { "fill-color": WATER },
    },
    {
      id: "waterway",
      type: "line",
      source: "omt",
      "source-layer": "waterway",
      paint: { "line-color": RIVER, "line-width": 1 },
    },
    {
      id: "roads-minor",
      type: "line",
      source: "omt",
      "source-layer": "transportation",
      minzoom: 12,
      filter: ["in", ["get", "class"], ["literal", ["minor", "service", "tertiary"]]],
      paint: {
        "line-color": ROAD,
        "line-width": ["interpolate", ["linear"], ["zoom"], 12, 0.5, 16, 4],
      },
    },
    {
      id: "roads-major-casing",
      type: "line",
      source: "omt",
      "source-layer": "transportation",
      minzoom: 9,
      filter: ["in", ["get", "class"], ["literal", ["trunk", "primary", "secondary"]]],
      layout: { "line-cap": "round", "line-join": "round" },
      paint: {
        "line-color": ROAD_CASING,
        "line-width": ["interpolate", ["linear"], ["zoom"], 9, 1.2, 16, 9],
      },
    },
    {
      id: "roads-major",
      type: "line",
      source: "omt",
      "source-layer": "transportation",
      minzoom: 9,
      filter: ["in", ["get", "class"], ["literal", ["trunk", "primary", "secondary"]]],
      layout: { "line-cap": "round", "line-join": "round" },
      paint: {
        "line-color": ROAD,
        "line-width": ["interpolate", ["linear"], ["zoom"], 9, 0.6, 16, 7],
      },
    },
    {
      id: "interstate-casing",
      type: "line",
      source: "omt",
      "source-layer": "transportation",
      filter: ["==", ["get", "class"], "motorway"],
      layout: { "line-cap": "round", "line-join": "round" },
      paint: {
        "line-color": INTERSTATE_CASING,
        "line-width": ["interpolate", ["linear"], ["zoom"], 7, 1.2, 10, 2.6, 16, 12],
      },
    },
    {
      id: "interstate",
      type: "line",
      source: "omt",
      "source-layer": "transportation",
      filter: ["==", ["get", "class"], "motorway"],
      layout: { "line-cap": "round", "line-join": "round" },
      paint: {
        "line-color": INTERSTATE,
        "line-width": ["interpolate", ["linear"], ["zoom"], 7, 0.7, 10, 1.8, 16, 9],
      },
    },
    {
      id: "interstate-labels",
      type: "symbol",
      source: "omt",
      "source-layer": "transportation_name",
      minzoom: 9,
      filter: ["==", ["get", "class"], "motorway"],
      layout: {
        "symbol-placement": "line",
        "symbol-spacing": 400,
        "text-field": ["get", "ref"],
        "text-font": ["Noto Sans Bold"],
        "text-size": 10,
        "text-rotation-alignment": "viewport",
      },
      paint: {
        "text-color": "#6a5410",
        "text-halo-color": "#fff6d6",
        "text-halo-width": 2,
      },
    },
    {
      id: "place-labels",
      type: "symbol",
      source: "omt",
      "source-layer": "place",
      filter: ["in", ["get", "class"], ["literal", ["city", "town", "suburb", "neighbourhood"]]],
      layout: {
        "text-field": ["coalesce", ["get", "name:en"], ["get", "name"]],
        "text-font": ["Noto Sans Regular"],
        "text-size": ["interpolate", ["linear"], ["zoom"], 9, 10, 14, 13],
        "text-transform": "uppercase",
        "text-letter-spacing": 0.08,
      },
      paint: {
        "text-color": LABEL,
        "text-halo-color": LAND,
        "text-halo-width": 1.5,
      },
    },
  ],
};

function escape(text: string) {
  return text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

type Bounds = [[number, number], [number, number]];
function boundsOf(list: { lat: number; lng: number }[]): Bounds {
  const lngs = list.map((n) => n.lng);
  const lats = list.map((n) => n.lat);
  return [
    [Math.min(...lngs), Math.min(...lats)],
    [Math.max(...lngs), Math.max(...lats)],
  ];
}

export default function NeighborhoodMap() {
  const el = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MLMap | null>(null);
  const markers = useRef<Record<string, { marker: Marker; dot: HTMLElement }>>({});
  const [region, setRegion] = useState<Region | "All">("All");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const ml = await import("maplibre-gl");
      if (cancelled || !el.current || mapRef.current) return;
      const map = new ml.Map({
        container: el.current,
        style: STYLE,
        bounds: boundsOf(NEIGHBORHOODS),
        fitBoundsOptions: { padding: 40 },
        scrollZoom: false,
        attributionControl: false,
      });
      map.addControl(new ml.NavigationControl({ showCompass: false }), "top-left");
      map.addControl(
        new ml.AttributionControl({
          compact: true,
          customAttribution:
            '<a href="https://openfreemap.org" target="_blank" rel="noreferrer">OpenFreeMap</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>',
        })
      );
      mapRef.current = map;

      for (const n of NEIGHBORHOODS) {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "ms-pin";
        dot.title = n.name;
        dot.setAttribute("aria-label", n.name);
        const popup = new ml.Popup({ offset: 12, maxWidth: "260px", closeButton: true }).setHTML(
          `<div class="ms-pop"><p class="ms-pop-region">${escape(n.region)}</p>` +
            `<p class="ms-pop-name">${escape(n.name)}</p>` +
            `<p class="ms-pop-tag">${escape(n.tagline)}</p>` +
            `<p class="ms-pop-price">${escape(PRICE_TIERS[n.priceTier])}</p>` +
            `<a class="ms-pop-link" href="/neighborhoods/${n.slug}">See ${escape(n.name)}</a></div>`
        );
        const marker = new ml.Marker({ element: dot }).setLngLat([n.lng, n.lat]).setPopup(popup).addTo(map);
        markers.current[n.slug] = { marker, dot };
      }
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
      m.marker.getPopup()?.remove();
      m.dot.classList.toggle("ms-pin-off", !(region === "All" || n.region === region));
    }
    map.fitBounds(boundsOf(shown), { padding: 50, maxZoom: 12.5, duration: 600 });
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
        className="relative z-0 mt-4 h-[520px] w-full border border-sand max-[600px]:h-[420px]"
        style={{ background: LAND }}
        aria-label="Map of San Diego neighborhoods"
      />
      <style>{`
        .ms-pin { width: 16px; height: 16px; border-radius: 50%; background: ${PIN}; border: 2px solid #fff; box-shadow: 0 1px 4px rgba(0,0,0,.35); cursor: pointer; padding: 0; }
        .ms-pin:hover { background: ${BLUE}; }
        .ms-pin.ms-pin-off { width: 10px; height: 10px; background: ${PIN_OFF}; box-shadow: none; }
        .maplibregl-popup-content { border-radius: 0; padding: 14px 16px; box-shadow: 0 8px 24px rgba(0,0,0,.14); font: inherit; }
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
