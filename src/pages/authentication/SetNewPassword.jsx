import { useState } from "react";
import { Form, Input, Button, message, Progress } from "antd";
import { Link, useNavigate } from "react-router-dom";
import {
  EyeInvisibleOutlined,
  EyeOutlined,
  LockOutlined,
} from "@ant-design/icons";
import { API } from "../../api/api";

const SetNewPassword = () => {
  const email = localStorage.getItem("email");
  const otp = localStorage.getItem("otp");
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    if (values.password !== values.confirmPassword) {
      message.error("Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      const response = await API.post("/auth/admin/set-password", {
        email: email,
        otp: Number(otp),
        password: values.password,
      });

      // Clear reset-related data
      localStorage.setItem("token", response.data.data.token);
      localStorage.removeItem("email");
      localStorage.removeItem("otp");

      // Show success message
      message.success("Password has been reset successfully!");

      // Redirect to the dashboard
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    } catch (error) {
      message.error(
        error.response?.data?.message ||
          "Failed to reset password. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo) => {
    message.error("Please fill in all required fields correctly.");
    console.log("Failed:", errorInfo);
  };

  return (
    <div className="flex justify-center items-center min-h-screen p-4 mainBG px-3 lg:px-4">
      <div className="authCard px-4 lg:px-12 py-6 lg:py-14 shadow-2xl rounded-3xl w-full max-w-[550px]">
        {/* Logo */}
        <div className="flex justify-center mb-4 lg:mb-8">
          <img
            src="/images/Frame2147228573.png"
            alt="logo"
            className="w-[222px] h-[80px] lg:w-[331px] lg:h-[119px] object-contain"
          />
        </div>

        {/* Icon */}
        <div className="flex justify-center mb-5">
          <div className="relative z-10 w-[3.5rem] lg:w-[4.5rem] h-[3.5rem] lg:h-[4.5rem] rounded-full bg-[#1c1332] border-2 flex items-center justify-center text-[#c9a84c] border-[#c9a84c] shadow-[0_0_20px_rgba(201,168,76,0.2)] transition-all duration-300 cursor-default">
            <LockOutlined className={`text-3xl text-[#c9a84c]`} />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-center text-[28px] lg:text-[38px] font-semibold text-white mb-3">
          Create New Password
        </h2>

        {/* Subtitle */}
        <p className="text-center text-[#A1A1AA] text-[16px] mb-5 lg:mb-10">
          Your new password must be different from previously used passwords for
          security
        </p>

        {/* Form */}
        <Form
          form={form}
          name="setNewPasswordForm"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          layout="vertical"
        >
          {/* New Password Field */}
          <Form.Item
            label={
              <span className="text-[#D6B575] text-[15px]">New Password</span>
            }
            name="password"
            rules={[
              { required: true, message: "Password is required." },
              {
                pattern: /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/,
                message:
                  "At least 8 chars, 1 uppercase, 1 number & 1 special char",
              },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              className="p-3 rounded-lg"
              placeholder="Enter your new password"
              size="large"
              iconRender={(visible) =>
                visible ? (
                  <EyeOutlined style={{ color: "#d6b575" }} />
                ) : (
                  <EyeInvisibleOutlined style={{ color: "#d6b575" }} />
                )
              }
            />
          </Form.Item>

          {/* Confirm Password Field */}
          <Form.Item
            label={
              <span className="text-[#D6B575] text-[15px]">
                Confirm Password
              </span>
            }
            name="confirmPassword"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Please confirm your password" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Passwords do not match!"));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              className="p-3 rounded-lg"
              placeholder="Confirm your new password"
              size="large"
              iconRender={(visible) =>
                visible ? (
                  <EyeOutlined style={{ color: "#d6b575" }} />
                ) : (
                  <EyeInvisibleOutlined style={{ color: "#d6b575" }} />
                )
              }
            />
          </Form.Item>

          {/* Submit Button */}
          <Form.Item className="mb-0 mt-6">
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={loading}
              className={`h-12 text-[17px] font-semibold rounded-lg shadow-md hover:shadow-lg transition-all my-main-button`}
            >
              {loading ? "Resetting Password..." : "Reset Password"}
            </Button>
          </Form.Item>
        </Form>

        {/* Back to Login */}
        <div className="mt-6 text-center">
          <Button
            type="link"
            onClick={() => navigate("/login")}
            className={`text-[14px] backLink`}
          >
            ← Back to Login
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SetNewPassword;
