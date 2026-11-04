import React, { useMemo, useState } from "react";
import {
  Tag,
  Table,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Badge,
  Tabs,
  Tooltip,
  Popconfirm,
  Empty,
  message,
  Spin,
} from "antd";
import {
  RiBuilding2Line,
  RiRocketLine,
  RiVipCrownLine,
  RiGlobalLine,
  RiHistoryLine,
  RiEditLine,
  RiUserSettingsLine,
  RiShieldCheckLine,
  RiMapPinLine,
  RiPriceTag3Line,
  RiArrowRightUpLine,
  RiFileList3Line,
  RiAlertLine,
  RiCheckboxCircleLine,
  RiDeleteBinLine,
} from "react-icons/ri";
import {
  usePlanData,
  useOverridesData,
  usePlanAuditLog,
  createPriceApi,
  migrateSubscribersApi,
  createOverrideApi,
  deleteOverrideApi,
} from "../../api/planApi";

/* ------------------------------------------------------------------ */
/*  Fallback / Seed data                                              */
/* ------------------------------------------------------------------ */

const seedTiers = [
  {
    key: "solo",
    name: "Solo",
    icon: <RiBuilding2Line />,
    campaigns: "1 active campaign",
    locations: "Single location",
    selfServe: true,
    accent: "#6366f1",
    history: [
      {
        id: "price_solo_v2",
        amount: 997,
        setup: 497,
        createdAt: "2026-04-01",
        status: "active",
        subscribers: 84,
      },
      {
        id: "price_solo_v1",
        amount: 897,
        setup: 397,
        createdAt: "2025-09-14",
        status: "legacy",
        subscribers: 22,
      },
    ],
  },
  {
    key: "growth",
    name: "Growth",
    icon: <RiRocketLine />,
    campaigns: "3 active campaigns",
    locations: "Single location",
    selfServe: true,
    accent: "#0891b2",
    history: [
      {
        id: "price_growth_v2",
        amount: 1497,
        setup: 497,
        createdAt: "2026-04-01",
        status: "active",
        subscribers: 61,
      },
      {
        id: "price_growth_v1",
        amount: 1397,
        setup: 397,
        createdAt: "2025-09-14",
        status: "legacy",
        subscribers: 15,
      },
    ],
  },
  {
    key: "pro",
    name: "Pro",
    icon: <RiVipCrownLine />,
    campaigns: "Unlimited campaigns",
    locations: "Single location",
    selfServe: true,
    accent: "#b45309",
    history: [
      {
        id: "price_pro_v1",
        amount: 2297,
        setup: 497,
        createdAt: "2026-01-10",
        status: "active",
        subscribers: 37,
      },
    ],
  },
  {
    key: "enterprise",
    name: "Enterprise",
    icon: <RiGlobalLine />,
    campaigns: "Unlimited campaigns",
    locations: "Multiple locations · group reporting",
    selfServe: false,
    accent: "#7c3aed",
    history: [
      {
        id: "price_ent_base_v1",
        amount: 2997,
        setup: 994,
        createdAt: "2026-01-10",
        status: "active",
        subscribers: 9,
      },
    ],
  },
];

const seedOverrides = [
  {
    id: "ov_1",
    clinic: "Riverside Dental Group",
    tier: "growth",
    standardPrice: 1497,
    overridePrice: 1197,
    reason: "Founding partner rate",
  },
  {
    id: "ov_2",
    clinic: "Harborview Physio",
    tier: "pro",
    standardPrice: 2297,
    overridePrice: 1997,
    reason: "Multi-year commitment",
  },
];

const seedAudit = [
  {
    id: "a1",
    admin: "Priya N.",
    action: "New price created",
    tier: "Solo",
    previous: "£897/mo",
    next: "£997/mo",
    affected: "New sign-ups only",
    timestamp: "2026-04-01 09:12",
  },
  {
    id: "a2",
    admin: "Priya N.",
    action: "New price created",
    tier: "Growth",
    previous: "£1,397/mo",
    next: "£1,497/mo",
    affected: "New sign-ups only",
    timestamp: "2026-04-01 09:14",
  },
  {
    id: "a3",
    admin: "Marcus T.",
    action: "Per-clinic override applied",
    tier: "Growth",
    previous: "£1,497/mo",
    next: "£1,197/mo",
    affected: "Riverside Dental Group",
    timestamp: "2026-05-19 14:03",
  },
];

