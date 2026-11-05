import React from "react";
import LegalDocumentManager from "./LegalDocumentManager";
import { RiFileTextLine } from "react-icons/ri";

export default function TermsManagement() {
  return (
    <LegalDocumentManager
      type="TERMS_OF_SERVICE"
      title="Terms and Conditions Management"
      description="Manage versioned Platform Terms and Conditions. Existing clinics stay locked to their signed version. New sign-ups will be required to accept the active version during first onboarding."
      icon={RiFileTextLine}
    />
  );
}

