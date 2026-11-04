import React, { useState } from "react";
import { Form, Input, Button, message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { MailOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { API } from "../../api/api";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await API.post("/auth/admin/forgot-password", {
        email: values.email,
      });

      if (response.status == 200) {
        message.success(
          "Reset code sent successfully! Please check your email.",
        );

        // Save the email and user type in localStorage
        localStorage.setItem("email", values.email);

        setTimeout(() => {
          navigate("/check-code");
        }, 500);
      }

      localStorage.setItem("email", values.email);

      setTimeout(() => {
        navigate("/check-code");
      }, 500);
    } catch (error) {
      console.error(error, "error");
      message.error(
        error.response?.data?.message ||
          "Failed to send reset code. Please verify your email and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo) => {
    message.error("Please enter a valid email address.");
    console.log("Failed:", errorInfo);
  };

  return (
    <div className="flex justify-center items-center min-h-screen mainBG px-3 lg:px-4">
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
            <MailOutlined className={`text-3xl text-[#c9a84c]`} />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-center text-[28px] lg:text-[38px] font-semibold text-white mb-3">
          Forgot Password?
        </h2>

        {/* Subtitle */}
        <p className="text-center text-[#A1A1AA] text-[16px] mb-5 lg:mb-10">
          No worries! Enter your email address and we'll send you a verification
          code to reset your password
        </p>

        {/* Form */}
        <Form
          name="forgotPasswordForm"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          layout="vertical"
        >
          {/* Email Field */}
          <Form.Item
            label={
              <span className="text-[#D6B575] text-[15px]">Email Address</span>
            }
            name="email"
            rules={[
              { required: true, message: "Please enter your email address" },
              { type: "email", message: "Please enter a valid email address" },
            ]}
          >
            <Input
              prefix={<MailOutlined className="text-gray-400" />}
              type="email"
              className="p-3 rounded-lg"
              placeholder="Enter your registered email"
              size="large"
            />
          </Form.Item>

          {/* Submit Button */}
          <Form.Item className="mb-0">
            <Button
              type="primary"
              htmlType="submit"
              className={`w-full h-12 text-[17px] font-semibold rounded-lg shadow-md hover:shadow-lg transition-all my-main-button`}
              loading={loading}
              size="large"
            >
              {loading ? "Sending Code..." : "Send Verification Code"}
            </Button>
          </Form.Item>
        </Form>

        {/* Back to Login */}
        <div className="mt-8 text-center">
          <Link
            to="/login"
            className={`inline-flex items-center gap-2 text-[15px] font-medium transition-colors backLink`}
          >
            <ArrowLeftOutlined className="text-sm" />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
