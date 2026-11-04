import React from 'react'
import { Table } from 'antd'
import { FiDownload } from 'react-icons/fi'

const dataSource = [
  {
    key: '1',
    clinic: 'Kensington Orthodontics',
    plan: 'Pro',
    mrr: '£2,997',
    lifetime: '£17,982',
    nextCharge: '18 Jun',
    status: 'Active',
  },
  {
    key: '2',
    clinic: 'Bright Smile Dental',
    plan: 'Growth',
    mrr: '£1,997',
    lifetime: '£7,988',
    nextCharge: '1 Jul',
    status: 'Active',
  },
  {
    key: '3',
    clinic: 'Harbourside Dental',
    plan: 'Growth',
    mrr: '£1,997',
    lifetime: '£9,985',
    nextCharge: '1 Jul',
    status: 'Active',
  },
  {
    key: '4',
    clinic: 'Maple Dental',
    plan: 'Solo',
    mrr: '£1,497',
    lifetime: '£4,491',
    nextCharge: '19 Jun',
    status: 'Grace',
  },
  {
    key: '5',
    clinic: 'Cathedral Dental',
    plan: 'Solo',
    mrr: '£1,497',
    lifetime: '£2,994',
    nextCharge: '5 Jul',
    status: 'Active',
  },
]

const planStyles = {
  Pro: 'bg-orange-50 text-orange-500',
  Growth: 'bg-violet-50 text-violet-500',
  Solo: 'bg-emerald-50 text-emerald-500',
}

const statusDotStyles = {
  Active: 'bg-emerald-500',
  Grace: 'bg-orange-500',
}

const statusTextStyles = {
  Active: 'text-gray-700',
  Grace: 'text-orange-500',
}

const columns = [
  {
    title: 'Clinic',
    dataIndex: 'clinic',
    key: 'clinic',
    render: (text) => <span className="text-[15px] font-semibold text-gray-900">{text}</span>,
  },
  {
    title: 'Plan',
    dataIndex: 'plan',
    key: 'plan',
    render: (plan) => (
      <span className={`inline-flex items-center rounded-md px-3 py-1 text-xs font-semibold ${planStyles[plan]}`}>
        {plan}
      </span>
    ),
  },
  {
    title: 'MRR',
    dataIndex: 'mrr',
    key: 'mrr',
    render: (text) => <span className="text-sm text-gray-900">{text}</span>,
  },
  {
    title: 'Lifetime',
    dataIndex: 'lifetime',
    key: 'lifetime',
    render: (text) => <span className="text-sm text-gray-500">{text}</span>,
  },
  {
    title: 'Next Charge',
    dataIndex: 'nextCharge',
    key: 'nextCharge',
    render: (text) => <span className="text-sm text-gray-500">{text}</span>,
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (status) => (
      <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${statusTextStyles[status]}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${statusDotStyles[status]}`} />
        {status}
      </span>
    ),
  },
]

export default function RevenueByClinic() {
  return (
    <div className="w-full rounded-2xl border border-gray-100 bg-white p-6 shadow-sm mt-4">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Revenue by clinic</h2>
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          <FiDownload className="h-4 w-4" />
          Statement
        </button>
      </div>

      {/* Antd Table */}
      <Table
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        className="revenue-clinic-table"
      />

      <style>{`
        .revenue-clinic-table .ant-table {
          background: transparent;
        }
        .revenue-clinic-table .ant-table-thead > tr > th {
          background: transparent;
          border-bottom: 1px solid #f3f4f6;
          color: #9ca3af;
          font-size: 11px;
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 400;
          padding: 12px 16px;
        }
        .revenue-clinic-table .ant-table-thead > tr > th::before {
          display: none;
        }
        .revenue-clinic-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid #f9fafb;
          padding: 16px;
        }
        .revenue-clinic-table .ant-table-tbody > tr:last-child > td {
          border-bottom: none;
        }
        .revenue-clinic-table .ant-table-tbody > tr:hover > td {
          background: #fafafa !important;
        }
      `}</style>
    </div>
  )
}