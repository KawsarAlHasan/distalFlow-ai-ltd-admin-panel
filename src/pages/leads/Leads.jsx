import React from 'react'
import { Button, Table, Avatar } from 'antd'
import { FiDownload } from 'react-icons/fi'
import { HiOutlineArrowTrendingUp } from 'react-icons/hi2'

// ---------------------------------------------------------------------------
// Fake data
// ---------------------------------------------------------------------------

const statCards = [
  {
    label: 'Leads Today',
    value: '214',
    note: 'across 21 clinics',
    noteColor: '#1F9D6B',
    icon: HiOutlineArrowTrendingUp,
  },
  {
    label: 'Avg Time to Call',
    value: '4m 11s',
    note: 'Under 5-min SLA',
    noteColor: '#1F9D6B',
    icon: 'check',
  },
  {
    label: 'Platform Answer Rate',
    value: '74%',
    note: null,
  },
  {
    label: 'Booked Today',
    value: '52',
    note: null,
  },
]

const sourceTagStyle = {
  Meta: { color: '#3B5FE8', bg: '#EAEEFE' },
  Google: { color: '#2E7BD6', bg: '#E9F2FC' },
  Organic: { color: '#1F9D6B', bg: '#E7F7EF' },
}

const stageStyle = {
  Qualified: { color: '#8B3FE8', bg: '#F3E8FE' },
  Booked: { color: '#C9821F', bg: '#FCEED9' },
  Contacted: { color: '#2E7BD6', bg: '#E9F2FC' },
  New: { color: '#6B6B6B', bg: '#F0F0EF' },
  Converted: { color: '#1F9D6B', bg: '#E7F7EF' },
  Attended: { color: '#1FA0A0', bg: '#E4F6F6' },
}

const avatarColors = [
  '#C97A2E',
  '#3D2C8D',
  '#B5852E',
  '#C9821F',
  '#1F7A4D',
  '#141414',
]

const leads = [
  {
    key: '1',
    initials: 'SW',
    color: avatarColors[0],
    name: 'S. Whitman',
    clinic: 'Bright Smile',
    treatment: 'Implants',
    source: 'Meta',
    stage: 'Qualified',
    created: '4 min ago',
  },
  {
    key: '2',
    initials: 'DT',
    color: avatarColors[1],
    name: 'D. Turner',
    clinic: 'Kensington Ortho',
    treatment: 'Invisalign',
    source: 'Google',
    stage: 'Booked',
    created: '11 min ago',
  },
  {
    key: '3',
    initials: 'FH',
    color: avatarColors[2],
    name: 'F. Hughes',
    clinic: 'Harbourside',
    treatment: 'Whitening',
    source: 'Meta',
    stage: 'Contacted',
    created: '18 min ago',
  },
  {
    key: '4',
    initials: 'GP',
    color: avatarColors[3],
    name: 'G. Patel',
    clinic: 'Maple Dental',
    treatment: 'Implants',
    source: 'Google',
    stage: 'New',
    created: '22 min ago',
  },
  {
    key: '5',
    initials: 'LM',
    color: avatarColors[4],
    name: 'L. Marsh',
    clinic: 'Cathedral Dental',
    treatment: 'Implants',
    source: 'Organic',
    stage: 'Converted',
    created: '1 hr ago',
  },
  {
    key: '6',
    initials: 'RB',
    color: avatarColors[5],
    name: 'R. Bell',
    clinic: 'Bright Smile',
    treatment: 'Invisalign',
    source: 'Google',
    stage: 'Attended',
    created: '2 hr ago',
  },
]

// ---------------------------------------------------------------------------
// Small building blocks
// ---------------------------------------------------------------------------

function StatCard({ label, value, note, noteColor, icon: Icon }) {
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
          className="mt-2 inline-flex items-center gap-1 text-[12.5px] font-medium"
          style={{ color: noteColor }}
        >
          {Icon === 'check' ? (
            <span>✓</span>
          ) : Icon ? (
            <Icon size={13} />
          ) : null}
          {note}
        </div>
      )}
    </div>
  )
}

function Pill({ text, color, bg }) {
  return (
    <span
      className="inline-block text-[12px] font-semibold px-2.5 py-0.5 rounded-full"
      style={{ color, backgroundColor: bg }}
    >
      {text}
    </span>
  )
}

function StageDot({ text, color }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[13px] font-medium" style={{ color }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
      {text}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Leads page
// ---------------------------------------------------------------------------

function Leads() {
  const columns = [
    {
      title: 'Lead',
      dataIndex: 'name',
      key: 'name',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <Avatar
            size={32}
            style={{ backgroundColor: row.color, fontSize: 11, fontWeight: 600 }}
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
      title: 'Clinic',
      dataIndex: 'clinic',
      key: 'clinic',
      render: (v) => <span className="text-neutral-600">{v}</span>,
    },
    {
      title: 'Treatment',
      dataIndex: 'treatment',
      key: 'treatment',
      render: (v) => <span className="text-neutral-600">{v}</span>,
    },
    {
      title: 'Source',
      dataIndex: 'source',
      key: 'source',
      render: (v) => {
        const s = sourceTagStyle[v]
        return <Pill text={v} color={s.color} bg={s.bg} />
      },
    },
    {
      title: 'Stage',
      dataIndex: 'stage',
      key: 'stage',
      render: (v) => {
        const s = stageStyle[v]
        return <StageDot text={v} color={s.color} />
      },
    },
    {
      title: 'Created',
      dataIndex: 'created',
      key: 'created',
      render: (v) => <span className="text-neutral-400 text-[13.5px]">{v}</span>,
    },
  ];

  return (
    <div className="">
      <div className="">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1
              className="text-[34px] text-neutral-900"
              style={{ fontFamily: "'Georgia', 'Playfair Display', serif" }}
            >
              All Leads
            </h1>
            <p className="text-neutral-500 mt-1 text-[14.5px]">
              Every lead across all tenants. For platform monitoring and support — not for outreach.
            </p>
          </div>
          <Button
            icon={<FiDownload size={14} />}
            className="!flex !items-center !gap-1.5 !rounded-lg !border-neutral-200 !text-neutral-800 !text-[13.5px] !font-medium !h-9"
          >
            Export
          </Button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {statCards.map((c) => (
            <StatCard key={c.label} {...c} />
          ))}
        </div>

        {/* Leads table */}
        <div className="bg-white rounded-xl mt-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden">
          <Table
            columns={columns}
            dataSource={leads}
            pagination={false}
            rowKey="key"
          />

          <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-100">
            <span className="text-[13.5px] text-neutral-400">
              Showing 1–6 of 3,180
            </span>
            <div className="flex gap-2">
              <Button className="!rounded-lg !border-neutral-200 !text-neutral-700 !text-[13px]">
                Previous
              </Button>
              <Button className="!rounded-lg !border-neutral-200 !text-neutral-700 !text-[13px]">
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Leads