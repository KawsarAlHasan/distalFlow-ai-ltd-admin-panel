import React, { useState, useEffect } from "react";
import { UserOutlined, CameraOutlined } from "@ant-design/icons";
import {
  Button,
  Modal,
  Form,
  Input,
  message,
  Avatar,
  Upload,
} from "antd";
import { API } from "../api/api";

const AccountSetting = ({ adminProfile, refetch }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [form] = Form.useForm();

  const showModal = () => setIsModalOpen(true);
  const handleCancel = () => {
    setSelectedImage(null);
    setImageFile(null);
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (isModalOpen && adminProfile) {
      form.setFieldsValue({
        name: adminProfile.name || "",
        email: adminProfile.email || "",
        phone: adminProfile.phone || "",
        role: adminProfile.roleName || "Super Admin",
      });
      setSelectedImage(adminProfile.profilePic || null);
    }
  }, [isModalOpen, adminProfile, form]);

  const handleImageSelect = (file) => {
    setImageFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target.result);
    };
    reader.readAsDataURL(file);

    return false;
  };

  const handleFinish = async (values) => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("name", values.name);
      if (values.phone) formData.append("phone", values.phone);

      if (imageFile) {
        formData.append("image", imageFile);
      }

      await API.patch("/auth/admin/update-profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      message.success("Profile updated successfully!");
      refetch?.();

      setSelectedImage(null);
      setImageFile(null);
      setIsModalOpen(false);
    } catch (err) {
      console.error(err, "error");
      message.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png" || file.type === "image/webp";
    if (!isJpgOrPng) {
      message.error("You can only upload JPG, PNG or WEBP image!");
      return false;
    }
    const isLt2M = file.size / 1024 / 1024 < 4;
    if (!isLt2M) {
      message.error("Image must be smaller than 4MB!");
      return false;
    }
    return true;
  };

  return (
    <>
      <div
        onClick={showModal}
        className="flex items-center gap-2 px-1 py-2 cursor-pointer"
      >
        <UserOutlined />
        <span>Profile</span>
      </div>

      <Modal
        title="Update Profile"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        width={500}
        destroyOnClose
      >
        <div className="flex flex-col items-center">
          <div className="relative mb-4">
            <Avatar
              size={100}
              src={selectedImage || adminProfile?.profilePic}
              icon={<UserOutlined />}
              className="border-2 border-gray-200"
            />

            <Upload
              name="avatar"
              showUploadList={false}
              beforeUpload={beforeUpload}
              accept="image/jpeg,image/png,image/webp"
              customRequest={({ file, onSuccess }) => {
                onSuccess("ok");
              }}
              onChange={(info) => {
                if (info.file.status === "done" && info.file.originFileObj) {
                  handleImageSelect(info.file.originFileObj);
                }
              }}
            >
              <Button
                type="primary"
                shape="circle"
                icon={<CameraOutlined />}
                size="small"
                className="absolute -bottom-1 -right-1 shadow-md"
                style={{ backgroundColor: "#1E0F22", borderColor: "#C8A96E" }}
              />
            </Upload>
          </div>

          {selectedImage && selectedImage !== adminProfile?.profilePic && (
            <p className="text-emerald-700 text-xs mb-2">
              New image selected. Click "Update Profile" to save changes.
            </p>
          )}
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
        >
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: "Please enter your name" }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Your full name" className="h-10 rounded-lg" />
          </Form.Item>

          <Form.Item label="Email" name="email">
            <Input disabled className="h-10 rounded-lg bg-gray-50" />
          </Form.Item>

          <Form.Item
            label="Phone Number"
            name="phone"
            rules={[
              { required: false },
            ]}
          >
            <Input placeholder="Enter your contact phone" className="h-10 rounded-lg" />
          </Form.Item>

          <Form.Item label="Role" name="role">
            <Input disabled className="h-10 rounded-lg bg-gray-50" />
          </Form.Item>

          <Form.Item className="mt-6 mb-0">
            <Button
              className="my-main-button w-full h-11 rounded-lg font-semibold"
              type="primary"
              size="large"
              htmlType="submit"
              loading={loading}
            >
              {loading ? "Updating..." : "Update Profile"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default AccountSetting;
