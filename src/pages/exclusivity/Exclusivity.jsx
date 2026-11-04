import React from "react";
import { Card, Tag, Popover } from "antd";
import { FaMapMarkerAlt } from "react-icons/fa";
import MapAndPostCode from "./MapAndPostCode";

const STATS = [
  { label: "Taken (Active)", sub: "Paid & live", value: 5 },
  { label: "Processing", sub: "Awaiting payment", value: 1 },
  { label: "Clinics holding", sub: "", value: 4 },
  { label: "Avg areas / clinic", sub: "", value: "1.3" },
];

export default function Exclusivity() {
  return (
    <div className="">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-serif text-3xl text-gray-900 mb-1">Exclusivity</h1>
        <p className="text-sm text-gray-500 max-w-3xl">
          Every clinic's protected area on one map. Each UK postcode belongs to
          a single clinic — the core DistalFlo promise. Postcodes and map pins are
          set when a clinic is onboarded.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {STATS.map((s) => (
          <Card key={s.label} bordered={false} className="rounded-xl shadow-sm">
            <div className="text-xs tracking-wide text-gray-400 font-mono uppercase">
              {s.label}
            </div>
            <div className="font-serif text-3xl text-gray-900 mt-2">
              {s.value}
            </div>
            {s.sub && <div className="text-xs text-gray-400 mt-1">{s.sub}</div>}
          </Card>
        ))}
      </div>

      {/* Map + register */}
      <MapAndPostCode />
    </div>
  );
}
