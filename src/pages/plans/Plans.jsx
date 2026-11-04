// frontend and fake data:
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
} from "react-icons/ri";

/* ------------------------------------------------------------------ */
/*  Fake data layer — nothing here talks to Stripe or a database.     */
/*  Every write goes through local state so the flow behaves like the */
/*  real thing (new Price object → optional migration → audit entry)  */
/*  without touching anything live.                                   */
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
  }).format(n);

/* ------------------------------------------------------------------ */

function TierOverviewCard({ tier, onUpdatePrice, onMigrate }) {
  const active = tier.history.find((h) => h.status === "active");
  const legacy = tier.history.filter((h) => h.status === "legacy");
  const totalSubs = tier.history.reduce((s, h) => s + h.subscribers, 0);

  return (
    <div className="relative flex flex-col rounded-xl border border-slate-200 bg-white overflow-hidden">
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
              {tier.icon}
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
            {active.subscribers}
          </span>
        </div>

        {legacy.length > 0 && (
          <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800 flex items-start gap-2">
            <RiHistoryLine className="mt-0.5 shrink-0" />
            <span>
              {legacy.reduce((s, l) => s + l.subscribers, 0)} subscriber(s)
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

  if (!tier) return null;

  return (
    <Modal
      title={`Update price — ${tier.name}`}
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
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
          amount: tier.history.find((h) => h.status === "active")?.amount,
          setup: tier.history.find((h) => h.status === "active")?.setup,
        }}
        onFinish={(values) => {
          onCreate(tier.key, values.amount, values.setup);
          form.resetFields();
          onClose();
        }}
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
  if (!tier) return null;
  const legacy = tier.history.filter((h) => h.status === "legacy");
  const active = tier.history.find((h) => h.status === "active");

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
              onConfirm={() => {
                onMigrate(tier.key, l.id, mode);
                message.success(
                  mode === "migrate"
                    ? "Subscribers migrated"
                    : "Price grandfathered",
                );
                onClose();
              }}
            >
              <Button danger={mode === "migrate"} block icon={<RiAlertLine />}>
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

function OverridesPanel({ overrides, tiers, onAdd }) {
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);

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
      render: (v) => <Tag>{tiers.find((t) => t.key === v)?.name}</Tag>,
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
      key: "flag",
      render: () => (
        <Tag color="gold" className="flex items-center gap-1 w-fit">
          <RiPriceTag3Line /> Custom price
        </Tag>
      ),
    },
  ];

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
        okText="Apply via Stripe"
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => {
            const standard =
              tiers
                .find((t) => t.key === values.tier)
                ?.history.find((h) => h.status === "active")?.amount ?? 0;
            onAdd({
              clinic: values.clinic,
              tier: values.tier,
              standardPrice: standard,
              overridePrice: values.overridePrice,
              reason: values.reason,
            });
            form.resetFields();
            setOpen(false);
            message.success("Override applied");
          }}
        >
          <Form.Item
            label="Clinic name"
            name="clinic"
            rules={[{ required: true }]}
          >
            <Input placeholder="e.g. Riverside Dental Group" />
          </Form.Item>
          <Form.Item label="Tier" name="tier" rules={[{ required: true }]}>
            <Select
              options={tiers.map((t) => ({ value: t.key, label: t.name }))}
            />
          </Form.Item>
          <Form.Item
            label="Override price (£/mo)"
            name="overridePrice"
            rules={[{ required: true }]}
          >
            <InputNumber className="w-full" min={0} step={50} />
          </Form.Item>
          <Form.Item
            label="Reason (internal note)"
            name="reason"
            rules={[{ required: true }]}
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
  const [tiers, setTiers] = useState(seedTiers);
  const [overrides, setOverrides] = useState(seedOverrides);
  const [audit, setAudit] = useState(seedAudit);

  const [priceModalTier, setPriceModalTier] = useState(null);
  const [migrateModalTier, setMigrateModalTier] = useState(null);

  const totalActiveSubs = useMemo(
    () =>
      tiers.reduce(
        (s, t) => s + t.history.reduce((s2, h) => s2 + h.subscribers, 0),
        0,
      ),
    [tiers],
  );

  const handleCreatePrice = (tierKey, amount, setup) => {
    setTiers((prev) =>
      prev.map((t) => {
        if (t.key !== tierKey) return t;
        const newEntry = {
          id: `price_${tierKey}_${Date.now()}`,
          amount,
          setup,
          createdAt: new Date().toISOString().slice(0, 10),
          status: "active",
          subscribers: 0,
        };
        return {
          ...t,
          history: [
            newEntry,
            ...t.history.map((h) =>
              h.status === "active" ? { ...h, status: "legacy" } : h,
            ),
          ],
        };
      }),
    );
    const tier = tiers.find((t) => t.key === tierKey);
    const prevActive = tier.history.find((h) => h.status === "active");
    setAudit((prev) => [
      {
        id: `a_${Date.now()}`,
        admin: "You",
        action: "New price created",
        tier: tier.name,
        previous: prevActive ? `${gbp(prevActive.amount)}/mo` : "—",
        next: `${gbp(amount)}/mo`,
        affected: "New sign-ups only",
        timestamp: new Date().toLocaleString("en-GB").replace(",", ""),
      },
      ...prev,
    ]);
    message.success("New Stripe price created — applies to new sign-ups only");
  };

  const handleMigrate = (tierKey, priceId, mode) => {
    setTiers((prev) =>
      prev.map((t) => {
        if (t.key !== tierKey) return t;
        if (mode === "grandfather") {
          return {
            ...t,
            history: t.history.map((h) =>
              h.id === priceId ? { ...h, status: "legacy" } : h,
            ),
          };
        }
        const legacyEntry = t.history.find((h) => h.id === priceId);
        const activeEntry = t.history.find((h) => h.status === "active");
        if (!legacyEntry || !activeEntry) return t;
        return {
          ...t,
          history: t.history.map((h) => {
            if (h.id === activeEntry.id)
              return {
                ...h,
                subscribers: h.subscribers + legacyEntry.subscribers,
              };
            if (h.id === legacyEntry.id) return { ...h, subscribers: 0 };
            return h;
          }),
        };
      }),
    );
    const tier = tiers.find((t) => t.key === tierKey);
    const legacyEntry = tier.history.find((h) => h.id === priceId);
    const activeEntry = tier.history.find((h) => h.status === "active");
    setAudit((prev) => [
      {
        id: `a_${Date.now()}`,
        admin: "You",
        action:
          mode === "migrate" ? "Subscribers migrated" : "Price grandfathered",
        tier: tier.name,
        previous: legacyEntry ? `${gbp(legacyEntry.amount)}/mo` : "—",
        next:
          mode === "migrate"
            ? `${activeEntry ? gbp(activeEntry.amount) : "—"}/mo`
            : `${legacyEntry ? gbp(legacyEntry.amount) : "—"}/mo (locked)`,
        affected: `${legacyEntry?.subscribers ?? 0} subscriber(s)`,
        timestamp: new Date().toLocaleString("en-GB").replace(",", ""),
      },
      ...prev,
    ]);
  };

  const handleAddOverride = (o) => {
    setOverrides((prev) => [{ ...o, id: `ov_${Date.now()}` }, ...prev]);
    setAudit((prev) => [
      {
        id: `a_${Date.now()}`,
        admin: "You",
        action: "Per-clinic override applied",
        tier: tiers.find((t) => t.key === o.tier)?.name ?? o.tier,
        previous: `${gbp(o.standardPrice)}/mo`,
        next: `${gbp(o.overridePrice)}/mo`,
        affected: o.clinic,
        timestamp: new Date().toLocaleString("en-GB").replace(",", ""),
      },
      ...prev,
    ]);
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
