import React, { useState } from "react";
import { Button, Modal, Input, Select, InputNumber, message } from "antd";
import {
  HiCheck,
  HiOutlineInformationCircle,
  HiOutlineExclamationTriangle,
  HiOutlinePhone,
} from "react-icons/hi2";
import { API } from "../../api/api";
import { usePlanData } from "../../api/planApi";

// ---------------------------------------------------------------------------
// Static config — Subscription tiers (internal use only, never shown on the
// public marketing site — only inside onboarding / billing / admin surfaces)
// ---------------------------------------------------------------------------

const steps = [
  { key: 1, label: "Clinic details" },
  { key: 2, label: "Exclusivity" },
  { key: 3, label: "Plan & tier" },
  { key: 4, label: "Checkout" },
];

// Enterprise pricing is dynamic (depends on number of locations), so it's
// computed by getPlanPricing() below rather than stored as a flat price.
//
// IMPORTANT — tier rules (do not relax without product sign-off):
// 1. Only 'Enterprise' may have `locations > 1`. Every other tier is
//    single-location, and this must be enforced server-side (API/DB layer),
//    not just in this form — the UI-side lock below is a UX convenience only.
// 2. 'Enterprise' is NOT self-serve. It must never expose an automated
//    Stripe checkout link — it is closed manually by sales (see StepCheckout).
const discountOptions = [
  { value: "none", label: "No discount" },
  { value: "10", label: "10% off first 3 months" },
  { value: "20", label: "20% off first 3 months" },
];

const UNAVAILABLE_CODES = ["M4"];

// ---------------------------------------------------------------------------
// Pricing helper — single source of truth for tier cost math
// ---------------------------------------------------------------------------

function getPlanPricing(plans, planKey, locations = 1) {
  const plan = plans.find((p) => p.key === planKey);
  if (!plan) return { monthly: 0, setup: 0, label: "—" };

  const activeHistory = plan.history?.find((h) => h.status === "active") || plan.history?.[0];
  const monthlyBase = (activeHistory?.amount || 0) / 100;
  const setupBase = (activeHistory?.setup || 0) / 100;

  if (plan.key !== "enterprise") {
    return {
      monthly: monthlyBase,
      setup: setupBase,
      label: `£${monthlyBase.toLocaleString()}/mo + £${setupBase.toLocaleString()} setup`,
    };
  }

  // Enterprise: base covers first 2 locations, extra locations billed per site
  const baseLocations = 2; // Hardcoded fallback since API doesn't provide
  const perExtraLocationMonthly = 997;
  const perExtraLocationSetup = 497;

  const extraLocations = Math.max(0, locations - baseLocations);
  const monthly = monthlyBase + extraLocations * perExtraLocationMonthly;
  const setup = setupBase + extraLocations * perExtraLocationSetup;

  const label =
    extraLocations > 0
      ? `£${monthlyBase.toLocaleString()}/mo (2 locations) + ${extraLocations} × £${perExtraLocationMonthly}/mo — £${monthly.toLocaleString()}/mo total + £${setup.toLocaleString()} setup`
      : `£${monthlyBase.toLocaleString()}/mo + £${setupBase.toLocaleString()} setup (covers up to 2 locations)`;

  return { monthly, setup, label };
}

// Server-side mirror reminder: whatever endpoint actually provisions a
// clinic/tenant must reject any payload where plan !== 'enterprise' and
// locations > 1. This form only prevents it in the UI.
function isMultiLocationAllowed(planKey) {
  return planKey === "enterprise";
}

// ---------------------------------------------------------------------------
// Step indicator
// ---------------------------------------------------------------------------

