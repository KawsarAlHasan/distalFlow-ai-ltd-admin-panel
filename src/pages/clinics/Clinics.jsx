import React, { useState } from "react";
import {
  Button,
  Input,
  Table,
  Tooltip,
  Drawer,
  Tag,
  Spin,
  message,
  Popconfirm,
  Badge,
} from "antd";
import {
  FiSearch,
  FiChevronRight,
  FiFileText,
  FiShield,
  FiMail,
  FiMapPin,
  FiCalendar,
  FiCreditCard,
  FiCheckCircle,
  FiAlertCircle,
  FiCopy,
  FiExternalLink,
  FiX,
  FiActivity,
  FiUser,
  FiClock,
} from "react-icons/fi";
import OnboardClinic from "./OnboardClinic";
import { useClinics, updateClinicStatusApi } from "../../api/clinicApi";
import { useQueryClient } from "@tanstack/react-query";

// ---------------------------------------------------------------------------
// Config & styles
// ---------------------------------------------------------------------------

const tabs = ["All", "Active", "Grace", "Onboarding", "Suspended"];

const planTagStyle = {
  Growth: { color: "#8B3FE8", bg: "#F3E8FE" },
  GROWTH: { color: "#8B3FE8", bg: "#F3E8FE" },
  Pro: { color: "#B5690B", bg: "#FCEED9" },
  PRO: { color: "#B5690B", bg: "#FCEED9" },
  Solo: { color: "#1F9D6B", bg: "#E7F7EF" },
  SOLO: { color: "#1F9D6B", bg: "#E7F7EF" },
  Enterprise: { color: "#1E0F22", bg: "#EFE8FF" },
  ENTERPRISE: { color: "#1E0F22", bg: "#EFE8FF" },
};

const statusStyle = {
  Active: { color: "#1F9D6B", bg: "#E7F7EF" },
  Grace: { color: "#D6862E", bg: "#FDF2E9" },
  Onboarding: { color: "#8A8A8A", bg: "#F5F5F5" },
  Suspended: { color: "#C0453A", bg: "#FDEEEC" },
};

// ---------------------------------------------------------------------------
// Small building blocks
// ---------------------------------------------------------------------------

function StatCard({ label, value, note, noteColor }) {
  return (
    <div className="bg-white rounded-xl px-5 pt-5 pb-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] border border-neutral-100">
      <span className="text-[12.5px] tracking-wide text-neutral-400 font-mono">
        {label}
      </span>
      <div
        className="mt-2 text-[28px] leading-none text-neutral-900 font-semibold"
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
  const s = planTagStyle[plan] || { color: "#555", bg: "#f0f0f0" };
  const formattedPlan =
    plan.charAt(0).toUpperCase() + plan.slice(1).toLowerCase();
  return (
    <span
      className="inline-block text-[12px] font-semibold px-2.5 py-0.5 rounded-full"
      style={{ color: s.color, backgroundColor: s.bg }}
    >
      {formattedPlan}
    </span>
  );
}

function StatusDot({ status }) {
  const conf = statusStyle[status] || { color: "#8A8A8A" };
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[13px] font-medium"
      style={{ color: conf.color }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: conf.color }}
      />
      {status}
    </span>
  );
}

function VersionPill({ icon, version, acceptedAt, joined }) {
  if (!version) return <span className="text-neutral-300 text-[14px]">—</span>;
  const dateStr = acceptedAt
    ? new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(new Date(acceptedAt))
    : joined || "On join";

  return (
    <Tooltip title={`Version ${version} accepted on ${dateStr}`}>
      <span className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 transition-colors px-2.5 py-1 rounded-md cursor-default border border-neutral-200/50">
        {icon}
        {version}
      </span>
    </Tooltip>
  );
}

// ---------------------------------------------------------------------------
// Clinics page (Backend Integrated)
// ---------------------------------------------------------------------------

