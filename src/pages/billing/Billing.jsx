import React, { useState } from "react";
import { Button, message, Spin } from "antd";
import { FiExternalLink } from "react-icons/fi";
import { HiOutlineExclamationCircle, HiOutlineClock } from "react-icons/hi2";
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell } from "recharts";
import RevenueByClinic from "./RevenueByClinic";
import { useAdminBillingOverview, retryClinicPaymentApi } from "../../api/billingApi";

// ---------------------------------------------------------------------------
// Fallback data
// ---------------------------------------------------------------------------

const defaultStatCards = [
  { label: "MRR", value: "£41,940", note: "+10.5%", noteColor: "#1F9D6B" },
  { label: "ARR (Run Rate)", value: "£503k", note: null },
  {
    label: "Failed Payments",
    value: "1",
    note: "£1,497 at risk",
    noteColor: "#B0463B",
  },
  {
    label: "Renewals (7d)",
    value: "5",
    note: "£10,485",
    noteColor: "#6B6B6B",
  },
];

const TRACK_HEIGHT = 100;

const defaultMrrGrowth = [
  { month: "Dec", value: 68 },
  { month: "Jan", value: 72 },
  { month: "Feb", value: 76 },
  { month: "Mar", value: 80 },
  { month: "Apr", value: 84 },
  { month: "May", value: 88 },
  { month: "Jun", value: 97, latest: true },
].map((d) => ({ ...d, remainder: TRACK_HEIGHT - d.value }));

const defaultMovement = [
  { label: "New MRR (2 clinics)", value: "+£3,994", color: "#1F9D6B" },
  { label: "Expansion (upgrades)", value: "+£1,500", color: "#1F9D6B" },
  { label: "Contraction (downgrades)", value: "−£500", color: "#B0463B" },
  { label: "Churn (0 clinics)", value: "£0", color: "#141414" },
];

const defaultAlerts = [
  {
    type: "error",
    title: "Maple Dental — payment failed",
    body: "£1,497 charge declined 12 Jun. Grace period ends 19 Jun. Stripe has retried twice.",
    action: "Retry now",
  },
  {
    type: "warning",
    title: "Kensington Orthodontics — renews in 2 days",
    body: "£2,997 · Pro plan · auto-renews 18 Jun.",
    action: null,
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
          className="mt-2 text-[12.5px] font-medium"
          style={{ color: noteColor || "#6B6B6B" }}
        >
          {note}
        </div>
      )}
    </div>
  );
}

function MovementRow({ label, value, color, bold }) {
  return (
    <div className="flex items-center justify-between py-3">
      <span
        className={`text-[14px] ${bold ? "font-semibold text-neutral-900" : "text-neutral-600"}`}
      >
        {label}
      </span>
      <span
        className={`text-[14px] ${bold ? "font-semibold" : "font-medium"}`}
        style={{ color }}
      >
        {value}
      </span>
    </div>
  );
}