function StepIndicator({ currentStep }) {
  return (
    <div className="flex items-center px-8 pt-6 pb-6">
      {steps.map((step, idx) => {
        const isDone = step.key < currentStep;
        const isActive = step.key === currentStep;
        return (
          <React.Fragment key={step.key}>
            <div className="flex flex-col items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-semibold"
                style={{
                  backgroundColor: isDone
                    ? "#1FA463"
                    : isActive
                      ? "#141414"
                      : "#FFFFFF",
                  color: isDone || isActive ? "#FFFFFF" : "#B7B4AC",
                  border: isDone || isActive ? "none" : "1px solid #D9D6CE",
                }}
              >
                {isDone ? <HiCheck size={16} /> : step.key}
              </div>
              <span
                className="text-[12.5px] whitespace-nowrap"
                style={{
                  color: isActive ? "#141414" : isDone ? "#3A3A3A" : "#ADAAA2",
                  fontWeight: isActive ? 600 : 500,
                }}
              >
                {step.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div
                className="flex-1 h-[2px] mx-2 mb-6"
                style={{
                  backgroundColor:
                    step.key < currentStep ? "#1FA463" : "#E2DFD7",
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 1 — Clinic details
// ---------------------------------------------------------------------------

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-[13.5px] font-semibold text-neutral-800 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function StepClinicDetails({ form, setForm }) {
  return (
    <div className="px-8 py-7 flex flex-col gap-5">
      <Field label="Clinic name" required>
        <Input
          size="large"
          placeholder="e.g. Riverside Ortho"
          value={form.clinicName}
          onChange={(e) => setForm({ ...form, clinicName: e.target.value })}
          className="!rounded-lg"
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Trading company">
          <Input
            size="large"
            placeholder="e.g. Riverside Ortho Ltd"
            value={form.tradingCompany}
            onChange={(e) =>
              setForm({ ...form, tradingCompany: e.target.value })
            }
            className="!rounded-lg"
          />
        </Field>
        <Field label="City">
          <Input
            size="large"
            placeholder="e.g. Manchester"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            className="!rounded-lg"
          />
        </Field>
      </div>

      <div className="pt-1 border-t border-neutral-100" />

      <span
        className="text-[15px] text-neutral-900"
        style={{ fontFamily: "'Georgia', 'Playfair Display', serif" }}
      >
        Primary Administrator
      </span>

      <div className="grid grid-cols-2 gap-4 -mt-2">
        <Field label="Admin name" required>
          <Input
            size="large"
            placeholder="e.g. Dr. Sofia Reyes"
            value={form.adminName}
            onChange={(e) => setForm({ ...form, adminName: e.target.value })}
            className="!rounded-lg"
          />
        </Field>
        <Field label="Admin email" required>
          <Input
            size="large"
            placeholder="sofia@riverside.co.uk"
            value={form.adminEmail}
            onChange={(e) => setForm({ ...form, adminEmail: e.target.value })}
            className="!rounded-lg"
          />
        </Field>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 2 — Exclusivity
// ---------------------------------------------------------------------------

function StepExclusivity({ form, setForm }) {
  const [draft, setDraft] = useState("");

  const addPostcode = () => {
    const code = draft.trim().toUpperCase();
    if (!code) return;
    if (form.postcodes.some((p) => p.code === code)) {
      setDraft("");
      return;
    }
    setForm({
      ...form,
      postcodes: [
        ...form.postcodes,
        {
          code,
          unavailable: UNAVAILABLE_CODES.includes(code),
          override: false,
        },
      ],
    });
    setDraft("");
  };

  const removePostcode = (code) => {
    setForm({
      ...form,
      postcodes: form.postcodes.filter((p) => p.code !== code),
    });
  };

  const overridePostcode = (code) => {
    setForm({
      ...form,
      postcodes: form.postcodes.map((p) =>
        p.code === code ? { ...p, override: !p.override } : p,
      ),
    });
  };

  const availableCodes = form.postcodes.filter(
    (p) => !p.unavailable || p.override,
  );
  const unavailableCodes = form.postcodes.filter(
    (p) => p.unavailable && !p.override,
  );

  return (
    <div className="px-8 py-7 flex flex-col gap-4">
      <Field label="Postcode areas to reserve" required>
        <div className="flex flex-wrap items-center gap-2 border rounded-lg px-3 py-2.5 border-neutral-200">
          {form.postcodes.map((p) => (
            <span
              key={p.code}
              className="inline-flex items-center gap-1.5 rounded-full pl-3 pr-2 py-1 text-[13px] font-semibold"
              style={{
                backgroundColor: p.unavailable ? "#FCEED9" : "#F1EFEA",
                color: p.unavailable ? "#B5690B" : "#141414",
              }}
            >
              {p.code}
              {p.unavailable && p.override && (
                <span className="text-[11px] font-bold bg-white/70 rounded-full px-1.5">
                  Override
                </span>
              )}
              <button
                type="button"
                onClick={() => removePostcode(p.code)}
                className="text-current opacity-60 hover:opacity-100"
              >
                ×
              </button>
            </span>
          ))}
          <input
            className="flex-1 min-w-[160px] outline-none text-[14px] py-1 placeholder:text-neutral-400"
            placeholder="Type a postcode and press enter..."
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addPostcode();
              }
            }}
          />
        </div>
      </Field>

      {availableCodes.length > 0 && (
        <div className="rounded-lg px-4 py-3 bg-emerald-50 flex items-center gap-2">
          <HiCheck size={16} className="text-emerald-600 shrink-0" />
          <span className="text-[13.5px] text-emerald-800">
            <span className="font-semibold">
              {availableCodes.map((p) => p.code).join(", ")}
            </span>{" "}
            {availableCodes.length > 1 ? "are" : "is"} available. No existing
            clinic holds{" "}
            {availableCodes.length > 1 ? "these areas" : "this area"}.
          </span>
        </div>
      )}

      {unavailableCodes.map((p) => (
        <div
          key={p.code}
          className="rounded-lg px-4 py-3 flex items-center justify-between gap-3"
          style={{ backgroundColor: "#FCEED9", border: "1px solid #F5DFB8" }}
        >
          <div className="flex items-center gap-2">
            <HiOutlineExclamationTriangle
              size={17}
              className="text-orange-600 shrink-0"
            />
            <span className="text-[13.5px] text-orange-900">
              <span className="font-semibold">{p.code} is unavailable</span> —
              it has been held by X Co. since January 2026.
            </span>
          </div>
          <Button
            size="small"
            onClick={() => overridePostcode(p.code)}
            className="!rounded-lg !text-[12.5px] !font-medium !border-orange-300 !text-orange-700 !bg-white shrink-0"
          >
            Override
          </Button>
        </div>
      ))}

      <div className="pt-2">
        <span className="block text-[13.5px] font-semibold text-neutral-800 mb-1.5">
          Map location (latitude &amp; longitude){" "}
          <span className="text-red-500">*</span>
        </span>
        <div className="grid grid-cols-2 gap-4">
          <Input
            size="large"
            placeholder="LAT"
            value={form.lat}
            onChange={(e) => setForm({ ...form, lat: e.target.value })}
            className="!rounded-lg"
          />
          <Input
            size="large"
            placeholder="LNG"
            value={form.lng}
            onChange={(e) => setForm({ ...form, lng: e.target.value })}
            className="!rounded-lg"
          />
        </div>
      </div>

      <div className="rounded-lg px-4 py-3 bg-blue-50 flex items-start gap-2">
        <HiOutlineInformationCircle
          size={17}
          className="text-blue-500 shrink-0 mt-0.5"
        />
        <span className="text-[13.5px] text-blue-900">
          These coordinates are saved with the clinic and used to plot its pin
          on the{" "}
          <span className="font-semibold underline cursor-pointer">
            Exclusivity map
          </span>
          .
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 3 — Plan & tier
// ---------------------------------------------------------------------------

function StepPlanTier({ form, setForm, plans }) {
  const pricing = getPlanPricing(plans, form.plan, form.locations);

  return (
    <div className="px-8 py-7 flex flex-col gap-3">
      {plans.map((plan) => {
        const isSelected = form.plan === plan.key;
        const planPricing = getPlanPricing(plans, plan.key, 1);
        return (
          <button
            key={plan.key}
            type="button"
            onClick={() =>
              setForm({
                ...form,
                plan: plan.key,
                // Hard reset: only Enterprise may carry locations > 1.
                // (Mirror this guard server-side — see isMultiLocationAllowed.)
                locations: isMultiLocationAllowed(plan.key)
                  ? Math.max(2, form.locations)
                  : 1,
              })
            }
            className="relative w-full flex items-center justify-between text-left px-5 py-4 rounded-xl border transition-colors"
            style={{
              borderColor: isSelected ? plan.accent || "#1FA463" : "#E5E2DC",
              backgroundColor: isSelected ? `${plan.accent || "#1FA463"}15` : "#FFFFFF",
            }}
          >
            {plan.key === "growth" && (
              <span className="absolute top-2.5 right-4 text-[11px] font-semibold text-white bg-emerald-600 px-2 py-0.5 rounded-full">
                Popular
              </span>
            )}
            {!plan.selfServe && (
              <span className="absolute top-2.5 right-4 text-[11px] font-semibold text-white bg-neutral-800 px-2 py-0.5 rounded-full">
                Sales-assisted
              </span>
            )}
            <div className="flex items-center gap-3">
              <span
                className="w-[18px] h-[18px] rounded-full border flex items-center justify-center shrink-0"
                style={{
                  borderColor: isSelected ? plan.accent || "#1FA463" : "#D4D1C9",
                  backgroundColor: isSelected ? plan.accent || "#1FA463" : "#FFFFFF",
                }}
              >
                {isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </span>
              <div>
                <div className="text-[15px] font-semibold text-neutral-900">
                  {plan.name}
                </div>
                <div className="text-[13px] text-neutral-500 mt-0.5">
                  {plan.campaigns} · {plan.locations}
                </div>
              </div>
            </div>
            <span className="text-[13.5px] font-semibold text-neutral-900 shrink-0 text-right max-w-[190px]">
              {planPricing.label}
            </span>
          </button>
        );
      })}

      {form.plan === "enterprise" && (
        <div className="rounded-xl border border-neutral-200 px-5 py-4 mt-1 bg-white">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-[14px] font-semibold text-neutral-900">
                Number of locations
              </div>
              <div className="text-[12.5px] text-neutral-500 mt-0.5">
                First 2 locations included in the base price. £997/mo + £497
                setup per additional site.
              </div>
            </div>
            <InputNumber
              size="large"
              min={2}
              max={50}
              value={form.locations}
              onChange={(v) => setForm({ ...form, locations: v || 2 })}
              className="!rounded-lg !w-24"
            />
          </div>
          <div className="mt-3 pt-3 border-t border-neutral-100 text-[13.5px] text-neutral-700">
            {pricing.label}
          </div>
          <div className="mt-3 rounded-lg px-3 py-2.5 bg-amber-50 flex items-start gap-2">
            <HiOutlinePhone
              size={16}
              className="text-amber-600 shrink-0 mt-0.5"
            />
            <span className="text-[12.5px] text-amber-900">
              Enterprise isn't self-serve. This step records terms for reference
              — the contract and billing setup are finalized directly with
              sales, not through an automated Stripe checkout link.
            </span>
          </div>
        </div>
      )}

      <div className="pt-2">
        <span className="block text-[14.5px] font-semibold text-neutral-900 mb-3">
          Apply a discount?
        </span>
        <div className="grid grid-cols-2 gap-4">
          <Select
            size="large"
            value={form.discount}
            onChange={(v) => setForm({ ...form, discount: v })}
            options={discountOptions}
            className="!rounded-lg w-full"
          />
          <Input
            size="large"
            placeholder="Promo code (optional)"
            value={form.promoCode}
            onChange={(e) => setForm({ ...form, promoCode: e.target.value })}
            className="!rounded-lg"
          />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 4 — Checkout
// ---------------------------------------------------------------------------

function ReviewRow({ label, value, bold }) {
  return (
    <div className="flex items-center justify-between px-6 py-3.5 border-b border-neutral-100 last:border-0">
      <span
        className={`text-[14px] ${bold ? "font-semibold text-neutral-900" : "text-neutral-500"}`}
      >
        {label}
      </span>
      <span
        className={`text-[14.5px] ${bold ? "font-bold text-neutral-900" : "font-semibold text-neutral-900"}`}
      >
        {value}
      </span>
    </div>
  );
}

function StepCheckout({ form, plans }) {
  const planInfo = plans.find((p) => p.key === form.plan);
  const postcodeList = form.postcodes.map((p) => p.code).join(", ") || "—";
  const pricing = getPlanPricing(plans, form.plan, form.locations);
  const isEnterprise = form.plan === "enterprise";

  const discountPct = form.discount === "none" ? 0 : Number(form.discount);
  const discountedMonthly = pricing.monthly * (1 - discountPct / 100);
  // First charge = first month (with discount applied) + one-off setup fee + VAT (20%)
  const firstChargeExVat = discountedMonthly + pricing.setup;
  const firstChargeIncVat = firstChargeExVat * 1.2;

  return (
    <div className="px-8 py-7">
      <div className="rounded-xl overflow-hidden border border-neutral-100">
        <div className="px-6 py-4 bg-neutral-50">
          <span
            className="text-[16px] text-neutral-900"
            style={{ fontFamily: "'Georgia', 'Playfair Display', serif" }}
          >
            Review details
          </span>
        </div>
        <ReviewRow label="Clinic" value={form.clinicName || "—"} />
        <ReviewRow label="Admin" value={form.adminName || "—"} />
        <ReviewRow label="Postcodes" value={postcodeList} />
        <ReviewRow label="Plan" value={planInfo ? planInfo.name : "—"} />
        {isEnterprise && <ReviewRow label="Locations" value={form.locations} />}
        <ReviewRow
          label="Monthly fee"
          value={`£${pricing.monthly.toLocaleString()}/mo${discountPct ? ` (−${discountPct}% first 3 mo)` : ""}`}
        />
        <ReviewRow
          label="Setup fee (one-off)"
          value={`£${pricing.setup.toLocaleString()}`}
        />
        {!isEnterprise && (
          <ReviewRow
            label="First charge (incl. VAT)"
            value={`£${firstChargeIncVat.toFixed(2)}`}
            bold
          />
        )}
      </div>

      {isEnterprise ? (
        <div className="rounded-lg px-4 py-3 mt-4 bg-amber-50 flex items-start gap-2">
          <HiOutlinePhone
            size={17}
            className="text-amber-600 shrink-0 mt-0.5"
          />
          <span className="text-[13.5px] text-amber-900">
            Enterprise is agreed directly with sales — there's no self-serve
            checkout for this tier. Submitting here sends this configuration to
            sales for contract and manual billing setup; the workspace won't
            auto-activate on payment the way self-serve tiers do.
          </span>
        </div>
      ) : (
        <div className="rounded-lg px-4 py-3 mt-4 bg-blue-50 flex items-start gap-2">
          <HiOutlineInformationCircle
            size={17}
            className="text-blue-500 shrink-0 mt-0.5"
          />
          <span className="text-[13.5px] text-blue-900">
            On payment, the workspace activates, postcodes lock, and the admin
            gets a welcome email with login details.
          </span>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Modal wrapper
// ---------------------------------------------------------------------------

const initialForm = {
  clinicName: "Riverside Ortho",
  tradingCompany: "",
  city: "",
  adminName: "Dr. Sofia Reyes",
  adminEmail: "",
  postcodes: [
    { code: "M1", unavailable: false, override: false },
    { code: "M2", unavailable: false, override: false },
    { code: "M3", unavailable: false, override: false },
    { code: "M4", unavailable: true, override: false },
  ],
  lat: "",
  lng: "",
  plan: "growth",
  locations: 1,
  discount: "none",
  promoCode: "",
};

function OnboardClinicModal({ open, onClose }) {
  const { allPlan: plans = [], isLoading: plansLoading } = usePlanData();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);

  const isEnterprise = form.plan === "enterprise";

  const close = () => {
    onClose();
    setTimeout(() => {
      setStep(1);
      setForm(initialForm);
    }, 200);
  };

  const next = () => setStep((s) => Math.min(4, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const selectedPlan = plans.find((p) => p.key === form.plan);
      const planId = selectedPlan?.id || form.plan;

      const payload = {
        name: form.clinicName,
        tradingCompany: form.tradingCompany,
        city: form.city,
        locations: form.locations,
        numberOfLocations: form.locations,
        planId: planId,
        adminName: form.adminName,
        adminEmail: form.adminEmail,
        lat: form.lat,
        lng: form.lng,
        discount: form.discount,
        promoCode: form.promoCode,
        clinicPostCode: form.postcodes,
      };

      await API.post("/clinic/create", payload);
      message.success("Clinic created successfully!");
      close();
    } catch (error) {
      console.error(error);
      message.error(error?.response?.data?.message || "Failed to create clinic");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={close}
      footer={null}
      centered
      width={620}
      closeIcon={<span className="text-neutral-400 text-lg">×</span>}
      styles={{ content: { padding: 0, borderRadius: 16, overflow: "hidden" } }}
    >
      <div className="px-8 pt-6 pb-2">
        <span
          className="text-[12.5px] font-semibold tracking-wide"
          style={{ color: "#C9821F" }}
        >
          New Tenant
        </span>
        <h2
          className="text-[26px] text-neutral-900 mt-1"
          style={{ fontFamily: "'Georgia', 'Playfair Display', serif" }}
        >
          Onboard a clinic
        </h2>
        <p className="text-[13.5px] text-neutral-500 mt-1">
          Create workspace, reserve postcode, and send Stripe checkout.
        </p>
      </div>

      <div className="border-b border-neutral-100">
        <StepIndicator currentStep={step} />
      </div>

      <div style={{ backgroundColor: "#EDE9E3" }}>
        {step === 1 && <StepClinicDetails form={form} setForm={setForm} />}
        {step === 2 && <StepExclusivity form={form} setForm={setForm} />}
        {step === 3 && <StepPlanTier form={form} setForm={setForm} plans={plans} />}
        {step === 4 && <StepCheckout form={form} plans={plans} />}
      </div>

      <div className="flex justify-between items-center px-8 py-5 bg-white border-t border-neutral-100">
        {step > 1 ? (
          <Button
            onClick={back}
            className="!rounded-lg !text-[13.5px] !font-medium !h-10 !px-5"
          >
            Back
          </Button>
        ) : (
          <span />
        )}

        {step < 4 ? (
          <Button
            type="primary"
            onClick={next}
            className="!rounded-lg !bg-neutral-900 !border-neutral-900 !text-[13.5px] !font-medium !h-10 !px-6"
          >
            Continue
          </Button>
        ) : isEnterprise ? (
          // Enterprise: never expose an automated Stripe checkout link.
          <Button
            type="primary"
            onClick={handleSubmit}
            loading={loading}
            className="!rounded-lg !bg-neutral-900 !border-neutral-900 !text-[13.5px] !font-medium !h-10 !px-6"
          >
            Send to sales for approval
          </Button>
        ) : (
          <Button
            type="primary"
            onClick={handleSubmit}
            loading={loading}
            className="!rounded-lg !bg-emerald-600 !border-emerald-600 !text-[13.5px] !font-medium !h-10 !px-6"
          >
            Send Stripe checkout link
          </Button>
        )}
      </div>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Trigger
// ---------------------------------------------------------------------------

export default function OnboardClinic() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <Button
        type="primary"
        onClick={() => setOpen(true)}
        className="!rounded-lg !bg-neutral-900 !border-neutral-900 !text-[13.5px] !font-medium !h-9"
      >
        Onboard a clinic
      </Button>

      <OnboardClinicModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