function Clinics() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 15;

  // Selected clinic for Details Drawer
  const [drawerClinic, setDrawerClinic] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);

  // Fetch clinics from backend with active search & status filter
  const {
    clinics,
    stats,
    meta,
    isLoading,
    isFetching,
    refetch,
  } = useClinics({
    search,
    status: activeTab,
    page,
    limit: pageSize,
  });

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const copyToClipboard = (text, itemLabel = "Item") => {
    navigator.clipboard.writeText(text);
    message.success(`${itemLabel} copied to clipboard!`);
  };

  const handleStatusToggle = async (clinicId, currentStatus) => {
    const nextStatus = currentStatus === "Active" ? "SUSPENDED" : "ACTIVE";
    setStatusLoading(true);
    try {
      await updateClinicStatusApi({ clinicId, status: nextStatus });
      message.success(
        `Clinic status updated to ${
          nextStatus === "ACTIVE" ? "Active" : "Suspended"
        }!`,
      );
      await queryClient.invalidateQueries({ queryKey: ["adminClinics"] });
      // Update drawer clinic if open
      if (drawerClinic && drawerClinic.id === clinicId) {
        setDrawerClinic((prev) => ({
          ...prev,
          status: nextStatus === "ACTIVE" ? "Active" : "Suspended",
          statusGroup: nextStatus === "ACTIVE" ? "Active" : "Suspended",
          rawStatus: nextStatus,
        }));
      }
    } catch (error) {
      console.error(error);
      message.error(
        error?.response?.data?.message || "Failed to update clinic status.",
      );
    } finally {
      setStatusLoading(false);
    }
  };

  // Stat cards with live counts from backend
  const statCardsData = [
    {
      label: "Total Clinics",
      value: String(stats.totalClinics || 0),
      note: null,
    },
    {
      label: "Active",
      value: String(stats.active || 0),
      note: "Paying",
      noteColor: "#1F9D6B",
    },
    {
      label: "In Grace",
      value: String(stats.inGrace || 0),
      note: "Payment retrying",
      noteColor: "#D6862E",
    },
    {
      label: "Onboarding",
      value: String(stats.onboarding || 0),
      note: "Pending setup",
      noteColor: "#8A8A8A",
    },
  ];

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
            className="w-9 h-9 rounded-full object-cover border border-neutral-200"
          />
          <div>
            <div className="font-semibold text-neutral-900 text-[14px] hover:text-[#8B3FE8] transition-colors">
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
        <span className="text-neutral-600 text-[13.5px]">
          {c.location} ·{" "}
          <span className="font-mono text-[12.5px] text-neutral-700 bg-neutral-100 px-1.5 py-0.5 rounded">
            {c.postcode}
          </span>
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
      title: "Leads",
      dataIndex: "leads",
      key: "leads",
      render: (leads) => (
        <span className="text-neutral-800 text-[14px] font-medium font-mono">
          {leads}
        </span>
      ),
    },
    {
      title: "MRR",
      dataIndex: "mrr",
      key: "mrr",
      render: (mrr) => (
        <span className="text-neutral-900 text-[14px] font-semibold">
          {mrr}
        </span>
      ),
    },
    {
      title: "Joined",
      dataIndex: "joined",
      key: "joined",
      render: (joined, c) => (
        <Tooltip title={c.fullJoinedDate || joined}>
          <span className="text-neutral-500 text-[13px]">{joined || "—"}</span>
        </Tooltip>
      ),
    },
    {
      title: "Terms Accepted",
      dataIndex: "terms",
      key: "terms",
      render: (terms, c) => (
        <VersionPill
          icon={<FiFileText size={12} className="text-neutral-500" />}
          version={terms}
          acceptedAt={c.termsAcceptedAt}
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
          icon={<FiShield size={12} className="text-neutral-500" />}
          version={privacy}
          acceptedAt={c.privacyAcceptedAt}
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
      width: 48,
      render: (_, c) => (
        <Button
          type="text"
          shape="circle"
          onClick={(e) => {
            e.stopPropagation();
            setDrawerClinic(c);
          }}
          className="text-neutral-400 hover:text-neutral-900"
          icon={<FiChevronRight size={17} />}
        />
      ),
    },
  ];

  return (
    <div>
      <div>
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
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

        {/* Stat cards (Live Backend Stats) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {statCardsData.map((c) => (
            <StatCard key={c.label} {...c} />
          ))}
        </div>

        {/* Tabs + search (Backend Filtered) */}
        <div className="flex items-center justify-between flex-wrap gap-3 mt-6">
          <div className="inline-flex bg-white rounded-lg p-1 gap-1 shadow-[0_1px_2px_rgba(0,0,0,0.04)] border border-neutral-100">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
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

          <div className="flex items-center gap-2">
            {isFetching && (
              <span className="text-xs text-neutral-400 flex items-center gap-1 font-mono">
                <Spin size="small" /> Searching...
              </span>
            )}
            <Input
              placeholder="Search clinics, doctors, postcodes..."
              prefix={<FiSearch size={14} className="text-neutral-400" />}
              value={search}
              onChange={handleSearchChange}
              allowClear
              className="!rounded-lg !w-72"
            />
          </div>
        </div>

        {/* Clinics table (antd) */}
        <div className="bg-white rounded-xl mt-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] border border-neutral-100 overflow-hidden">
          <Table
            columns={columns}
            dataSource={clinics}
            rowKey="id"
            loading={isLoading}
            pagination={{
              current: page,
              pageSize: pageSize,
              total: meta.total,
              onChange: (p) => setPage(p),
              hideOnSinglePage: meta.total <= pageSize,
              showTotal: (total, range) =>
                `Showing ${range[0]}-${range[1]} of ${total} clinics`,
            }}
            onRow={(record) => ({
              onClick: () => setDrawerClinic(record),
              className: "cursor-pointer hover:bg-neutral-50/70 transition-colors",
            })}
          />
        </div>
      </div>

      {/* ==================================================================== */}
      {/* Clinic Simple Details Drawer */}
      {/* ==================================================================== */}
      <Drawer
        open={!!drawerClinic}
        onClose={() => setDrawerClinic(null)}
        width={540}
        title={
          <div className="flex items-center justify-between pr-4">
            <span className="font-semibold text-neutral-900 text-[17px]">
              Clinic Details
            </span>
            {drawerClinic && (
              <Tag
                color={
                  drawerClinic.status === "Active"
                    ? "success"
                    : drawerClinic.status === "Suspended"
                    ? "error"
                    : drawerClinic.status === "Grace"
                    ? "warning"
                    : "default"
                }
                className="font-medium px-2.5 py-0.5 rounded-full"
              >
                {drawerClinic.status}
              </Tag>
            )}
          </div>
        }
      >
        {drawerClinic && (
          <div className="space-y-6 text-[#2D2A26]">
            {/* Header info card */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-[#FBF9F5] border border-[#E7E0D4]">
              <img
                src={drawerClinic.avatar}
                alt={drawerClinic.name}
                className="w-14 h-14 rounded-full object-cover border border-neutral-300 shadow-sm"
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-neutral-900 truncate">
                  {drawerClinic.name}
                </h3>
                <div className="text-neutral-500 text-[13.5px] mt-0.5">
                  {drawerClinic.doctor} &bull; {drawerClinic.location}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="font-mono text-[11px] text-neutral-400 bg-white px-2 py-0.5 rounded border border-neutral-200">
                    ID: {drawerClinic.id.slice(0, 12)}...
                  </span>
                  <button
                    onClick={() => copyToClipboard(drawerClinic.id, "Clinic ID")}
                    className="text-neutral-400 hover:text-neutral-800 text-[12px] inline-flex items-center gap-1"
                  >
                    <FiCopy size={11} /> Copy
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-200/60">
                <div className="text-[11px] font-mono text-neutral-400 uppercase tracking-wide">
                  Monthly MRR
                </div>
                <div className="text-[18px] font-bold text-neutral-900 mt-1">
                  {drawerClinic.mrr}
                </div>
              </div>
              <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-200/60">
                <div className="text-[11px] font-mono text-neutral-400 uppercase tracking-wide">
                  Tier / Plan
                </div>
                <div className="mt-1">
                  <PlanTag plan={drawerClinic.plan} />
                </div>
              </div>
              <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-200/60">
                <div className="text-[11px] font-mono text-neutral-400 uppercase tracking-wide">
                  Sites Count
                </div>
                <div className="text-[18px] font-bold text-neutral-900 mt-1">
                  {drawerClinic.locationsCount || 1}
                </div>
              </div>
            </div>

            {/* Section 1: Clinic & Postcode Exclusivity */}
            <div className="border border-neutral-200 rounded-xl p-4 space-y-3 bg-white">
              <div className="flex items-center gap-2 text-neutral-800 font-semibold text-[14px]">
                <FiMapPin className="text-[#8B3FE8]" />
                <span>Clinic & Exclusivity Areas</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-[13px] pt-1">
                <div>
                  <span className="text-neutral-400 block text-[11px] font-mono uppercase">
                    Trading Company
                  </span>
                  <span className="text-neutral-800 font-medium">
                    {drawerClinic.tradingCompany || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[11px] font-mono uppercase">
                    City / Location
                  </span>
                  <span className="text-neutral-800 font-medium">
                    {drawerClinic.location}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-neutral-400 block text-[11px] font-mono uppercase mb-1">
                    Guaranteed Postcode Sectors
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {drawerClinic.postcodesList &&
                    drawerClinic.postcodesList.length > 0 ? (
                      drawerClinic.postcodesList.map((pc) => (
                        <span
                          key={pc.id || pc.code}
                          className="font-mono text-[12px] bg-neutral-100 text-neutral-800 px-2 py-0.5 rounded border border-neutral-200"
                        >
                          {pc.code}
                          {pc.unavailable && (
                            <span className="text-[10px] text-amber-600 ml-1">
                              (override)
                            </span>
                          )}
                        </span>
                      ))
                    ) : (
                      <span className="text-neutral-400 text-xs">—</span>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[11px] font-mono uppercase">
                    Registration Date
                  </span>
                  <span className="text-neutral-800 font-medium">
                    {drawerClinic.fullJoinedDate || drawerClinic.joined}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[11px] font-mono uppercase">
                    Campaigns Active
                  </span>
                  <span className="text-neutral-800 font-medium">
                    {drawerClinic.campaignsCount || 0} Campaigns ({drawerClinic.leads} Leads)
                  </span>
                </div>
              </div>
            </div>

            {/* Section 2: Clinic Admin Contact */}
            <div className="border border-neutral-200 rounded-xl p-4 space-y-3 bg-white">
              <div className="flex items-center gap-2 text-neutral-800 font-semibold text-[14px]">
                <FiUser className="text-[#1F9D6B]" />
                <span>Primary Administrator / Doctor</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-[13px] pt-1">
                <div>
                  <span className="text-neutral-400 block text-[11px] font-mono uppercase">
                    Administrator Name
                  </span>
                  <span className="text-neutral-800 font-medium">
                    {drawerClinic.doctor}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[11px] font-mono uppercase">
                    Email Verification
                  </span>
                  <span className="inline-flex items-center gap-1 font-medium">
                    {drawerClinic.admin?.isVerified ? (
                      <span className="text-emerald-700 flex items-center gap-1">
                        <FiCheckCircle size={12} /> Verified
                      </span>
                    ) : (
                      <span className="text-amber-700 flex items-center gap-1">
                        <FiAlertCircle size={12} /> Unverified
                      </span>
                    )}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-neutral-400 block text-[11px] font-mono uppercase">
                    Login / Contact Email
                  </span>
                  <div className="flex items-center justify-between">
                    <a
                      href={`mailto:${drawerClinic.email}`}
                      className="text-neutral-800 hover:text-[#8B3FE8] font-medium flex items-center gap-1.5"
                    >
                      <FiMail size={13} className="text-neutral-400" />
                      {drawerClinic.email}
                    </a>
                    <button
                      onClick={() => copyToClipboard(drawerClinic.email, "Email")}
                      className="text-xs text-neutral-400 hover:text-neutral-800"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Billing & Subscription Details */}
            <div className="border border-neutral-200 rounded-xl p-4 space-y-3 bg-white">
              <div className="flex items-center gap-2 text-neutral-800 font-semibold text-[14px]">
                <FiCreditCard className="text-[#B5690B]" />
                <span>Subscription & Billing Setup</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-[13px] pt-1">
                <div>
                  <span className="text-neutral-400 block text-[11px] font-mono uppercase">
                    Current Tier
                  </span>
                  <span className="text-neutral-800 font-medium">
                    {drawerClinic.plan || "No active tier"}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[11px] font-mono uppercase">
                    Monthly Charge
                  </span>
                  <span className="text-neutral-800 font-medium">
                    {drawerClinic.mrr} + VAT
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[11px] font-mono uppercase">
                    Billing Contact Name
                  </span>
                  <span className="text-neutral-800 font-medium">
                    {drawerClinic.billingName}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[11px] font-mono uppercase">
                    Billing Contact Email
                  </span>
                  <span className="text-neutral-800 font-medium truncate block">
                    {drawerClinic.billingEmail}
                  </span>
                </div>
                {drawerClinic.vatNumber && drawerClinic.vatNumber !== "—" && (
                  <div>
                    <span className="text-neutral-400 block text-[11px] font-mono uppercase">
                      VAT Number
                    </span>
                    <span className="text-neutral-800 font-mono">
                      {drawerClinic.vatNumber}
                    </span>
                  </div>
                )}
                {drawerClinic.stripeCustomerId && (
                  <div>
                    <span className="text-neutral-400 block text-[11px] font-mono uppercase">
                      Stripe Customer
                    </span>
                    <span className="text-neutral-800 font-mono text-[11px]">
                      {drawerClinic.stripeCustomerId}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Section 4: Legal & Compliance Versioning */}
            <div className="border border-neutral-200 rounded-xl p-4 space-y-3 bg-white">
              <div className="flex items-center gap-2 text-neutral-800 font-semibold text-[14px]">
                <FiShield className="text-[#C8A96E]" />
                <span>Accepted Legal Versions (Locked)</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-[13px] pt-1">
                <div className="bg-neutral-50 p-2.5 rounded-lg border border-neutral-200/60">
                  <div className="text-[11px] font-mono text-neutral-400 uppercase">
                    Terms of Service
                  </div>
                  <div className="text-neutral-800 font-bold mt-0.5 flex items-center gap-1.5">
                    <FiFileText size={13} className="text-[#C8A96E]" />
                    {drawerClinic.terms || "Pending Acceptance"}
                  </div>
                  {drawerClinic.termsAcceptedAt && (
                    <div className="text-[11px] text-neutral-500 mt-1">
                      {new Intl.DateTimeFormat("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }).format(new Date(drawerClinic.termsAcceptedAt))}
                    </div>
                  )}
                </div>

                <div className="bg-neutral-50 p-2.5 rounded-lg border border-neutral-200/60">
                  <div className="text-[11px] font-mono text-neutral-400 uppercase">
                    Privacy Policy
                  </div>
                  <div className="text-neutral-800 font-bold mt-0.5 flex items-center gap-1.5">
                    <FiShield size={13} className="text-[#C8A96E]" />
                    {drawerClinic.privacy || "Pending Acceptance"}
                  </div>
                  {drawerClinic.privacyAcceptedAt && (
                    <div className="text-[11px] text-neutral-500 mt-1">
                      {new Intl.DateTimeFormat("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }).format(new Date(drawerClinic.privacyAcceptedAt))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions footer */}
            <div className="pt-4 border-t border-neutral-200 flex items-center justify-between">
              <Popconfirm
                title={
                  drawerClinic.status === "Active"
                    ? "Suspend this clinic?"
                    : "Activate this clinic?"
                }
                description={
                  drawerClinic.status === "Active"
                    ? "Suspending will temporarily block admin login and campaigns for this clinic."
                    : "Activating will restore full platform and login access for this clinic."
                }
                onConfirm={() =>
                  handleStatusToggle(drawerClinic.id, drawerClinic.status)
                }
                okText={
                  drawerClinic.status === "Active"
                    ? "Yes, Suspend"
                    : "Yes, Activate"
                }
                okButtonProps={{
                  danger: drawerClinic.status === "Active",
                  loading: statusLoading,
                }}
              >
                <Button
                  danger={drawerClinic.status === "Active"}
                  type={drawerClinic.status === "Active" ? "default" : "primary"}
                  loading={statusLoading}
                  className="rounded-lg font-medium"
                >
                  {drawerClinic.status === "Active"
                    ? "Suspend Clinic"
                    : "Activate Clinic"}
                </Button>
              </Popconfirm>

              <Button
                onClick={() => setDrawerClinic(null)}
                className="rounded-lg text-neutral-600 font-medium"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}

export default Clinics;
