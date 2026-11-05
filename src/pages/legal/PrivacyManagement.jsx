import React from "react";
import LegalDocumentManager from "./LegalDocumentManager";
import { RiShieldCheckLine } from "react-icons/ri";

export default function PrivacyManagement() {
  return (
    <LegalDocumentManager
      type="PRIVACY_POLICY"
      title="Privacy Policy Management"
      description="Manage versioned Platform Privacy Policy and Data Protection protocols. Each clinic retains their accepted privacy statement version."
      icon={RiShieldCheckLine}
    />
  );
}

