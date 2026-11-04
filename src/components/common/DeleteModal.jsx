import React, { useState } from "react";
import { Button, Input, Modal, Tooltip, message } from "antd";
import { FiAlertTriangle, FiTrash2, FiClock, FiX } from "react-icons/fi";
import { API } from "../../api/api";
import { invalidateQueries } from "../../hooks/invalidateQueries";

export default function DeleteModal({
  id,
  api_endpoint,
  queryKey,
  title,
  message: confirmMessage,
  typeText = "User",
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("confirm"); // confirm | success

  const showModal = () => {
    setIsModalOpen(true);
    setConfirmText("");
    setStep("confirm");
  };

  const resetAndClose = () => {
    setConfirmText("");
    setStep("confirm");
    setLoading(false);
    setIsModalOpen(false);
  };

  const isMatch =
    confirmText.trim() === title?.trim() ||
    confirmText.trim().toUpperCase() === "DELETE";

  const handleDelete = async () => {
    if (!isMatch) {
      message.error(
        `Please type the ${typeText.toLowerCase()}'s name or DELETE to confirm.`,
      );
      return;
    }

    setLoading(true);

    try {
      await API.patch(api_endpoint, {
        id: id,
        status: "DELETED",
      });

      await invalidateQueries([queryKey]);

      message.success(`${typeText} deleted successfully!`);
      setIsModalOpen(false);

      setStep("success");
    } catch (error) {
      message.error(
        error?.response?.data?.message || "Failed to delete. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Tooltip title="Delete">
        <Button
          onClick={showModal}
          icon={<FiTrash2 size={14} />}
          danger
          className="flex items-center gap-1.5 text-[13px] rounded-full"
        ></Button>
      </Tooltip>

      <Modal
        open={isModalOpen}
        onCancel={resetAndClose}
        footer={null}
        centered
        closeIcon={<FiX className="text-gray-400" />}
        width={480}
        className="gdpr-delete-modal"
        destroyOnClose
      >
        {step === "confirm" ? (
          <div className="pt-2">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-50">
                <FiAlertTriangle className="text-red-600" size={20} />
              </div>

              <h3 className="text-[18px] font-semibold text-gray-900 m-0">
                Delete {typeText} Data
              </h3>
            </div>

            {/* Warning */}
            <p className="text-[14px] text-gray-600 leading-relaxed mb-3">
              {confirmMessage || (
                <>
                  You are about to request permanent deletion of{" "}
                  <strong className="text-gray-900">{title}</strong>. This
                  action will remove all associated data.
                </>
              )}
            </p>

            {/* 24 Hour Hold */}
            <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3 mb-4">
              <FiClock
                className="text-amber-600 mt-0.5 flex-shrink-0"
                size={16}
              />

              <p className="text-[13px] text-amber-800 leading-relaxed m-0">
                This request will enter a{" "}
                <strong>24-hour cancellable hold</strong> before permanent
                deletion is executed. You can cancel the request at any point
                during this window.
              </p>
            </div>

            {/* Confirmation Input */}
            <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
              Type <span className="font-bold">{title}</span>
              {title && " or "}
              <span className="font-bold">DELETE</span> to confirm
            </label>

            <Input
              size="large"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={
                title ? `Type "${title}" or "DELETE"` : 'Type "DELETE"'
              }
              className="rounded-lg mb-5"
              onPressEnter={handleDelete}
            />

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Button
                size="large"
                onClick={resetAndClose}
                className="rounded-lg"
                disabled={loading}
              >
                Cancel
              </Button>

              <Button
                size="large"
                danger
                type="primary"
                icon={<FiTrash2 size={14} />}
                loading={loading}
                disabled={!isMatch}
                onClick={handleDelete}
                className="rounded-lg"
              >
                Request Deletion
              </Button>
            </div>
          </div>
        ) : (
          /* Success */
          <div className="pt-2 text-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-50 mx-auto mb-4">
              <FiClock className="text-green-600" size={22} />
            </div>

            <h3 className="text-[18px] font-semibold text-gray-900 mb-2">
              Deletion Request Submitted
            </h3>

            <p className="text-[14px] text-gray-600 leading-relaxed mb-6">
              A 24-hour hold period has started for{" "}
              <strong className="text-gray-900">{title}</strong>. Data will be
              permanently deleted after the hold expires unless cancelled. An
              audit record will be created once deletion is executed.
            </p>

            <Button
              size="large"
              type="primary"
              onClick={resetAndClose}
              className="rounded-lg"
            >
              Close
            </Button>
          </div>
        )}
      </Modal>
    </>
  );
}
