import React from "react";
import { Button, Form, Input, message, Modal } from "antd";
import { HiCheck } from "react-icons/hi2";
import { API } from "../../api/api";
import { invalidateQueries } from "../../hooks/invalidateQueries";

export default function InviteModal({ open, onClose }) {
  const [form] = Form.useForm();
  const [role, setRole] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const roleOptions = [
    {
      key: "Super-admin",
      title: "Super-admin",
      desc: "Full platform control",
      apiRole: "Super Admin",
    },
    {
      key: "Success",
      title: "Success",
      desc: "Manage clinic accounts",
      apiRole: "Success",
    },
    {
      key: "Support",
      title: "Support",
      desc: "Assist & triage",
      apiRole: "Support",
    },
  ];

  const handleRoleChange = (value) => {
    setRole(value);

    form.setFieldsValue({
      role: value,
    });

    // Clear role validation error after selecting
    form.validateFields(["role"]).catch(() => {});
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      const selectedRole = roleOptions.find((item) => item.key === values.role);

      const payload = {
        email: values.email,
        password: values.password,
        roleName: selectedRole?.apiRole,
      };

      await API.post("/admin/create", payload);
      await invalidateQueries(["allAdmins"]);

      message.success("Invite sent successfully!");

      form.resetFields();
      setRole("");
      onClose();
    } catch (error) {
      message.error(
        error?.response?.data?.message || "Invite failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setRole("");
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      footer={null}
      centered
      width={420}
      destroyOnClose
      closeIcon={
        <span className="text-neutral-400 text-lg leading-none">×</span>
      }
    >
      {/* Header */}
      <div>
        <h2
          className="text-[20px] text-neutral-900"
          style={{
            fontFamily: "'Georgia', 'Playfair Display', serif",
          }}
        >
          Invite to DistalFlo team
        </h2>

        <p className="text-[13.5px] text-neutral-500 mt-1 mb-0">
          They&apos;ll get an email to set up their account.
        </p>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark={false}
        className="mt-5"
      >
        {/* Email */}
        <Form.Item
          name="email"
          label={
            <span className="text-[13.5px] font-semibold text-neutral-800">
              Email address
            </span>
          }
          rules={[
            {
              required: true,
              message: "Please enter an email address",
            },
            {
              type: "email",
              message: "Please enter a valid email address",
            },
          ]}
          className="mb-5"
        >
          <Input
            placeholder="name@distalflo.co.uk"
            size="large"
            className="!rounded-lg"
          />
        </Form.Item>

        {/* Password */}
        <Form.Item
          name="password"
          label={
            <span className="text-[13.5px] font-semibold text-neutral-800">
              Password
            </span>
          }
          rules={[
            {
              required: true,
              message: "Please enter a password",
            },
            {
              min: 6,
              message: "Password must be at least 6 characters",
            },
          ]}
          className="mb-5"
        >
          <Input.Password
            placeholder="Enter password"
            size="large"
            className="!rounded-lg"
          />
        </Form.Item>

        {/* Role */}
        <Form.Item
          name="role"
          label={
            <span className="text-[13.5px] font-semibold text-neutral-800">
              Role
            </span>
          }
          rules={[
            {
              required: true,
              message: "Please select a role",
            },
          ]}
          className="mb-0"
        >
          <div className="flex flex-col gap-2.5">
            {roleOptions.map((option) => {
              const isSelected = role === option.key;

              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => handleRoleChange(option.key)}
                  className="w-full flex items-start gap-3 text-left px-4 py-3.5 rounded-lg border transition-colors"
                  style={{
                    borderColor: isSelected ? "#141414" : "#E5E2DC",
                    backgroundColor: isSelected ? "#F5F4F1" : "#FFFFFF",
                  }}
                >
                  {/* Checkbox / Check */}
                  <span
                    className="mt-0.5 w-[18px] h-[18px] rounded-[5px] border flex items-center justify-center shrink-0"
                    style={{
                      borderColor: isSelected ? "#141414" : "#D4D1C9",
                      backgroundColor: isSelected ? "#141414" : "#FFFFFF",
                    }}
                  >
                    {isSelected && <HiCheck size={13} color="#FFFFFF" />}
                  </span>

                  {/* Role text */}
                  <span>
                    <span className="block text-[14.5px] font-semibold text-neutral-900">
                      {option.title}
                    </span>

                    <span className="block text-[13px] text-neutral-500 mt-0.5">
                      {option.desc}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </Form.Item>

        {/* Footer */}
        <div className="flex justify-end gap-2.5 mt-6 pt-5 border-t border-neutral-100">
          <Button
            onClick={handleCancel}
            disabled={loading}
            className="!rounded-lg !text-[13.5px] !font-medium"
          >
            Cancel
          </Button>

          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="!rounded-lg !text-[13.5px] !font-medium !bg-neutral-900 !border-neutral-900"
          >
            Send invite
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
