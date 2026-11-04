import React, { useState } from "react";
import { Modal, Select } from "antd";
import { FiPlay, FiX, FiCalendar, FiDownload } from "react-icons/fi";

const stageOptions = [
  { value: "New", label: "New" },
  { value: "Qualified", label: "Qualified" },
  { value: "Booked", label: "Booked" },
  { value: "Converted", label: "Converted" },
];

const transcript = [
  {
    speaker: "AI",
    text: "Hi, this is Bright Smile Dental calling about your dental implant enquiry. Is now a good time for a quick chat?",
  },
  { speaker: "SARAH", text: "Yes, that's fine." },
  { speaker: "AI", text: "Lovely. Which teeth are you looking to replace?" },
  {
    speaker: "SARAH",
    text: "I'm missing two lower molars and I'd like to get it sorted within the month.",
  },
];

function TranscriptBubble({ speaker, text }) {
  const isAI = speaker === "AI";
  return (
    <div className="flex gap-3">
      <span
        className={`text-[10px] font-mono uppercase tracking-wider w-11 shrink-0 pt-3 ${
          isAI ? "text-teal-600" : "text-orange-500"
        }`}
      >
        {speaker}
      </span>
      <div
        className={`flex-1 rounded-xl px-4 py-3 text-sm text-gray-700 leading-relaxed ${
          isAI ? "bg-white border border-gray-100" : "bg-amber-50/70"
        }`}
      >
        {text}
      </div>
    </div>
  );
}

function ViewDetails() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const showModal = () => setIsModalOpen(true);
  const handleCancel = () => setIsModalOpen(false);

  return (
    <>
      <button
        onClick={showModal}
        className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:border-gray-400 transition-colors"
      >
        <FiPlay size={12} />
      </button>

      <Modal
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        closable={false}
        width={474}
        styles={{
          content: { padding: 0, borderRadius: 20, overflow: "hidden" },
        }}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-5 border-b border-gray-100 relative">
          <button
            onClick={handleCancel}
            className="absolute top-5 right-5 text-gray-300 hover:text-gray-500 transition-colors"
          >
            <FiX size={20} />
          </button>

          <div className="flex items-start gap-3">
            <span className="w-11 h-11 rounded-full bg-orange-400 text-white flex items-center justify-center font-semibold text-sm shrink-0">
              SW
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold text-gray-900">
                  Sarah Whitman
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-orange-500 text-white">
                  🔥 Hot
                </span>
              </div>
              <div className="text-sm text-gray-400 mt-0.5">
                Dental Implants · from Meta
              </div>
            </div>
          </div>
        </div>

        {/* Contact + stage/revenue */}
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <div className="text-xs font-medium text-teal-600 mb-1">Phone</div>
              <div className="text-sm text-gray-800">07700 900 412</div>
            </div>
            <div>
              <div className="text-xs font-medium text-teal-600 mb-1">Email</div>
              <div className="text-sm text-gray-800">sarah.w@email.com</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-medium text-teal-600 mb-1.5">
                Move to Stage
              </div>
              <Select
                defaultValue="Qualified"
                options={stageOptions}
                className="w-full"
                size="middle"
              />
            </div>
            <div>
              <div className="text-xs font-medium text-teal-600 mb-1.5">
                Revenue
              </div>
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                <span className="bg-gray-100 text-gray-500 text-sm px-3 py-1.5">
                  $
                </span>
                <input
                  type="text"
                  readOnly
                  defaultValue="200"
                  className="flex-1 text-sm px-3 py-1.5 text-gray-700 outline-none min-w-0"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Body: audio, summary, transcript */}
        <div className="px-6 py-5 bg-gray-50/60 max-h-[420px] overflow-y-auto">
          {/* Audio player */}
          <div className="flex items-center gap-4 bg-[#0B2C33] rounded-xl px-4 py-3 mb-5">
            <button className="w-9 h-9 rounded-full bg-teal-600 flex items-center justify-center shrink-0">
              <FiPlay size={13} className="text-white ml-0.5" />
            </button>
            <div className="flex-1 flex items-center gap-[3px] overflow-hidden">
              {Array.from({ length: 26 }).map((_, i) => (
                <span
                  key={i}
                  className="h-[2px] w-2 rounded-full bg-teal-500/40 shrink-0"
                />
              ))}
            </div>
            <span className="text-xs text-teal-400 font-mono shrink-0">3:12</span>
          </div>

          {/* AI Summary */}
          <div className="mb-5">
            <div className="text-xs font-medium text-teal-600 mb-2">
              AI Summary
            </div>
            <div className="bg-[#E9E4DC] rounded-xl px-4 py-3.5 text-sm text-gray-700 leading-relaxed">
              Caller is missing two lower molars, wants to proceed within a
              month, and is open to finance. Strong intent — flagged hot and
              SMS sent to staff.
            </div>
          </div>

          {/* Transcript */}
          <div>
            <div className="text-xs font-medium text-teal-600 mb-3">
              Transcript
            </div>
            <div className="flex flex-col gap-4">
              {transcript.map((t, i) => (
                <TranscriptBubble key={i} speaker={t.speaker} text={t.text} />
              ))}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100 bg-white">
          <button className="flex-1 inline-flex items-center justify-center gap-2 bg-orange-500 text-white text-sm font-medium py-2.5 rounded-xl hover:bg-orange-600 transition-colors">
            <FiCalendar size={14} />
            Booking Link
          </button>
          <button className="flex-1 inline-flex items-center justify-center gap-2 bg-white text-gray-700 text-sm font-medium py-2.5 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
            <FiDownload size={14} />
            Transcript
          </button>
        </div>
      </Modal>
    </>
  );
}

export default ViewDetails;