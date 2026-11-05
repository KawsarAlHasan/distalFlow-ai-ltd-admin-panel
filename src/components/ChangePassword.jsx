import { useState } from "react";
import { Button, Modal, Form, Input, message } from "antd";
import { SettingOutlined, LockOutlined } from "@ant-design/icons";
import { API } from "../api/api";

const ChangePassword = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const showModal = () => setIsModalOpen(true);
  const handleCancel = () => {
    form.resetFields();
    setIsModalOpen(false);
  };

  const handleFinish = async (values) => {
    try {
      setLoading(true);

      await API.put("/auth/admin/change-password", {
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });

      message.success("Password changed successfully!");
      form.resetFields();
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
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
        <SettingOutlined />
        <span>Change Password</span>
      </div>

      <Modal
        title="Change Password"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose
        width={460}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          className="mt-4"
        >
          <Form.Item
            label="Current Password"
            name="oldPassword"
            rules={[
              { required: true, message: "Please enter your current password" },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="Enter current password"
              className="h-10 rounded-lg"
            />
          </Form.Item>

          <Form.Item
            label="New Password"
            name="newPassword"
            rules={[
              { required: true, message: "New password is required" },
              {
                min: 6,
                message: "Password must be at least 6 characters long",
              },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="Enter new password (min. 6 characters)"
              className="h-10 rounded-lg"
            />
          </Form.Item>

          <Form.Item
            label="Confirm New Password"
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
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="Confirm new password"
              className="h-10 rounded-lg"
            />
          </Form.Item>

          <Form.Item className="mt-6 mb-0">
            <Button
              type="primary"
              className="my-main-button w-full h-11 rounded-lg font-semibold"
              htmlType="submit"
              size="large"
              loading={loading}
              block
            >
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ChangePassword;
