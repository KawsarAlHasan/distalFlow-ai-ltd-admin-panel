import React, { useState } from "react";
import { Button, Table, Tag, Avatar, Empty, Spin, Alert } from "antd";
import { FiPlus } from "react-icons/fi";
import InviteModal from "./InviteModal";
import { useAllAdmins } from "../../api/adminApi";
import TableStateHandler from "../../components/TableStateHandler";
import DeleteModal from "../../components/common/DeleteModal";
import AdminBin from "./AdminBin";

// ---------------------------------------------------------------------------
// Role styles
// ---------------------------------------------------------------------------

const roleTagStyle = {
  "Super Admin": {
    color: "#B5690B",
    background: "#FCEED9",
    borderColor: "#FCEED9",
  },
  Success: {
    color: "#8B3FE8",
    background: "#F3E8FE",
    borderColor: "#F3E8FE",
  },
  Support: {
    color: "#1F9D6B",
    background: "#E7F7EF",
    borderColor: "#E7F7EF",
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const getInitials = (name, email) => {
  if (name) {
    return name
      .trim()
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word.charAt(0).toUpperCase())
      .join("");
  }

  return email?.charAt(0).toUpperCase() || "?";
};

const getRoleStyle = (role) => {
  return (
    roleTagStyle[role] || {
      color: "#525252",
      background: "#F5F5F5",
      borderColor: "#F5F5F5",
    }
  );
};

// ---------------------------------------------------------------------------
// Settings page
// ---------------------------------------------------------------------------

function Settings() {
  const [inviteOpen, setInviteOpen] = useState(false);

  const { allAdmins = [], isLoading, isError, error, refetch } = useAllAdmins();

  const columns = [
    {
      title: "Member",
      key: "member",
      width: 240,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar
            size={34}
            src={record.profilePic || undefined}
            className="!flex !items-center !justify-center !font-medium"
          >
            {getInitials(record.name, record.email)}
          </Avatar>

          <span className="font-semibold text-neutral-900 text-[14px]">
            {record.name || "Unnamed user"}
          </span>
        </div>
      ),
      // align: "center",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 320,
      render: (email) => (
        <span className="text-neutral-500 text-[14px]">{email}</span>
      ),
      align: "center",
    },
    {
      title: "Role",
      dataIndex: "roleName",
      key: "roleName",
      width: 180,
      render: (roleName) => {
        const style = getRoleStyle(roleName);

        return (
          <Tag
            className="!rounded-full !px-2.5 !py-0.5 !text-[12px] !font-semibold !mr-0"
            style={{
              color: style.color,
              backgroundColor: style.background,
              borderColor: style.borderColor,
            }}
          >
            {roleName}
          </Tag>
        );
      },
      align: "center",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 150,
      render: (status) => (
        <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-emerald-700">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          {status === "ACTIVE" ? "Active" : status}
        </span>
      ),
      align: "center",
    },
    {
      title: <span className="mainColor">Action</span>,
      dataIndex: "action",
      key: "action",
      width: 100,
      align: "center",
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <DeleteModal
            id={record.id}
            api_endpoint={`/admin/update-status`}
            queryKey={"allAdmins"}
            title={record.name}
            message="Are you sure you want to delete this admin?"
            typeText="Admin"
          />
        </div>
      ),
    },
  ];

  return (
    <div className="">
      <div className="">
        {/* Header */}
        <h1
          className="text-[34px] text-neutral-900"
          style={{
            fontFamily: "'Georgia', 'Playfair Display', serif",
          }}
        >
          Platform settings
        </h1>

        <p className="text-neutral-500 mt-1 text-[14.5px]">
          Configure plans, pricing, the DistalFlo team and platform-wide
          integrations.
        </p>

        {/* DistalFlo team */}
        <div className="bg-white rounded-xl mt-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden">
          {/* Card header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-5">
            <h2 className="text-[17px] font-semibold text-neutral-900">
              DistalFlo team
            </h2>

            <div className="flex items-center gap-2">
              <Button
                type="primary"
                icon={<FiPlus size={14} />}
                onClick={() => setInviteOpen(true)}
                className="!flex !items-center !gap-1.5 !rounded-lg !bg-neutral-900 !border-neutral-900 !text-[13.5px] !font-medium !h-9"
              >
                Invite
              </Button>

              <AdminBin />
            </div>
          </div>

          <TableStateHandler
            isLoading={isLoading}
            isError={isError}
            error={error}
            data={allAdmins}
            onRetry={refetch}
          >
            <Table
              columns={columns}
              dataSource={allAdmins}
              rowKey={(record) => record.id}
              loading={isLoading}
              pagination={{
                pageSize: 10,
                showSizeChanger: false,
                hideOnSinglePage: true,
              }}
              locale={{
                emptyText: (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="No team members found"
                  />
                ),
              }}
              scroll={{
                x: 900,
              }}
              className="settings-admin-table"
            />
          </TableStateHandler>
        </div>
      </div>

      {/* Invite modal */}
      <InviteModal open={inviteOpen} onClose={() => setInviteOpen(false)} />
    </div>
  );
}

export default Settings;
