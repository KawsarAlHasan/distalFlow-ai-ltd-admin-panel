import { useState } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import {
  Layout,
  Input,
  Avatar,
  Badge,
  Drawer,
  Button,
  Dropdown,
  Divider,
  Tag,
} from "antd";
import {
  RiDashboardLine,
  RiFilterLine,
  RiBroadcastLine,
  RiMessage2Line,
  RiCalendarLine,
  RiBarChartLine,
  RiBankCardLine,
  RiSettings3Line,
  RiLogoutBoxLine,
  RiBellLine,
  RiSearchLine,
  RiMenuLine,
  RiCloseLine,
} from "react-icons/ri";

const { Sider, Header, Content } = Layout;

import { Link } from "react-router-dom";
import {
  MenuOutlined,
  UserOutlined,
  LogoutOutlined,
  BellOutlined,
} from "@ant-design/icons";
import ChangePassword from "../ChangePassword";
import AccountSetting from "../AccountSetting";
import Notifications from "../Notifications";
import { useNotification } from "../../api/userApi";
import { useAdmin } from "../../context/AdminContext";
import { signOutAdmin } from "../../api/api";

export default function HeaderContent({ setMobileOpen }) {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const { adminProfile, refetch } = useAdmin();

  const {
    notification,
    isLoading,
    isError,
    error,
    refetch: notificationRefetch,
  } = useNotification();

  const location = useLocation();

  const getNavTextKey = () => {
    const path = location.pathname;
    if (path === "/") return "Dashboard";
    if (path === "/clinics") return "Clinics";
    if (path === "/leads") return "All Leads";
    if (path === "/billing") return "Billing & MRR";
    if (path === "/exclusivity") return "Exclusivity";
    if (path === "/settings") return "Platform settings";
    return "Dashboard";
  };

  const handleSignOut = () => {
    signOutAdmin();
  };

  const profileMenuItems = [
    {
      key: "adminProfile",
      label: (
        <div className="p-2 cursor-default">
          <div className="flex gap-3 items-start">
            <Avatar
              size={50}
              src={adminProfile?.profilePic}
              icon={<UserOutlined />}
            />
            <div>
              <h1 className="text-[#242424] text-[16px] font-bold mb-1">
                {adminProfile?.name}
              </h1>
              <Tag color="blue" className="m-0">
                {adminProfile?.roleName}
              </Tag>
            </div>
          </div>
        </div>
      ),
    },
    {
      type: "divider",
    },
    {
      key: "profile",
      label: <AccountSetting adminProfile={adminProfile} refetch={refetch} />,
    },
    {
      key: "change-password",
      label: <ChangePassword />,
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      label: (
        <div
          onClick={handleSignOut}
          className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer"
        >
          <LogoutOutlined /> Logout
        </div>
      ),
    },
  ];

  return (
    <Header className="orbis-header">
      {/* Mobile menu toggle */}
      <button
        className="orbis-mobile-menu-btn"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        <RiMenuLine size={20} />
      </button>

      <span className="orbis-header-title hidden md:block">
        {getNavTextKey()}
      </span>

      <div className="orbis-header-search">
        <Input
          prefix={<RiSearchLine size={14} color="#aaa" />}
          placeholder="Search leads, campaigns, clinics..."
          bordered={false}
          style={{
            background: "#f7f7f7",
            borderRadius: 8,
            border: "1px solid #e5e5e5",
            height: 34,
            fontSize: 13,
          }}
        />
      </div>

      <div className="orbis-header-actions">
        {/* Right section */}
        <div className="flex items-center gap-4">
          <Badge
            count={notification?.unreadNotifications || 0}
            size="small"
            className="cursor-pointer p-2 rounded-full border-2 border-gray-200 hover:border-orange-400 transition-colors"
          >
            <BellOutlined
              className="text-xl"
              onClick={() => setDrawerVisible(true)}
            />
          </Badge>

          <Dropdown
            menu={{ items: profileMenuItems }}
            trigger={["click"]}
            placement="bottomRight"
            overlayStyle={{ width: "300px" }}
          >
            <div className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Avatar
                size="large"
                src={adminProfile?.profilePic}
                icon={<UserOutlined />}
                className="border-2 border-gray-200 hover:border-orange-400 transition-colors"
              />
              <div className="hidden md:block ">
                <div className="text-[#242424] text-[14px] font-semibold leading-tight">
                  {adminProfile?.name}
                </div>
                <div className="text-[12px] text-gray-500 leading-tight">
                  {adminProfile?.roleName}
                </div>
              </div>
              <div className="hidden md:block">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </Dropdown>
        </div>
        {/* <Badge dot color="#C9A84C" offset={[-2, 2]}>
          <button className="orbis-bell-btn" aria-label="Notifications">
            <RiBellLine size={19} color="#555" />
          </button>
        </Badge>
        <Avatar
          size={32}
          style={{
            background: "#C9A84C",
            color: "#1a1510",
            fontWeight: 700,
            fontSize: 12,
            cursor: "pointer",
          }}
        >
          AP
        </Avatar> */}

        {/* Drawer for notifications */}
        <Drawer
          title="Notifications"
          placement="right"
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
        >
          <Notifications
            notification={notification}
            isLoading={isLoading}
            isError={isError}
            error={error}
            refetch={notificationRefetch}
          />
        </Drawer>
      </div>
    </Header>
  );
}
