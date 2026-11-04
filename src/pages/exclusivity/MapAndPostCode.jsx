import React, { useRef, useState } from "react";
import { Card, Tag } from "antd";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/*
  Install these two packages if you don't already have them:
    npm install react-leaflet leaflet
*/

const STATUS_META = {
  taken: { label: "Taken", color: "#0f9d78", bg: "#e6f6f0", dot: "#0f9d78" },
  processing: {
    label: "Processing",
    color: "#e8792b",
    bg: "#fdece0",
    dot: "#e8792b",
  },
  offmarket: {
    label: "Off-market",
    color: "#6b7280",
    bg: "#eceef1",
    dot: "#9aa0a8",
  },
};

// Added lat/lng for each postcode so pins can be placed on the map.
const CLINICS = [
  {
    postcode: "OX1",
    area: "Oxford central",
    clinic: "Bright Smile Dental",
    status: "taken",
    city: "OX1",
    lat: 51.752,
    lng: -1.2577,
  },
  {
    postcode: "OX2",
    area: "Oxford north & west",
    clinic: "Bright Smile Dental",
    status: "taken",
    city: "OX2",
    lat: 51.7648,
    lng: -1.283,
  },
  {
    postcode: "SW7",
    area: "South Kensington, London",
    clinic: "Kensington Orthodontics",
    status: "taken",
    city: "SW7",
    lat: 51.4941,
    lng: -0.1746,
  },
  {
    postcode: "BS1",
    area: "Bristol central",
    clinic: "Harbourside Dental",
    status: "taken",
    city: "BS1",
    lat: 51.4536,
    lng: -2.5921,
  },
  {
    postcode: "LS1",
    area: "Leeds central",
    clinic: "Maple Dental",
    status: "taken",
    city: "LS1",
    lat: 53.7965,
    lng: -1.5478,
  },
  {
    postcode: "M1",
    area: "Manchester central",
    clinic: "Riverside Ortho",
    status: "processing",
    city: "M1",
    lat: 53.4794,
    lng: -2.2373,
  },
  {
    postcode: "NE1",
    area: "Newcastle central",
    clinic: "Parkside Smiles (left)",
    status: "offmarket",
    city: "NE1",
    lat: 54.9738,
    lng: -1.6131,
  },
];

function StatusDot({ status }) {
  const m = STATUS_META[status];
  return (
    <span
      className="inline-block w-2 h-2 rounded-full mr-1.5 mt-1.5"
      style={{ backgroundColor: m.dot }}
    />
  );
}

function StatusTag({ status }) {
  const m = STATUS_META[status];
  return (
    <Tag
      style={{
        color: m.color,
        background: m.bg,
        border: "none",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 500,
        padding: "1px 10px",
      }}
    >
      <StatusDot status={status} />
      {m.label}
    </Tag>
  );
}

// Custom teardrop pin icon colored by status, built with a plain SVG so no
// external icon assets are needed.
function makeIcon(status) {
  const color = STATUS_META[status].dot;
  const html = `
    <svg width="26" height="34" viewBox="0 0 26 34" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 1px 2px rgba(0,0,0,0.25));">
      <path d="M13 0C5.82 0 0 5.82 0 13c0 9.75 13 21 13 21s13-11.25 13-21C26 5.82 20.18 0 13 0z" fill="${color}"/>
      <circle cx="13" cy="13" r="5.2" fill="#ffffff"/>
    </svg>`;
  return L.divIcon({
    className: "clinic-pin-icon",
    html,
    iconSize: [26, 34],
    iconAnchor: [13, 34],
    popupAnchor: [0, -30],
  });
}

// Flies the map to a given clinic whenever activePin changes.
function FlyToPin({ activePin }) {
  const map = useMap();
  React.useEffect(() => {
    if (!activePin) return;
    const c = CLINICS.find((x) => x.postcode === activePin);
    if (c) map.flyTo([c.lat, c.lng], 9, { duration: 0.6 });
  }, [activePin, map]);
  return null;
}

function MapLegend() {
  return (
    <div
      className="absolute right-3 bottom-3 z-[500] bg-white/95 rounded-lg px-3.5 py-2.5 text-xs text-gray-600"
      style={{ boxShadow: "0 2px 8px rgba(16,24,40,0.12)" }}
    >
      {Object.entries({
        taken: "Taken — active clinic",
        processing: "Processing — payment pending",
        offmarket: "Off-market — clinic left",
      }).map(([key, label]) => (
        <div key={key} className="flex items-center gap-2 py-0.5 whitespace-nowrap">
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: STATUS_META[key].dot }}
          />
          {label}
        </div>
      ))}
    </div>
  );
}

export default function MapAndPostCode() {
  const [activePin, setActivePin] = useState(null);
  const markerRefs = useRef({});

  const handleSelect = (postcode) => {
    const next = activePin === postcode ? null : postcode;
    setActivePin(next);
    if (next && markerRefs.current[next]) {
      markerRefs.current[next].openPopup();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4">
      <Card
        bordered={false}
        className="rounded-xl shadow-sm overflow-hidden"
        bodyStyle={{ padding: 0 }}
      >
        <div className="flex items-center justify-between px-5 pt-4 pb-3">
          <span className="font-semibold text-gray-800">UK coverage map</span>
          <span className="text-xs text-gray-400">
            Click a pin for clinic details
          </span>
        </div>

        <div className="relative w-full h-[560px] overflow-hidden">
          <MapContainer
            center={[53.9, -2.5]}
            zoom={5.8}
            scrollWheelZoom
            style={{ width: "100%", height: "100%" }}
          >
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <FlyToPin activePin={activePin} />
            {CLINICS.map((c) => (
              <Marker
                key={c.postcode}
                position={[c.lat, c.lng]}
                icon={makeIcon(c.status)}
                eventHandlers={{ click: () => setActivePin(c.postcode) }}
                ref={(ref) => {
                  if (ref) markerRefs.current[c.postcode] = ref;
                }}
              >
                <Popup>
                  <div className="text-sm">
                    <span className="font-semibold">{c.postcode}</span>
                    <span className="text-gray-400"> · {c.area}</span>
                    <div className="text-xs text-gray-500 mt-1">{c.clinic}</div>
                    <div className="mt-2">
                      <StatusTag status={c.status} />
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
          <MapLegend />
        </div>
      </Card>

      <Card
        bordered={false}
        className="rounded-xl shadow-sm"
        bodyStyle={{ padding: 0 }}
      >
        <div className="px-5 pt-4 pb-3 font-semibold text-gray-800">
          Postcode register
        </div>
        <div className="divide-y divide-gray-100 max-h-[510px] overflow-y-auto">
          {CLINICS.map((c) => (
            <div
              key={c.postcode}
              className={`flex items-center justify-between px-5 py-3 cursor-pointer transition-colors ${
                activePin === c.postcode ? "bg-gray-50" : "hover:bg-gray-50"
              }`}
              onClick={() => handleSelect(c.postcode)}
            >
              <div className="flex items-start gap-2">
                <StatusDot status={c.status} />
                <div>
                  <div className="text-sm text-gray-800">
                    <span className="font-semibold">{c.postcode}</span>
                    <span className="text-gray-400"> · {c.area}</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">{c.clinic}</div>
                </div>
              </div>
              <StatusTag status={c.status} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}