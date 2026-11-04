import { useState, useEffect } from "react";
import { Form, Input, Button, message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { SafetyOutlined } from "@ant-design/icons";
import { API } from "../../api/api";

const CheckCode = () => {
  const email = localStorage.getItem("email");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [form] = Form.useForm();

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Check if email exists, if not redirect
  useEffect(() => {
    if (!email) {
      message.warning("Please enter your email first");
      navigate("/forget-password");
    }
  }, [email, navigate]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await API.post("/auth/admin/verify-otp", {
        email: email,
        otp: Number(values.otp),
      });

      localStorage.setItem("otp", values.otp);

      message.success("Verification code confirmed successfully!");

      setTimeout(() => {
        navigate("/set-new-password");
      }, 500);
    } catch (error) {
      console.error(error, "error");
      const errorMessage =
        error.response?.data?.message ||
        "Verification failed. Please check your code and try again.";

      message.error(errorMessage);
      console.error("Verification error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;

    setResendLoading(true);
    try {
      await API.post("/auth/admin/forgot-password", {
        email: email,
      });

      message.success("A new verification code has been sent to your email!");
      setCountdown(60); // Set 60 seconds countdown
      form.resetFields(); // Clear the OTP input
    } catch (error) {
      console.error(error, "error");
      message.error(
        error.response?.data?.message ||
          "Failed to resend code. Please try again later.",
      );
    } finally {
      setResendLoading(false);
    }
  };

  // Mask email for privacy
  const maskEmail = (email) => {
    if (!email) return "";
    const [username, domain] = email.split("@");
    const maskedUsername =
      username.charAt(0) + "***" + username.charAt(username.length - 1);
    return `${maskedUsername}@${domain}`;
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
            <SafetyOutlined className={`text-3xl text-[#c9a84c]`} />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-center text-[28px] lg:text-[38px] font-semibold text-white mb-3">
          Verify Your Email
        </h2>

        {/* Subtitle */}
        <p className="text-center text-[#A1A1AA] text-[16px] mb-5 lg:mb-10">
          We've sent a 6-digit verification code to
        </p>
        <p className="text-center text-[#919eb6] font-semibold mb-8 text-[16px]">
          {maskEmail(email)}
        </p>

        {/* Form */}
        <Form form={form} onFinish={onFinish} autoComplete="off">
          <Form.Item
            name="otp"
            rules={[
              {
                required: true,
                message: "Please input the OTP!",
              },
              {
                pattern: /^[0-9]{6}$/,
                message: "Please enter a valid 6-digit code",
              },
            ]}
            className="mb-6 text-center"
          >
            <Input.OTP
              length={6}
              formatter={(str) => str.toUpperCase()}
              inputType="number"
              size="large"
              inputStyle={{
                width: 50,
                height: 50,
                fontSize: 18,
                margin: "0 4px",
                textAlign: "center",
              }}
            />
          </Form.Item>

          <Form.Item className="mb-4">
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={loading}
              className="h-12 font-semibold text-lg my-main-button"
            >
              {loading ? "Verifying..." : "Verify Code"}
            </Button>
          </Form.Item>

          {/* Resend Section */}
          <div className="text-center mt-6">
            <p className="text-[#A1A1AA] text-[15px] mb-2">
              Didn't receive the code?
              <Button
                type="link"
                loading={resendLoading}
                onClick={handleResend}
                disabled={countdown > 0}
                className={`ml-1 p-0 font-semibold text-[15px] ${
                  countdown > 0
                    ? "!text-blue-300 cursor-not-allowed "
                    : "text-blue-600 hover:text-blue-700"
                }`}
              >
                {countdown > 0
                  ? `Resend in ${countdown}s`
                  : resendLoading
                    ? "Sending..."
                    : "Resend Code"}
              </Button>
            </p>
          </div>
        </Form>

        {/* Back Link */}
        <div className="mt-6 text-center">
          <Button
            type="link"
            onClick={() => navigate("/forget-password")}
            className={`text-[14px] backLink`}
          >
            ← Change Email Address
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CheckCode;
