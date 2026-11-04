import React, { useState } from "react";
import { Avatar, Button, Table, Tooltip, Modal, Empty, message } from "antd";
import { FiRotateCcw, FiTrash2 } from "react-icons/fi";
import { useAllAdmins } from "../../api/adminApi";
import TableStateHandler from "../../components/TableStateHandler";
import { API } from "../../api/api";
import { invalidateQueries } from "../../hooks/invalidateQueries";
// import DeletePermanently from "../../components/DeletePermanently";

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

const avatarPalette = [
  { bg: "#FDE8D7", color: "#C2703D" },
  { bg: "#DCEAFB", color: "#3B6FB6" },
  { bg: "#E4F5E9", color: "#3E9160" },
  { bg: "#F3E3F7", color: "#8B4FA6" },
  { bg: "#FCE4E4", color: "#C24848" },
];

// ---------------------------------------------------------------------------
// AdminBin
// ---------------------------------------------------------------------------

export default function AdminBin() {
  const [open, setOpen] = useState(false);

  const status = "DELETED";
  const {
    allAdmins = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useAllAdmins(status);

  const handleRestore = async (record) => {
    try {
      // Replace with your actual API call
      await API.patch("/admin/update-status", {
        id: record.id,
        status: "ACTIVE",
      });
      await invalidateQueries(["allAdmins"]);

      message.success(`${record.name || "Admin"} restored successfully`);
    } catch (err) {
      console.error("Restore failed:", err);
      message.error(err?.response?.data?.message || "Failed to restore admin");
    }
  };

  const columns = [
    {
      title: "Member",
      key: "member",
      width: 240,
      render: (_, record, index) => {
        const palette = avatarPalette[index % avatarPalette.length];
        return (
          <div className="flex items-center gap-3">
            <Avatar
              size={34}
              src={record.profilePic || undefined}
              style={
                !record.profilePic
                  ? {
                      backgroundColor: palette.bg,
                      color: palette.color,
                      fontWeight: 600,
                    }
                  : undefined
              }
              className="!flex !items-center !justify-center !font-medium"
            >
              {getInitials(record.name, record.email)}
            </Avatar>

            <span className="font-semibold text-neutral-900 text-[14px]">
              {record.name || "Unnamed user"}
            </span>
          </div>
        );
      },
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 260,
      render: (email) => (
        <span className="text-neutral-500 text-[14px]">{email}</span>
      ),
      align: "center",
    },
    {
      title: "Role",
      dataIndex: "roleName",
      key: "roleName",
      width: 150,
      render: (roleName) => (
        <span className="text-neutral-600 text-[13.5px] font-medium">
          {roleName}
        </span>
      ),
      align: "center",
    },
    {
      title: "Deleted At",
      dataIndex: "deletedAt",
      key: "deletedAt",
      width: 160,
      render: (deletedAt) => (
        <span className="text-[13px] font-mono text-neutral-500">
          {deletedAt ? new Date(deletedAt).toLocaleString() : "—"}
        </span>
      ),
      align: "center",
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      align: "right",
      render: (_, record) => (
        <div className="flex justify-end items-center gap-2">
          <Tooltip title="Restore">
            <Button
              onClick={() => handleRestore(record)}
              icon={<FiRotateCcw size={14} />}
              className="!flex !items-center !gap-1.5 !text-[13px] !rounded-full !text-emerald-600 !border-emerald-200 hover:!text-emerald-700 hover:!border-emerald-300"
            />
          </Tooltip>

          <Tooltip title="Delete permanently">
            {/* <DeletePermanently
              lead={record}
              onConfirm={() => refetch()}
              BTN={
                <Button
                  icon={<FiTrash2 size={14} />}
                  danger
                  className="!flex !items-center !gap-1.5 !text-[13px] !rounded-full"
                />
              }
            /> */}
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="group relative !flex !items-center !gap-2 !h-9 !pl-3.5 !pr-4 !rounded-lg
          !text-[13.5px] !font-medium !text-neutral-500
          !bg-white !border !border-neutral-200
          !shadow-[0_1px_2px_rgba(0,0,0,0.04)]
          hover:!text-red-600 hover:!border-red-200
          transition-all duration-300 ease-out"
      >
        <FiTrash2 size={14} />
        Recycle Bin
      </Button>

      <Modal
        title={
          <div>
            <h2 className="text-[17px] font-semibold text-neutral-900">
              Recycle Bin
            </h2>
            <p className="text-[13px] font-normal text-neutral-500 mt-0.5">
              Deleted team members. Restore them or remove them permanently.
            </p>
          </div>
        }
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        width={900}
        destroyOnClose
      >
        <div className="mt-4">
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
                    description="Recycle bin is empty"
                  />
                ),
              }}
              scroll={{ x: 700 }}
              className="admin-bin-table"
            />
          </TableStateHandler>
        </div>
      </Modal>
    </>
  );
}
