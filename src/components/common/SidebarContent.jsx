import React from "react";
import { Outlet, NavLink, useNavigate, Link } from "react-router-dom";
import { Layout, Input, Avatar, Badge, Drawer, Button } from "antd";
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
  RiVipCrownLine,
} from "react-icons/ri";
import { IoIosLogOut } from "react-icons/io";
import { useAdmin } from "../../context/AdminContext";
import { signOutAdmin } from "../../api/api";

export default function SidebarContent({ onClose }) {
  const { adminProfile } = useAdmin();

  const NAV_ITEMS = [
    {
      section: "Overview",
      links: [
        { label: "Platform Dashboard", path: "/", icon: RiDashboardLine },
        { label: "Clinics", path: "/clinics", icon: RiFilterLine },
        { label: "All Leads", path: "/leads", icon: RiBroadcastLine },
      ],
    },
    {
      section: "Revenue",
      links: [
        { label: "Billing & MRR", path: "/billing", icon: RiBarChartLine },
        { label: "Plans", path: "/plans", icon: RiVipCrownLine },
      ],
    },
    {
      section: "Platform",
      links: [
        {
          label: "Exclusivity Map",
          path: "/exclusivity",
          icon: RiBankCardLine,
        },
        { label: "Settings", path: "/settings", icon: RiSettings3Line },
      ],
    },
  ];

  const handleLogout = () => {
    signOutAdmin();
    onClose?.();
  };

  return (
    <div className="orbis-sidebar">
      {/* Logo */}
      <Link to="/" className="flex justify-center mb-4 lg:mb-8">
        <img
          src="/images/hero-horizontal-1.png"
          alt="logo"
          className="pt-2 pr-3"
          // className="w-[222px] h-[80px] lg:w-[331px] lg:h-[119px] object-contain"
        />
      </Link>

      {/* Nav */}
      <nav className="orbis-nav">
        {NAV_ITEMS.map(({ section, links }) => (
          <div key={section} className="orbis-nav-section">
            <p className="orbis-nav-section-label">{section}</p>
            {links.map(({ label, path, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                onClick={onClose}
                className={({ isActive }) =>
                  `orbis-nav-link ${isActive ? "orbis-nav-link--active" : ""}`
                }
              >
                <Icon size={17} className="orbis-nav-icon" />
                <span>{label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="flex items-center gap-3 border-t border-[#5a5040] px-4 py-3">
        <Avatar
          src={adminProfile?.profile_image}
          size={34}
          style={{
            background: "#C9A84C",
            color: "#1a1510",
            fontWeight: 700,
            fontSize: 13,
            flexShrink: 0,
          }}
        >
          AP
        </Avatar>
        <div className="orbis-user-info">
          <p className="pt-0.5 pb-1 text-[#fff] m-0">{adminProfile?.name}</p>
          <p className="orbis-user-role m-0">{adminProfile?.roleName}</p>
        </div>
        <button
          className="orbis-logout-btn"
          onClick={handleLogout}
          title="Logout"
        >
          <IoIosLogOut size={17} />
        </button>
      </div>
    </div>
  );
}
