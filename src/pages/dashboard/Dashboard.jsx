import React from 'react'
import { Button, Table, Tag, Avatar } from 'antd'
import { FiArrowUpRight } from 'react-icons/fi'
import { HiOutlineArrowTrendingUp, HiOutlineArrowTrendingDown } from 'react-icons/hi2'
import { LineChart, Line, ResponsiveContainer } from 'recharts'

// ---------------------------------------------------------------------------
// Fake data
// ---------------------------------------------------------------------------

const sparkline = (points) => points.map((v, i) => ({ i, v }))

const statCards = [
  {
    label: 'Monthly Recurring Revenue',
    value: '£41,940',
    delta: '+£3,994 this month',
    trend: 'up',
    color: '#1F9D6B',
    data: sparkline([12, 16, 15, 20, 24, 28, 34, 38]),
  },
  {
    label: 'Active Clinics',
    value: '21',
    delta: '+2 this month',
    trend: 'up',
    color: '#141414',
    data: sparkline([10, 11, 13, 14, 15, 17, 19, 21]),
  },
  {
    label: 'Leads (30d, all clinics)',
    value: '3,180',
    delta: '18% vs last month',
    trend: 'up',
    color: '#C9A24B',
    data: sparkline([22, 24, 21, 26, 30, 27, 33, 31]),
  },
  {
    label: 'Net Revenue Churn',
    value: '1.8%',
    delta: 'Improving',
    trend: 'down',
    color: '#E07A3F',
    data: sparkline([30, 28, 29, 25, 22, 20, 19, 18]),
  },
]

const planTiers = [
  { name: 'Solo', clinics: 6, value: 8982, max: 21967, color: '#C9A24B' },
  { name: 'Growth', clinics: 11, value: 21967, max: 21967, color: '#8B3FE8' },
  { name: 'Pro', clinics: 4, value: 11988, max: 21967, color: '#E8722F' },
]

// const metrics = [
//   { label: 'ARPU', value: '£1,997' },
//   { label: 'LTV (Est.)', value: '£28,400' },
//   { label: 'Trials Live', value: '3' },
// ]

const clinics = [
  {
    key: '1',
    initials: 'BS',
    bg: '#141414',
    name: 'Bright Smile Dental',
    location: 'Oxford',
    plan: 'Growth',
    leads: 148,
    bookings: 41,
    mrr: '£1,997',
    status: 'Active',
  },
  {
    key: '2',
    initials: 'KO',
    bg: '#3D2C8D',
    name: 'Kensington Orthodontics',
    location: 'London',
    plan: 'Pro',
    leads: 132,
    bookings: 38,
    mrr: '£2,997',
    status: 'Active',
  },
  {
    key: '3',
    initials: 'HD',
    bg: '#141414',
    name: 'Harbourside Dental',
    location: 'Bristol',
    plan: 'Growth',
    leads: 119,
    bookings: 33,
    mrr: '£1,997',
    status: 'Active',
  },
]

const planTagStyle = {
  Growth: { color: '#8B3FE8', bg: '#F3E8FE', border: '#E6D3FB' },
  Pro: { color: '#B5690B', bg: '#FCEED9', border: '#F6DDB6' },
  Solo: { color: '#8A6A1F', bg: '#F6EFD9', border: '#EDDDAF' },
}

// ---------------------------------------------------------------------------
// Small building blocks
// ---------------------------------------------------------------------------

function TrendBadge({ trend, children }) {
  const isUp = trend === 'up'
  const color = isUp ? '#1F9D6B' : '#E07A3F'
  const Icon = isUp ? HiOutlineArrowTrendingUp : HiOutlineArrowTrendingDown
  return (
    <span
      className="inline-flex items-center gap-1 text-[12.5px] font-medium"
      style={{ color }}
    >
      <Icon size={13} />
      {children}
    </span>
  )
}

