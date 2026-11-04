import { useState } from "react";
import { Button, Modal, Form, Input, message } from "antd";
import { SettingOutlined } from "@ant-design/icons";
import { API } from "../api/api";

const ChangePassword = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const showModal = () => setIsModalOpen(true);
  const handleCancel = () => setIsModalOpen(false);

  const handleFinish = async (values) => {
    try {
      setLoading(true);

      await API.put("/auth/admin/change-password", values);

      message.success("Password changed successfully!");
      setIsModalOpen(false);
    } catch (err) {
      message.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        onClick={showModal}
        className="flex items-center gap-2 px-1 py-2 cursor-pointer"
      >
        <SettingOutlined /> Change Password
      </div>

      <Modal
        title="Change Password"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null} // we'll use Form submit button instead
      >
        <Form layout="vertical" onFinish={handleFinish}>
          <Form.Item
            label="Old Password"
            name="oldPassword"
            rules={[
              { required: true, message: "Please enter your old password" },
            ]}
          >
            <Input.Password placeholder="Enter your old password" />
          </Form.Item>

          <Form.Item
            label="New Password"
            name="newPassword"
            rules={[
              { required: true, message: "Password is required." },
              {
                pattern: /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/,
                message:
                  "At least 8 chars, 1 uppercase, 1 number & 1 special char",
              },
            ]}
          >
            <Input.Password placeholder="Enter your new password" />
          </Form.Item>

          <Form.Item
            label="Retype New Password"
            name="retype_new_password"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "Please retype your new password" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Passwords do not match!"));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Retype your new password" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              className="my-main-button"
              htmlType="submit"
              size="large"
              loading={loading}
              block
            >
              Change Password
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ChangePassword;
