import React, { useState, useMemo } from "react";
import {
  Table,
  Tag,
  Button,
  Modal,
  Form,
  Input,
  Switch,
  Tabs,
  Popconfirm,
  message,
  Spin,
  Badge,
  Card,
  Collapse,
} from "antd";
import {
  RiAddLine,
  RiCheckLine,
  RiEyeLine,
  RiHistoryLine,
  RiFileList3Line,
  RiShieldCheckLine,
  RiFileTextLine,
  RiTimeLine,
  RiDeleteBinLine,
} from "react-icons/ri";
import {
  useLegalDocuments,
  useClinicAcceptances,
  useLegalDocumentDetail,
  createDocumentVersionApi,
  publishDocumentVersionApi,
} from "../../api/legalApi";

export default function LegalDocumentManager({
  type = "TERMS_OF_SERVICE",
  title = "Terms of Service Management",
  description = "Manage document versions. When a clinic signs up, their agreement is locked to that version. New versions only apply to new sign-ups or explicit re-acceptance.",
  icon: PageIcon = RiFileTextLine,
}) {
  const { documents, isLoading: docsLoading, refetch: refetchDocs } = useLegalDocuments(type);
  const { acceptances, isLoading: accsLoading, refetch: refetchAccs } = useClinicAcceptances(type);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [viewDocId, setViewDocId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [publishingId, setPublishingId] = useState(null);

  const { document: viewDoc, isLoading: viewLoading } = useLegalDocumentDetail(viewDocId);

  const [form] = Form.useForm();

  // Find active version
  const activeDoc = useMemo(() => {
    return documents.find((d) => d.status === "ACTIVE") || documents[0];
  }, [documents]);

  const { document: fullActiveDoc, isLoading: activeLoading } = useLegalDocumentDetail(activeDoc?.id);

  const totalAcceptances = useMemo(() => {
    return documents.reduce((acc, curr) => acc + (curr.acceptedCount || 0), 0);
  }, [documents]);

  // Open create version modal pre-filled with active document content
  const handleOpenCreateModal = () => {
    const nextVer = activeDoc ? `v${(parseFloat(activeDoc.version.replace("v", "")) + 0.1).toFixed(1)}` : "v1.1";
    const initialSections = fullActiveDoc?.content || [
      { id: "s1", title: "1. Introduction", content: "Enter section content..." },
    ];

    form.setFieldsValue({
      version: nextVer,
      title: activeDoc?.title || title,
      changeSummary: "",
      publishNow: true,
      sections: Array.isArray(initialSections) ? initialSections : [],
    });
    setCreateModalOpen(true);
  };

  const handleCreateVersion = async (values) => {
    try {
      setSubmitting(true);
      await createDocumentVersionApi({
        type,
        version: values.version,
        title: values.title,
        changeSummary: values.changeSummary,
        content: values.sections || [],
        status: values.publishNow ? "ACTIVE" : "DRAFT",
      });

      message.success(`Version ${values.version} created successfully!`);
      setCreateModalOpen(false);
      form.resetFields();
      refetchDocs();
      refetchAccs();
    } catch (err) {
      message.error(err?.response?.data?.message || "Failed to create version");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePublishActive = async (id, version) => {
    try {
      setPublishingId(id);
      await publishDocumentVersionApi(id);
      message.success(`Version ${version} is now the ACTIVE version for all new sign-ups!`);
      refetchDocs();
    } catch (err) {
      message.error(err?.response?.data?.message || "Failed to publish version");
    } finally {
      setPublishingId(null);
    }
  };

  // Version History Columns
  const historyColumns = [
    {
      title: "Version",
      dataIndex: "version",
      key: "version",
      render: (v) => <span className="font-semibold text-slate-900 font-mono text-sm">{v}</span>,
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (t) => <span className="font-medium text-slate-800">{t}</span>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const isAct = status === "ACTIVE";
        const isDraft = status === "DRAFT";
        return (
          <Tag color={isAct ? "green" : isDraft ? "gold" : "default"} className="font-semibold">
            {status}
          </Tag>
        );
      },
    },
    {
      title: "Change Summary",
      dataIndex: "changeSummary",
      key: "changeSummary",
      render: (c) => <span className="text-slate-500 text-xs">{c || "—"}</span>,
    },
    {
      title: "Effective Date",
      dataIndex: "effectiveDate",
      key: "effectiveDate",
      render: (d) => <span className="text-slate-500 text-xs">{d ? new Date(d).toLocaleDateString("en-GB") : "—"}</span>,
    },
    {
      title: "Accepted Clinics",
      dataIndex: "acceptedCount",
      key: "acceptedCount",
      render: (count) => (
        <span className="font-semibold text-slate-900 tabular-nums">
          {count || 0}
        </span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <Button
            size="small"
            icon={<RiEyeLine />}
            onClick={() => setViewDocId(record.id)}
            className="!text-xs"
          >
            View
          </Button>
          {record.status !== "ACTIVE" && (
            <Popconfirm
              title={`Set ${record.version} as ACTIVE?`}
              description="New clinics will be required to accept this version during onboarding."
              onConfirm={() => handlePublishActive(record.id, record.version)}
              okText="Publish"
              cancelText="Cancel"
            >
              <Button
                size="small"
                type="primary"
                loading={publishingId === record.id}
                icon={<RiCheckLine />}
                className="!text-xs !bg-slate-900"
              >
                Set as Active
              </Button>
            </Popconfirm>
          )}
        </div>
      ),
    },
  ];

  // Clinic Acceptances Columns
  const acceptancesColumns = [
    {
      title: "Clinic",
      dataIndex: "clinicName",
      key: "clinicName",
      render: (name) => <span className="font-semibold text-slate-900">{name}</span>,
    },
    {
      title: "City",
      dataIndex: "city",
      key: "city",
      render: (c) => <span className="text-slate-500 text-xs">{c}</span>,
    },
    {
      title: "Admin Email",
      dataIndex: "adminEmail",
      key: "adminEmail",
      render: (e) => <span className="text-slate-600 text-xs font-mono">{e}</span>,
    },
    {
      title: type === "TERMS_OF_SERVICE" ? "Accepted Terms" : "Accepted Privacy",
      key: "version",
      render: (_, r) => (
        <Tag color="cyan" className="font-mono font-semibold">
          {type === "TERMS_OF_SERVICE" ? r.termsVersion : r.privacyVersion}
        </Tag>
      ),
    },
    {
      title: "Accepted At",
      dataIndex: "acceptedAt",
      key: "acceptedAt",
      render: (d) => (
        <span className="text-slate-500 text-xs tabular-nums">
          {d ? new Date(d).toLocaleString("en-GB") : "—"}
        </span>
      ),
    },
    {
      title: "IP Address",
      dataIndex: "ipAddress",
      key: "ipAddress",
      render: (ip) => <span className="text-slate-400 text-xs font-mono">{ip}</span>,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-slate-900 text-white text-lg">
              <PageIcon />
            </span>
            <h1
              className="text-[30px] text-neutral-900 font-semibold"
              style={{ fontFamily: "'Georgia', 'Playfair Display', serif" }}
            >
              {title}
            </h1>
          </div>
          <p className="text-neutral-500 text-[14px] max-w-2xl leading-relaxed">
            {description}
          </p>
        </div>

        <Button
          type="primary"
          icon={<RiAddLine size={16} />}
          onClick={handleOpenCreateModal}
          className="!h-10 !px-5 !rounded-xl !bg-slate-900 hover:!bg-slate-800 !font-medium"
        >
          Create New Version
        </Button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
            Current Active Version
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-slate-900">
              {activeDoc?.version || "v1.0"}
            </span>
            <Tag color="green" className="font-semibold !m-0">
              Live &amp; Enforced
            </Tag>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Applies to all new clinics onboarding today
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
            Total Versions
          </span>
          <div className="mt-2 text-3xl font-bold font-mono text-slate-900">
            {documents.length}
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Historical audit snapshots preserved in database
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
            Clinic Agreements Signed
          </span>
          <div className="mt-2 text-3xl font-bold font-mono text-emerald-600">
            {totalAcceptances || acceptances.length}
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Each clinic locked to their accepted version
          </p>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <Tabs
          defaultActiveKey="active"
          items={[
            {
              key: "active",
              label: (
                <span className="flex items-center gap-1.5 font-medium">
                  <RiShieldCheckLine /> Active Document ({activeDoc?.version || "v1.0"})
                </span>
              ),
              children: activeLoading ? (
                <div className="py-12 text-center text-slate-400">
                  <Spin className="mr-2" /> Loading active document sections...
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">
                        {fullActiveDoc?.title || activeDoc?.title}
                      </h2>
                      <span className="text-xs text-slate-400">
                        Version {activeDoc?.version} · Effective from{" "}
                        {activeDoc?.effectiveDate
                          ? new Date(activeDoc.effectiveDate).toLocaleDateString("en-GB")
                          : "1 Jan 2026"}
                      </span>
                    </div>
                    <Button
                      icon={<RiAddLine />}
                      onClick={handleOpenCreateModal}
                      className="!rounded-lg"
                    >
                      Branch to New Version
                    </Button>
                  </div>

                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                    {Array.isArray(fullActiveDoc?.content) && fullActiveDoc?.content.length > 0 ? (
                      fullActiveDoc.content.map((sec, idx) => (
                        <div
                          key={sec.id || idx}
                          className="rounded-xl border border-slate-100 bg-slate-50/60 p-4"
                        >
                          <div className="font-semibold text-slate-900 text-sm mb-1.5 flex items-center justify-between">
                            <span>{sec.title || sec.label}</span>
                            <span className="font-mono text-xs text-slate-400">§ {idx + 1}</span>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line m-0">
                            {sec.content}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-400 py-6 text-center">
                        No sections available. Click 'Create New Version' to add sections.
                      </p>
                    )}
                  </div>
                </div>
              ),
            },
            {
              key: "history",
              label: (
                <span className="flex items-center gap-1.5 font-medium">
                  <RiHistoryLine /> Version History
                </span>
              ),
              children: (
                <Table
                  rowKey="id"
                  columns={historyColumns}
                  dataSource={documents}
                  loading={docsLoading}
                  pagination={{ pageSize: 8 }}
                />
              ),
            },
            {
              key: "acceptances",
              label: (
                <span className="flex items-center gap-1.5 font-medium">
                  <RiFileList3Line /> Clinic Acceptances ({acceptances.length})
                </span>
              ),
              children: (
                <Table
                  rowKey="id"
                  columns={acceptancesColumns}
                  dataSource={acceptances}
                  loading={accsLoading}
                  pagination={{ pageSize: 10 }}
                />
              ),
            },
          ]}
        />
      </div>

      {/* Create New Version Modal */}
      <Modal
        title={`Create New Version — ${title}`}
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={submitting}
        okText="Save Version"
        width={720}
        destroyOnClose
      >
        <p className="text-xs text-slate-500 mb-4">
          Creating a new version leaves already-onboarded clinics locked to their existing
          accepted terms. Only new sign-ups or users asked to re-accept will see this version.
        </p>

        <Form form={form} layout="vertical" onFinish={handleCreateVersion}>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label="Version Number"
              name="version"
              rules={[{ required: true, message: "Enter version e.g. v1.1" }]}
            >
              <Input placeholder="e.g. v1.1 or v2.0" className="font-mono" />
            </Form.Item>

            <Form.Item
              label="Document Title"
              name="title"
              rules={[{ required: true, message: "Enter document title" }]}
            >
              <Input placeholder="e.g. Platform Terms and Conditions" />
            </Form.Item>
          </div>

          <Form.Item label="Change Summary (What changed?)" name="changeSummary">
            <Input placeholder="e.g. Clarified Clause 4 regarding geographic exclusivity terms." />
          </Form.Item>

          <Form.Item
            label="Make Active immediately for new sign-ups?"
            name="publishNow"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          {/* Dynamic Sections List */}
          <div className="border-t border-slate-100 pt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-slate-800 text-sm">Document Sections</span>
            </div>

            <Form.List name="sections">
              {(fields, { add, remove }) => (
                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                  {fields.map(({ key, name, ...restField }, idx) => (
                    <div
                      key={key}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-3 relative"
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="font-mono text-xs font-semibold text-slate-500">
                          Section {idx + 1}
                        </span>
                        {fields.length > 1 && (
                          <Button
                            type="text"
                            danger
                            size="small"
                            icon={<RiDeleteBinLine />}
                            onClick={() => remove(name)}
                          />
                        )}
                      </div>
                      <Form.Item
                        {...restField}
                        name={[name, "title"]}
                        rules={[{ required: true, message: "Section title required" }]}
                        className="!mb-2"
                      >
                        <Input placeholder="Section Title (e.g. 1. Introduction)" />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, "content"]}
                        rules={[{ required: true, message: "Section content required" }]}
                        className="!mb-0"
                      >
                        <Input.TextArea
                          rows={3}
                          placeholder="Section text and terms details..."
                        />
                      </Form.Item>
                    </div>
                  ))}
                  <Button
                    type="dashed"
                    onClick={() => add({ id: `s_${Date.now()}`, title: "", content: "" })}
                    block
                    icon={<RiAddLine />}
                  >
                    Add Another Section
                  </Button>
                </div>
              )}
            </Form.List>
          </div>
        </Form>
      </Modal>

      {/* View Historical Version Modal */}
      <Modal
        title={`Version Snapshot: ${viewDoc?.version}`}
        open={!!viewDocId}
        onCancel={() => setViewDocId(null)}
        footer={[
          <Button key="close" onClick={() => setViewDocId(null)}>
            Close
          </Button>,
        ]}
        width={720}
      >
        {viewLoading ? (
          <div className="py-8 text-center">
            <Spin />
          </div>
        ) : (
          <div className="flex flex-col gap-4 py-2">
            <div className="bg-slate-50 p-3 rounded-lg flex items-center justify-between text-xs text-slate-600">
              <div>
                <strong>Status:</strong> {viewDoc?.status} · <strong>Effective:</strong>{" "}
                {viewDoc?.effectiveDate ? new Date(viewDoc.effectiveDate).toLocaleDateString("en-GB") : "—"}
              </div>
              <div>
                <strong>Clinics on this version:</strong> {viewDoc?.termsAcceptances?.length || viewDoc?.privacyAcceptances?.length || 0}
              </div>
            </div>

            {viewDoc?.changeSummary && (
              <div className="text-xs text-slate-500 bg-amber-50 p-2.5 rounded-lg border border-amber-100">
                <strong>Change summary:</strong> {viewDoc.changeSummary}
              </div>
            )}

            <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2">
              {Array.isArray(viewDoc?.content) &&
                viewDoc?.content.map((sec, idx) => (
                  <div key={idx} className="p-3 rounded-lg border border-slate-100 bg-white">
                    <div className="font-semibold text-slate-900 text-sm mb-1">{sec.title || sec.label}</div>
                    <p className="text-xs text-slate-600 whitespace-pre-line m-0 leading-relaxed">{sec.content}</p>
                  </div>
                ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
