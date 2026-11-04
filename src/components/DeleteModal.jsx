import React, { useState } from "react";
import { Button, Modal, message } from "antd";
import { DeleteOutlined, ExclamationCircleOutlined } from "@ant-design/icons";

function DeleteModal({ api_endpoint, type, title, refetch }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const showModal = () => setIsModalOpen(true);
  const handleCancel = () => !loading && setIsModalOpen(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      // TODO: replace with your real API call
      // await DeleteModal(api_endpoint);

      // Simulate API delay
      await new Promise((res) => setTimeout(res, 800));

      message.success(`${type} deleted successfully!`);
      refetch?.();
      setIsModalOpen(false);
    } catch (err) {
      console.error("Delete failed:", err);
      message.error(`Failed to delete ${type}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        type="primary"
        icon={<DeleteOutlined />}
        title={`Delete ${type}`}
        danger
        onClick={showModal}
      />

      <Modal
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        width={420}
        centered
        closeIcon={null}
        styles={{
          content: { borderRadius: 18, overflow: "hidden", padding: 0 },
          body: { padding: 0 },
        }}
      >
        <div className="flex flex-col items-center px-8 pt-8 pb-6 text-center">
          {/* Icon */}
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <DeleteOutlined style={{ fontSize: 20, color: "#ef4444" }} />
            </div>
          </div>

          {/* Text */}
          <h3 className="text-lg font-bold text-slate-800 mb-1">
            Delete {type}?
          </h3>
          <p className="text-slate-400 text-sm mb-1">You are about to delete</p>
          <p className="text-slate-700 font-semibold text-sm mb-4 max-w-[280px] truncate">
            "{title}"
          </p>
          <p className="text-slate-400 text-xs mb-7">
            This action cannot be undone.
          </p>

          {/* Actions */}
          <div className="flex gap-3 w-full">
            <button
              onClick={handleCancel}
              disabled={loading}
              className="flex-1 h-11 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="flex-1 h-11 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin w-4 h-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  Deleting...
                </>
              ) : (
                <>
                  <DeleteOutlined />
                  Yes, Delete
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default DeleteModal;
