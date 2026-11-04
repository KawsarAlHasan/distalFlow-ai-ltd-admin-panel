import { useEffect, useState } from "react";
import { Form, Input, Button, Checkbox, message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { UserOutlined, LockOutlined, EyeOutlined } from "@ant-design/icons";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import "./Authentication.css";
import { API } from "../../api/api";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/");
    }
  }, [navigate]);

  const onFinish = async (values) => {
    setLoading(true);

    try {
      const res = await API.post("/auth/admin/login", {
        email: values.email,
        password: values.password,
      });

      message.success("Login successful!");

      localStorage.setItem("token", res.data.data.token);

      setTimeout(() => {
         window.location.href = "/";
      }, 500);
    } catch (error) {
      console.error(error, "error");
      message.error(
        error?.response?.data?.message ||
          "Login failed. Please check your credentials and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center mainBG px-3 lg:px-4">
      <div className="authCard w-full max-w-[550px] rounded-3xl px-4 lg:px-12 py-6 lg:py-14">
        {/* Logo */}
        <div className="flex justify-center mb-4 lg:mb-8">
          <img
            src="/images/Frame2147228573.png"
            alt="logo"
            className="w-[222px] h-[80px] lg:w-[331px] lg:h-[119px] object-contain"
          />
        </div>

        {/* Title */}
        <h2 className="text-center text-[28px] lg:text-[38px] font-semibold text-white mb-3">
          Login to Account
        </h2>

        {/* Subtitle */}
        <p className="text-center text-[#A1A1AA] text-[16px] mb-5 lg:mb-10">
          Please enter your email and password to continue
        </p>

        <Form
          layout="vertical"
          initialValues={{ remember: true }}
          onFinish={onFinish}
        >
          {/* Email */}
          <Form.Item
            label={
              <span className="text-[#D6B575] text-[15px]">Email Address</span>
            }
            name="email"
            rules={[
              {
                required: true,
                message: "Please enter your email address",
              },
              {
                type: "email",
                message: "Please enter valid email",
              },
            ]}
          >
            <Input
              size="large"
              prefix={<UserOutlined className="text-gray-400" />}
              placeholder="Enter your email address"
              className="h-[50px] rounded-xl"
            />
          </Form.Item>

          {/* Password */}
          <Form.Item
            label={<span className="text-[#D6B575] text-[15px]">Password</span>}
            name="password"
            rules={[
              {
                required: true,
                message: "Please enter your password",
              },
            ]}
          >
            <Input.Password
              size="large"
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="Enter your password"
              className="h-[50px] rounded-xl"
              iconRender={(visible) =>
                visible ? (
                  <EyeOutlined style={{ color: "#d6b575" }} />
                ) : (
                  <EyeInvisibleOutlined style={{ color: "#d6b575" }} />
                )
              }
            />
          </Form.Item>

          {/* Remember + Forgot */}
          <div className="flex justify-between items-center mb-4 lg:mb-8">
            <Form.Item name="remember" valuePropName="checked" className="mb-0">
              <Checkbox>
                <span className="text-gray-300">Remember Password</span>
              </Checkbox>
            </Form.Item>

            <Link
              to="/forget-password"
              className="text-[#D6B575] hover:text-[#e7c98b]"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Button */}
          <Button
            htmlType="submit"
            loading={loading}
            className="my-main-button w-full h-[55px] rounded-xl text-[18px] font-semibold"
          >
            {loading ? "Signing In..." : "Sign In"}
          </Button>
        </Form>

        {/* Resend Section */}
        {/* <div className="text-center mt-6">
          <p className="text-[#A1A1AA] text-[15px] mb-2">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-blue-600 hover:text-blue-700 hover:underline font-medium transition-colors"
            >
              Sign Up
            </Link>
          </p>
        </div> */}
      </div>
    </div>
  );
};

export default Login;
