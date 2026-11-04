import React, { useState } from "react";
import { Button, Input, Table, Tooltip } from "antd";
import { FiSearch, FiChevronRight, FiFileText, FiShield } from "react-icons/fi";
import OnboardClinic from "./OnboardClinic";

// ---------------------------------------------------------------------------
// Fake data
// ---------------------------------------------------------------------------

const statCards = [
  { label: "Total Clinics", value: "24", note: null },
  { label: "Active", value: "21", note: "Paying", noteColor: "#1F9D6B" },
  {
    label: "In Grace",
    value: "1",
    note: "Payment retrying",
    noteColor: "#6B6B6B",
  },
  { label: "Onboarding", value: "2", note: null },
];

const tabs = ["All", "Active", "Grace", "Onboarding", "Suspended"];

const planTagStyle = {
  Growth: { color: "#8B3FE8", bg: "#F3E8FE" },
  Pro: { color: "#B5690B", bg: "#FCEED9" },
  Solo: { color: "#1F9D6B", bg: "#E7F7EF" },
};

const statusStyle = {
  Active: "#1F9D6B",
  Grace: "#D6862E",
  Onboarding: "#8A8A8A",
  Suspended: "#C0453A",
};

const clinics = [
  {
    key: "1",
    name: "Bright Smile Dental",
    doctor: "Dr. Amira Patel",
    avatar: "https://i.pravatar.cc/64?img=5",
    location: "Oxford",
    postcode: "OX1–OX4",
    plan: "Growth",
    leads: 148,
    mrr: "£1,997",
    joined: "Mar 2026",
    terms: "v1.0",
    privacy: "v1.0",
    status: "Active",
    statusGroup: "Active",
  },
  {
    key: "2",
    name: "Kensington Orthodontics",
    doctor: "Dr. Marcus Vale",
    avatar: "https://i.pravatar.cc/64?img=13",
    location: "London",
    postcode: "SW7",
    plan: "Pro",
    leads: 132,
    mrr: "£2,997",
    joined: "Jan 2026",
    terms: "v1.0",
    privacy: "v1.0",
    status: "Active",
    statusGroup: "Active",
  },
  {
    key: "3",
    name: "Harbourside Dental",
    doctor: "Dr. Lena Frost",
    avatar: "https://i.pravatar.cc/64?img=32",
    location: "Bristol",
    postcode: "BS1",
    plan: "Growth",
    leads: 119,
    mrr: "£1,997",
    joined: "Feb 2026",
    terms: "v1.0",
    privacy: "v1.0",
    status: "Active",
    statusGroup: "Active",
  },
  {
    key: "4",
    name: "Maple Dental",
    doctor: "Dr. Ian Whitlock",
    avatar: "https://i.pravatar.cc/64?img=51",
    location: "Leeds",
    postcode: "LS1",
    plan: "Solo",
    leads: 87,
    mrr: "£1,497",
    joined: "Apr 2026",
    terms: "v1.1",
    privacy: "v1.0",
    status: "Active",
    statusGroup: "Active",
  },
  {
    key: "5",
    name: "Riverside Ortho",
    doctor: "Dr. Sofia Reyes",
    avatar: "https://i.pravatar.cc/64?img=44",
    location: "Manchester",
    postcode: "M1",
    plan: "Growth",
    leads: 12,
    mrr: "£1,997",
    joined: "Jun 2026",
    terms: "v1.1",
    privacy: "v1.1",
    status: "Onboarding",
    statusGroup: "Onboarding",
  },
  {
    key: "6",
    name: "Cathedral Dental",
    doctor: "Dr. Paul Reese",
    avatar: "https://i.pravatar.cc/64?img=15",
    location: "Durham",
    postcode: "DH1",
    plan: "Solo",
    leads: 64,
    mrr: "£1,497",
    joined: "May 2026",
    terms: "v1.1",
    privacy: "v1.1",
    status: "Active",
    statusGroup: "Active",
  },
  {
    key: "7",
    name: "Parkside Smiles",
    doctor: "Dr. Nadia Haq",
    avatar: "https://i.pravatar.cc/64?img=25",
    location: "Cardiff",
    postcode: "CF10",
    plan: null,
    leads: 0,
    mrr: "£0",
    joined: null,
    terms: null,
    privacy: null,
    status: "Suspended",
    statusGroup: "Suspended",
  },
];

// ---------------------------------------------------------------------------
// Small building blocks
// ---------------------------------------------------------------------------

function StatCard({ label, value, note, noteColor }) {
  return (
    <div className="bg-white rounded-xl px-5 pt-5 pb-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <span className="text-[12.5px] tracking-wide text-neutral-400 font-mono">
        {label}
      </span>
      <div
        className="mt-2 text-[28px] leading-none text-neutral-900"
        style={{ fontFamily: "'Georgia', 'Playfair Display', serif" }}
      >
        {value}
      </div>
      {note && (
        <div
          className="mt-2 inline-flex items-center gap-1.5 text-[12.5px] font-medium"
          style={{ color: noteColor }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: noteColor }}
          />
          {note}
        </div>
      )}
    </div>
  );
}