function StatCard({ label, value, delta, trend, color, data }) {
  return (
    <div className="bg-white rounded-xl px-5 pt-5 pb-4 flex flex-col shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <span className="text-[12.5px] tracking-wide text-neutral-400 font-mono">
        {label}
      </span>
      <span
        className="mt-2 text-[28px] leading-none text-neutral-900"
        style={{ fontFamily: "'Georgia', 'Playfair Display', serif" }}
      >
        {value}
      </span>
      <div className="mt-2">
        <TrendBadge trend={trend}>{delta}</TrendBadge>
      </div>
      <div className="h-10 mt-3 -mx-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <Line
              type="monotone"
              dataKey="v"
              stroke={color}
              strokeWidth={1.75}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function SectionButton({ children }) {
  return (
    <Button
      size="middle"
      className="!flex !items-center !gap-1 !rounded-lg !border-neutral-200 !text-neutral-700 !text-[13px] !font-medium"
    >
      {children}
      <FiArrowUpRight size={14} />
    </Button>
  )
}

function PlanTierRow({ tier }) {
  const pct = Math.round((tier.value / tier.max) * 100)
  return (
    <div className="py-4">
      <div className="flex items-baseline justify-between">
        <div className="flex items-baseline gap-2">
          <span className="text-[14.5px] font-semibold text-neutral-900">
            {tier.name}
          </span>
          <span className="text-[13px] text-neutral-400">
            · {tier.clinics} clinics
          </span>
        </div>
        <span className="text-[14.5px] font-semibold text-neutral-900">
          £{tier.value.toLocaleString()}
        </span>
      </div>
      <div className="mt-2 h-[6px] w-full rounded-full bg-neutral-100 overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${pct}%`, backgroundColor: tier.color }}
        />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

function Dashboard() {
  const columns = [
    {
      title: 'Clinic',
      dataIndex: 'name',
      key: 'name',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <Avatar
            size={32}
            style={{ backgroundColor: row.bg, fontSize: 11, fontWeight: 600 }}
          >
            {row.initials}
          </Avatar>
          <span className="font-semibold text-neutral-900 text-[14px]">
            {row.name}
          </span>
        </div>
      ),
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
      render: (v) => <span className="text-neutral-500">{v}</span>,
    },
    {
      title: 'Plan',
      dataIndex: 'plan',
      key: 'plan',
      render: (plan) => {
        const s = planTagStyle[plan]
        return (
          <Tag
            style={{
              color: s.color,
              backgroundColor: s.bg,
              borderColor: s.border,
              borderRadius: 999,
              fontWeight: 600,
              fontSize: 12,
              padding: '1px 10px',
            }}
          >
            {plan}
          </Tag>
        )
      },
    },
    {
      title: 'Leads',
      dataIndex: 'leads',
      key: 'leads',
      render: (v) => <span className="text-neutral-800">{v}</span>,
    },
    {
      title: 'Bookings',
      dataIndex: 'bookings',
      key: 'bookings',
      render: (v) => <span className="text-neutral-800">{v}</span>,
    },
    {
      title: 'MRR',
      dataIndex: 'mrr',
      key: 'mrr',
      render: (v) => <span className="text-neutral-800">{v}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (v) => (
        <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          {v}
        </span>
      ),
    },
  ]

  return (
    <div className="min-h-screen w-full">
      <div className="">
        {/* Header */}
        <h1
          className="text-[34px] text-neutral-900"
          style={{ fontFamily: "'Georgia', 'Playfair Display', serif" }}
        >
          Platform overview
        </h1>
        <p className="text-neutral-500 mt-1 text-[14.5px]">
          Every clinic, every lead, every pound of recurring revenue across DistalFlo.
        </p>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {statCards.map((c) => (
            <StatCard key={c.label} {...c} />
          ))}
        </div>

        {/* MRR by plan tier */}
        <div className="bg-white rounded-xl mt-4 px-6 py-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-[17px] font-semibold text-neutral-900">
                MRR by plan tier
              </h2>
              <p className="text-[13px] text-neutral-400 mt-0.5">
                21 clinics · £41,940 total
              </p>
            </div>
            <SectionButton>Billing</SectionButton>
          </div>

          <div className="mt-2 divide-y divide-neutral-100">
            {planTiers.map((tier) => (
              <PlanTierRow key={tier.name} tier={tier} />
            ))}
          </div>

          {/* <div className="grid grid-cols-3 mt-4 pt-5 border-t border-neutral-100">
            {metrics.map((m) => (
              <div key={m.label}>
                <span className="text-[12.5px] text-neutral-400 font-mono tracking-wide">
                  {m.label}
                </span>
                <div
                  className="mt-1 text-[19px] text-neutral-900"
                  style={{ fontFamily: "'Georgia', 'Playfair Display', serif" }}
                >
                  {m.value}
                </div>
              </div>
            ))}
          </div> */}
        </div>

        {/* Top clinics by leads */}
        <div className="bg-white rounded-xl mt-4 px-6 py-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-[17px] font-semibold text-neutral-900">
                Top clinics by leads
              </h2>
              <p className="text-[13px] text-neutral-400 mt-0.5">Last 30 days</p>
            </div>
            <SectionButton>All clinics</SectionButton>
          </div>

          <Table
            columns={columns}
            dataSource={clinics}
            pagination={false}
            rowKey="key"
          />
        </div>
      </div>
    </div>
  )
}

export default Dashboard