const enterpriseAdditionalSite = { amount: 997, setup: 497 };

const gbp = (n) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(n || 0);

const tierIcons = {
  solo: <RiBuilding2Line />,
  growth: <RiRocketLine />,
  pro: <RiVipCrownLine />,
  enterprise: <RiGlobalLine />,
};

/* ------------------------------------------------------------------ */

function TierOverviewCard({ tier, onUpdatePrice, onMigrate }) {
  const active = tier.history?.find((h) => h.status === "active") || { amount: 0, setup: 0, subscribers: 0 };
  const legacy = tier.history?.filter((h) => h.status === "legacy") || [];
  const totalSubs = tier.history?.reduce((s, h) => s + (h.subscribers || 0), 0) || 0;

  return (
    <div className="relative flex flex-col rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      <div className="h-1" style={{ backgroundColor: tier.accent }} />
      <div className="p-5 flex-1 flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-lg"
              style={{
                backgroundColor: `${tier.accent}1a`,
                color: tier.accent,
              }}
            >
              {tierIcons[tier.key] || <RiBuilding2Line />}
            </div>
            <div>
              <div className="font-semibold text-slate-900 leading-tight">
                {tier.name}
              </div>
              <div className="text-xs text-slate-400">
                {tier.key !== "enterprise"
                  ? "Self-serve"
                  : "Sales-assisted only"}
              </div>
            </div>
          </div>
          {!tier.selfServe && (
            <Tooltip title="Not available via self-serve — agreed directly with the client">
              <Tag color="purple" className="!m-0 flex items-center gap-1">
                <RiShieldCheckLine /> Assisted
              </Tag>
            </Tooltip>
          )}
        </div>

        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">
              {gbp(active.amount)}
            </span>
            <span className="text-sm text-slate-400">/month</span>
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            + {gbp(active.setup)} setup
            {tier.key === "enterprise" ? " (first two locations)" : ""}
          </div>
          {tier.key === "enterprise" && (
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <RiMapPinLine className="shrink-0" />+
              {gbp(enterpriseAdditionalSite.amount)}/mo per additional site (
              {gbp(enterpriseAdditionalSite.setup)} setup)
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1 text-sm text-slate-600 pt-1 border-t border-slate-100">
          <span>{tier.campaigns}</span>
          <span>{tier.locations}</span>
        </div>

        <div className="flex items-center justify-between text-sm pt-1">
          <span className="text-slate-500">Subscribers at this price</span>
          <span className="font-semibold text-slate-900 tabular-nums">
            {active.subscribers || 0}
          </span>
        </div>

        {legacy.length > 0 && (
          <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800 flex items-start gap-2">
            <RiHistoryLine className="mt-0.5 shrink-0" />
            <span>
              {legacy.reduce((s, l) => s + (l.subscribers || 0), 0)} subscriber(s)
              still on legacy price
              {legacy.length > 1 ? "s" : ""} (
              {legacy.map((l) => gbp(l.amount)).join(", ")})
            </span>
          </div>
        )}

        <div className="text-xs text-slate-400">
          {totalSubs} total across all price points
        </div>

        <div className="flex gap-2 mt-auto pt-2">
          <Button
            size="small"
            icon={<RiEditLine />}
            onClick={() => onUpdatePrice(tier)}
            className="flex-1"
          >
            Update price
          </Button>
          <Button
            size="small"
            icon={<RiArrowRightUpLine />}
            onClick={() => onMigrate(tier)}
            disabled={legacy.length === 0}
            className="flex-1"
          >
            Migrate
          </Button>
        </div>
      </div>
    </div>
  );
}

function UpdatePriceModal({ tier, open, onClose, onCreate }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  if (!tier) return null;

  const handleFinish = async (values) => {
    try {
      setLoading(true);
      await onCreate(tier.key, values.amount, values.setup);
      form.resetFields();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={`Update price — ${tier.name}`}
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={loading}
      okText="Create new Stripe price"
      destroyOnClose
    >
      <p className="text-sm text-slate-500 mb-4">
        This creates a new Stripe Price object. It applies to new sign-ups only
        — existing subscribers stay on their current price until you action a
        migration separately.
      </p>
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          amount: tier.history?.find((h) => h.status === "active")?.amount,
          setup: tier.history?.find((h) => h.status === "active")?.setup,
        }}
        onFinish={handleFinish}
      >
        <Form.Item
          label="Monthly price (£)"
          name="amount"
          rules={[{ required: true, message: "Enter a monthly price" }]}
        >
          <InputNumber className="w-full" min={0} step={50} />
        </Form.Item>
        <Form.Item
          label="Setup fee (£)"
          name="setup"
          rules={[{ required: true, message: "Enter a setup fee" }]}
        >
          <InputNumber className="w-full" min={0} step={50} />
        </Form.Item>
      </Form>
    </Modal>
  );
}

function MigrateModal({ tier, open, onClose, onMigrate }) {
  const [mode, setMode] = useState("migrate");
  const [loading, setLoading] = useState(false);
  if (!tier) return null;
  const legacy = tier.history?.filter((h) => h.status === "legacy") || [];
  const active = tier.history?.find((h) => h.status === "active") || { amount: 0 };

  const handleConfirm = async (legacyPriceId) => {
    try {
      setLoading(true);
      await onMigrate(tier.key, legacyPriceId, mode);
      message.success(
        mode === "migrate"
          ? "Subscribers migrated"
          : "Price grandfathered",
      );
      onClose();
    } catch (err) {
      message.error(err?.response?.data?.message || "Migration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={`Legacy subscribers — ${tier.name}`}
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <div className="flex flex-col gap-3">
        {legacy.map((l) => (
          <div key={l.id} className="rounded-lg border border-slate-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-slate-800 tabular-nums">
                {gbp(l.amount)}/mo
              </span>
              <Tag>{l.subscribers} subscribers</Tag>
            </div>
            <Select
              className="w-full mb-2"
              value={mode}
              onChange={setMode}
              options={[
                {
                  value: "migrate",
                  label: `Migrate to current price (${gbp(active.amount)}/mo)`,
                },
                {
                  value: "grandfather",
                  label: "Grandfather — keep this price permanently",
                },
              ]}
            />
            <Popconfirm
              title={
                mode === "migrate"
                  ? "Migrate these subscribers?"
                  : "Grandfather this price?"
              }
              description={
                mode === "migrate"
                  ? `${l.subscribers} subscriber(s) will move to ${gbp(active.amount)}/mo via Stripe subscription update.`
                  : `${l.subscribers} subscriber(s) will be permanently locked to ${gbp(l.amount)}/mo.`
              }
              okText="Confirm"
              cancelText="Cancel"
              onConfirm={() => handleConfirm(l.id)}
            >
              <Button loading={loading} danger={mode === "migrate"} block icon={<RiAlertLine />}>
                {mode === "migrate"
                  ? "Migrate this group"
                  : "Grandfather this group"}
              </Button>
            </Popconfirm>
          </div>
        ))}
        {legacy.length === 0 && (
          <Empty description="No legacy prices on this tier" />
        )}
      </div>
    </Modal>
  );
}

function OverridesPanel({ overrides, tiers, onAdd, onDelete }) {
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const columns = [
    {
      title: "Clinic",
      dataIndex: "clinic",
      key: "clinic",
      render: (v) => <span className="font-medium text-slate-800">{v}</span>,
    },
    {
      title: "Tier",
      dataIndex: "tier",
      key: "tier",
      render: (v) => <Tag>{tiers.find((t) => t.key === v)?.name || v}</Tag>,
    },
    {
      title: "Standard price",
      dataIndex: "standardPrice",
      key: "standardPrice",
      render: (v) => (
        <span className="text-slate-400 line-through tabular-nums">
          {gbp(v)}
        </span>
      ),
    },
    {
      title: "Override price",
      dataIndex: "overridePrice",
      key: "overridePrice",
      render: (v) => (
        <span className="font-semibold text-slate-900 tabular-nums">
          {gbp(v)}
        </span>
      ),
    },
    {
      title: "Reason",
      dataIndex: "reason",
      key: "reason",
      render: (v) => <span className="text-slate-500 text-sm">{v}</span>,
    },
    {
      title: "",
      key: "actions",
      render: (_, record) => (
        <div className="flex items-center gap-2 justify-end">
          <Tag color="gold" className="flex items-center gap-1 w-fit !m-0">
            <RiPriceTag3Line /> Custom price
          </Tag>
          {onDelete && (
            <Popconfirm
              title="Remove override?"
              description="Standard price will apply for this clinic."
              onConfirm={() => onDelete(record.id)}
              okText="Remove"
              cancelText="Cancel"
            >
              <Button
                type="text"
                danger
                size="small"
                icon={<RiDeleteBinLine />}
                className="hover:!bg-red-50"
              />
            </Popconfirm>
          )}
        </div>
      ),
    },
  ];

  const handleFinish = async (values) => {
    try {
      setLoading(true);
      const standard =
        tiers
          .find((t) => t.key === values.tier)
          ?.history?.find((h) => h.status === "active")?.amount ?? 0;
      await onAdd({
        clinicName: values.clinic,
        tier: values.tier,
        standardPrice: standard,
        overridePrice: values.overridePrice,
        reason: values.reason,
      });
      form.resetFields();
      setOpen(false);
      message.success("Override applied successfully");
    } catch (err) {
      message.error(err?.response?.data?.message || "Failed to apply override");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-500 m-0">
          Per-clinic overrides applied via Stripe. Flagged in the clinic list so
          nothing looks like a billing error.
        </p>
        <Button
          type="primary"
          icon={<RiUserSettingsLine />}
          onClick={() => setOpen(true)}
          className="!bg-slate-900 hover:!bg-slate-800"
        >
          Add override
        </Button>
      </div>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={overrides}
        pagination={false}
      />

      <Modal
        title="Add per-clinic override"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={loading}
        okText="Apply via Stripe"
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
        >
          <Form.Item
            label="Clinic name"
            name="clinic"
            rules={[{ required: true, message: "Clinic name is required" }]}
          >
            <Input placeholder="e.g. Riverside Dental Group" />
          </Form.Item>
          <Form.Item label="Tier" name="tier" rules={[{ required: true, message: "Please select a tier" }]}>
            <Select
              options={tiers.map((t) => ({ value: t.key, label: t.name }))}
            />
          </Form.Item>
          <Form.Item
            label="Override price (£/mo)"
            name="overridePrice"
            rules={[{ required: true, message: "Please enter override price" }]}
          >
            <InputNumber className="w-full" min={0} step={50} />
          </Form.Item>
          <Form.Item
            label="Reason (internal note)"
            name="reason"
            rules={[{ required: true, message: "Please provide a reason" }]}
          >
            <Input placeholder="e.g. Founding partner rate" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

function AuditLogPanel({ entries }) {
  const columns = [
    {
      title: "Date & time",
      dataIndex: "timestamp",
      key: "timestamp",
      render: (v) => (
        <span className="text-slate-500 text-sm tabular-nums">{v}</span>
      ),
    },
    {
      title: "Admin",
      dataIndex: "admin",
      key: "admin",
      render: (v) => <span className="font-medium text-slate-800">{v}</span>,
    },
    { title: "Action", dataIndex: "action", key: "action" },
    {
      title: "Tier",
      dataIndex: "tier",
      key: "tier",
      render: (v) => <Tag>{v}</Tag>,
    },
    {
      title: "Previous",
      dataIndex: "previous",
      key: "previous",
      render: (v) => <span className="text-slate-400 tabular-nums">{v}</span>,
    },
    {
      title: "New",
      dataIndex: "next",
      key: "next",
      render: (v) => (
        <span className="font-semibold text-slate-900 tabular-nums">{v}</span>
      ),
    },
    { title: "Affected", dataIndex: "affected", key: "affected" },
  ];
  return (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={entries}
      pagination={{ pageSize: 8 }}
    />
  );
}

/* ------------------------------------------------------------------ */

export default function Plans() {
  const { allPlan, isLoading: plansLoading, refetch: refetchPlans } = usePlanData();
  const { overrides: apiOverrides, isLoading: overridesLoading, refetch: refetchOverrides } = useOverridesData();
  const { auditLog: apiAudit, isLoading: auditLoading, refetch: refetchAudit } = usePlanAuditLog();

  const [priceModalTier, setPriceModalTier] = useState(null);
  const [migrateModalTier, setMigrateModalTier] = useState(null);

  const tiers = useMemo(() => {
    if (allPlan && allPlan.length > 0) {
      return allPlan.map((p) => ({
        ...p,
        icon: tierIcons[p.key] || <RiBuilding2Line />,
      }));
    }
    return seedTiers;
  }, [allPlan]);

  const overrides = apiOverrides && apiOverrides.length > 0 ? apiOverrides : seedOverrides;
  const audit = apiAudit && apiAudit.length > 0 ? apiAudit : seedAudit;

  const totalActiveSubs = useMemo(
    () =>
      tiers.reduce(
        (s, t) => s + (t.history?.reduce((s2, h) => s2 + (h.subscribers || 0), 0) || 0),
        0,
      ),
    [tiers],
  );

  const handleCreatePrice = async (tierKey, amount, setup) => {
    try {
      await createPriceApi({ planType: tierKey, amount, setupFee: setup });
      message.success("New Stripe price created — applies to new sign-ups only");
      refetchPlans();
      refetchAudit();
    } catch (err) {
      message.error(err?.response?.data?.message || "Failed to create price");
      throw err;
    }
  };

  const handleMigrate = async (tierKey, priceId, mode) => {
    try {
      await migrateSubscribersApi({ planType: tierKey, priceId, mode });
      refetchPlans();
      refetchAudit();
    } catch (err) {
      message.error(err?.response?.data?.message || "Migration failed");
      throw err;
    }
  };

  const handleAddOverride = async (o) => {
    try {
      await createOverrideApi(o);
      refetchOverrides();
      refetchAudit();
    } catch (err) {
      message.error(err?.response?.data?.message || "Failed to apply override");
      throw err;
    }
  };

  const handleDeleteOverride = async (overrideId) => {
    try {
      await deleteOverrideApi(overrideId);
      message.success("Override removed");
      refetchOverrides();
      refetchAudit();
    } catch (err) {
      message.error(err?.response?.data?.message || "Failed to remove override");
    }
  };

  return (
    <div className="">
      <div className="flex flex-col gap-8">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1
              className="text-[34px] text-neutral-900"
              style={{ fontFamily: "'Georgia', 'Playfair Display', serif" }}
            >
              Plans and pricing management
            </h1>
            <p className="text-neutral-500 mt-1 text-[14.5px]">
              All changes flow through Stripe — the subscription there is always
              the source of truth. Nothing on this page edits a database record
              directly.
            </p>
          </div>
          {plansLoading && (
            <div className="text-xs text-neutral-400 flex items-center gap-1.5">
              <Spin size="small" /> Syncing with Stripe...
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {tiers.map((tier) => (
            <TierOverviewCard
              key={tier.key}
              tier={tier}
              onUpdatePrice={setPriceModalTier}
              onMigrate={setMigrateModalTier}
            />
          ))}
        </div>

        <div className="rounded-lg bg-indigo-50 border border-indigo-100 px-4 py-3 text-sm text-indigo-800 flex items-start gap-2">
          <RiCheckboxCircleLine className="mt-0.5 shrink-0" />
          <span>
            Enterprise is the only tier with multi-location access — that's
            enforced in code on every other tier, and Enterprise sign-up itself
            is never self-serve; it's set up by an admin after the deal is
            agreed.
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <Tabs
            defaultActiveKey="overrides"
            items={[
              {
                key: "overrides",
                label: (
                  <span className="flex items-center gap-1.5">
                    <RiUserSettingsLine /> Per-clinic pricing
                  </span>
                ),
                children: (
                  <OverridesPanel
                    overrides={overrides}
                    tiers={tiers}
                    onAdd={handleAddOverride}
                    onDelete={handleDeleteOverride}
                  />
                ),
              },
              {
                key: "audit",
                label: (
                  <span className="flex items-center gap-1.5">
                    <RiFileList3Line /> Audit log
                  </span>
                ),
                children: <AuditLogPanel entries={audit} />,
              },
            ]}
          />
        </div>
      </div>

      <UpdatePriceModal
        tier={priceModalTier}
        open={!!priceModalTier}
        onClose={() => setPriceModalTier(null)}
        onCreate={handleCreatePrice}
      />
      <MigrateModal
        tier={migrateModalTier}
        open={!!migrateModalTier}
        onClose={() => setMigrateModalTier(null)}
        onMigrate={handleMigrate}
      />
    </div>
  );
}