function PlanTag({ plan }) {
  if (!plan) return <span className="text-neutral-300 text-[14px]">—</span>;
  const s = planTagStyle[plan];
  return (
    <span
      className="inline-block text-[12px] font-semibold px-2.5 py-0.5 rounded-full"
      style={{ color: s.color, backgroundColor: s.bg }}
    >
      {plan}
    </span>
  );
}

function StatusDot({ status }) {
  const color = statusStyle[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[13px] font-medium"
      style={{ color }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {status}
    </span>
  );
}

// Small pill used for Terms / Privacy version, with the joined date in a tooltip
function VersionPill({ icon, version, joined }) {
  if (!version) return <span className="text-neutral-300 text-[14px]">—</span>;
  return (
    <Tooltip
      title={joined ? `Accepted on join · ${joined}` : "Accepted on join"}
    >
      <span className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-neutral-600 bg-neutral-100 px-2.5 py-1 rounded-md cursor-default">
        {icon}
        {version}
      </span>
    </Tooltip>
  );
}

// ---------------------------------------------------------------------------
// Clinics page
// ---------------------------------------------------------------------------

function Clinics() {
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = clinics.filter((c) => {
    const matchesTab = activeTab === "All" || c.statusGroup === activeTab;
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const columns = [
    {
      title: "Clinic",
      dataIndex: "name",
      key: "name",
      render: (_, c) => (
        <div className="flex items-center gap-3">
          <img
            src={c.avatar}
            alt={c.name}
            className="w-9 h-9 rounded-full object-cover"
          />
          <div>
            <div className="font-semibold text-neutral-900 text-[14px]">
              {c.name}
            </div>
            <div className="text-neutral-400 text-[12.5px]">{c.doctor}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Location / Postcode",
      key: "location",
      render: (_, c) => (
        <span className="text-neutral-600 text-[14px]">
          {c.location} · {c.postcode}
        </span>
      ),
    },
    {
      title: "Plan",
      dataIndex: "plan",
      key: "plan",
      render: (plan) => <PlanTag plan={plan} />,
    },
    {
      title: "Leads (30d)",
      dataIndex: "leads",
      key: "leads",
      // sorter: (a, b) => a.leads - b.leads,
      render: (leads) => (
        <span className="text-neutral-800 text-[14px]">{leads}</span>
      ),
    },
    {
      title: "MRR",
      dataIndex: "mrr",
      key: "mrr",
      render: (mrr) => (
        <span className="text-neutral-800 text-[14px]">{mrr}</span>
      ),
    },
    {
      title: "Joined",
      dataIndex: "joined",
      key: "joined",
      render: (joined) => (
        <span className="text-neutral-500 text-[14px]">{joined || "—"}</span>
      ),
    },
    {
      title: "Terms Accepted",
      dataIndex: "terms",
      key: "terms",
      render: (terms, c) => (
        <VersionPill
          icon={<FiFileText size={12} className="text-neutral-400" />}
          version={terms}
          joined={c.joined}
        />
      ),
    },
    {
      title: "Privacy Accepted",
      dataIndex: "privacy",
      key: "privacy",
      render: (privacy, c) => (
        <VersionPill
          icon={<FiShield size={12} className="text-neutral-400" />}
          version={privacy}
          joined={c.joined}
        />
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => <StatusDot status={status} />,
    },
    {
      title: "",
      key: "action",
      width: 40,
      render: () => (
        <FiChevronRight size={16} className="text-neutral-300" />
      ),
    },
  ];

  return (
    <div>
      <div>
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1
              className="text-[34px] text-neutral-900"
              style={{ fontFamily: "'Georgia', 'Playfair Display', serif" }}
            >
              Clinics
            </h1>
            <p className="text-neutral-500 mt-1 text-[14.5px]">
              Every tenant on the platform. One clinic per postcode area.
            </p>
          </div>
          <OnboardClinic />
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {statCards.map((c) => (
            <StatCard key={c.label} {...c} />
          ))}
        </div>

        {/* Tabs + search */}
        <div className="flex items-center justify-between mt-6">
          <div className="inline-flex bg-white rounded-lg p-1 gap-1 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-3.5 py-1.5 rounded-md text-[13.5px] font-medium transition-colors"
                style={{
                  backgroundColor:
                    activeTab === tab ? "#F1EFEA" : "transparent",
                  color: activeTab === tab ? "#141414" : "#8A8A8A",
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          <Input
            placeholder="Search clinics..."
            prefix={<FiSearch size={14} className="text-neutral-400" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="!rounded-lg !w-60"
          />
        </div>

        {/* Clinics table (antd) */}
        <div className="bg-white rounded-xl mt-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden">
          <Table
            columns={columns}
            dataSource={filtered}
            rowKey="key"
            pagination={{ pageSize: 10, hideOnSinglePage: true }}
            onRow={() => ({
              className: "cursor-pointer",
            })}
          />
        </div>
      </div>
    </div>
  );
}

export default Clinics;