function AlertCard({ alert, onRetry, retryingId }) {
  const isError = alert.type === "error";
  const Icon = isError ? HiOutlineExclamationCircle : HiOutlineClock;
  const styles = isError
    ? { bg: "#FBEAE8", border: "#F3D3CE", text: "#9B3B30", icon: "#B0463B" }
    : { bg: "#FCEFDC", border: "#F5DFB8", text: "#93611A", icon: "#C9821F" };

  return (
    <div
      className="rounded-lg px-5 py-4 flex items-start justify-between gap-4"
      style={{
        backgroundColor: styles.bg,
        border: `1px solid ${styles.border}`,
      }}
    >
      <div className="flex items-start gap-3">
        <Icon size={18} style={{ color: styles.icon, marginTop: 2 }} />
        <div>
          <div
            className="text-[14.5px] font-semibold"
            style={{ color: styles.text }}
          >
            {alert.title}
          </div>
          <div
            className="text-[13.5px] mt-0.5"
            style={{ color: styles.text, opacity: 0.85 }}
          >
            {alert.body}
          </div>
        </div>
      </div>
      {alert.action && (
        <Button
          loading={retryingId === alert.id}
          onClick={() => onRetry?.(alert.id || "demo-clinic")}
          className="!rounded-lg !text-[13px] !font-medium !border-red-200 !text-red-600 !bg-white shrink-0 hover:!bg-red-50"
        >
          {alert.action}
        </Button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Billing page
// ---------------------------------------------------------------------------

function Billing() {
  const { billingData, isLoading, refetch } = useAdminBillingOverview();
  const [retryingId, setRetryingId] = useState(null);

  const statCards = billingData?.statCards || defaultStatCards;
  const mrrGrowth = billingData?.mrrGrowth || defaultMrrGrowth;
  const movement = billingData?.movement || defaultMovement;
  const alerts = billingData?.alerts || defaultAlerts;
  const revenueByClinic = billingData?.revenueByClinic;

  const handleRetryPayment = async (clinicId) => {
    try {
      setRetryingId(clinicId);
      await retryClinicPaymentApi(clinicId);
      message.success("Payment retry triggered successfully");
      refetch();
    } catch (err) {
      message.error(err?.response?.data?.message || "Failed to retry payment");
    } finally {
      setRetryingId(null);
    }
  };

  return (
    <div>
      <div className="">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1
              className="text-[34px] text-neutral-900"
              style={{ fontFamily: "'Georgia', 'Playfair Display', serif" }}
            >
              Billing &amp; MRR
            </h1>
            <p className="text-neutral-500 mt-1 text-[14.5px]">
              Recurring revenue across all clinics, driven by Stripe webhooks in
              real time.
            </p>
          </div>
          {/* <Button
            icon={<FiExternalLink size={14} />}
            className="!flex !items-center !gap-1.5 !rounded-lg !border-neutral-200 !text-neutral-800 !text-[13.5px] !font-medium !h-9"
          >
            Open Stripe
          </Button> */}
        </div>

        {/* Loading Spinner Indicator */}
        {isLoading && (
          <div className="py-2 text-center text-xs text-neutral-400">
            <Spin size="small" className="mr-2" /> Loading latest billing metrics...
          </div>
        )}

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {statCards.map((c) => (
            <StatCard key={c.label} {...c} />
          ))}
        </div>

        {/* MRR growth + Movement */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4 mt-4">
          <div className="bg-white rounded-xl px-6 py-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <h2 className="text-[16px] font-semibold text-neutral-900">
              MRR growth
            </h2>
            <p className="text-[13px] text-neutral-400 mt-0.5">Last 7 months</p>

            <div className="h-56 mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mrrGrowth} barCategoryGap="38%">
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#9CA3AF", fontSize: 12.5 }}
                    dy={10}
                  />
                  {/* colored fill — bottom of the stack, height = value */}
                  <Bar
                    dataKey="value"
                    stackId="mrr"
                    radius={[0, 0, 2, 2]}
                    isAnimationActive={false}
                  >
                    {mrrGrowth.map((entry, idx) => (
                      <Cell
                        key={idx}
                        fill={entry.latest ? "#E8722F" : "#C9A24B"}
                      />
                    ))}
                  </Bar>
                  {/* empty track — top of the stack, height = 100 - value */}
                  <Bar
                    dataKey="remainder"
                    stackId="mrr"
                    fill="#F1EFEA"
                    radius={[3, 3, 0, 0]}
                    isAnimationActive={false}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl px-6 py-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <h2 className="text-[16px] font-semibold text-neutral-900">
              Movement this month
            </h2>

            <div className="mt-3 divide-y divide-neutral-100">
              {movement.map((m) => (
                <MovementRow key={m.label} {...m} />
              ))}
            </div>

            <div className="pt-3 mt-1 border-t border-neutral-200">
              <MovementRow
                label="Net new MRR"
                value="+£4,994"
                color="#1F9D6B"
                bold
              />
            </div>
          </div>
        </div>

        {/* Attention required */}
        <div className="bg-white rounded-xl mt-4 px-6 py-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <h2 className="text-[16px] font-semibold text-neutral-900 mb-4">
            Attention required
          </h2>
          <div className="flex flex-col gap-3">
            {alerts.map((a, idx) => (
              <AlertCard
                key={a.id || idx}
                alert={a}
                onRetry={handleRetryPayment}
                retryingId={retryingId}
              />
            ))}
          </div>
        </div>

        <RevenueByClinic data={revenueByClinic} />
      </div>
    </div>
  );
}

export default Billing;
