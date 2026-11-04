import React, { useState, useEffect } from "react";
import { DatePicker, Space, Radio } from "antd";
import dayjs from "dayjs";
import PropTypes from "prop-types";

const { RangePicker } = DatePicker;

function DateSelect({
  initialRange = "1m",
  onApply,
  isLoading = false,
  quickOptions = ["Today", "1w", "1m", "3m", "6m", "1y"],
}) {
  const [dateRange, setDateRange] = useState(initialRange);
  const [customRange, setCustomRange] = useState(null);

  // Quick Range → Auto Apply
  useEffect(() => {
    if (!dateRange) return;

    const today = new Date();
    let startDate = new Date(today);
    const endDate = new Date(today);

    switch (dateRange) {
      case "Today":
        startDate.setHours(0, 0, 0, 0);
        break;
      case "1w":
        startDate.setDate(today.getDate() - 7);
        break;
      case "1m":
        startDate.setMonth(today.getMonth() - 1);
        break;
      case "3m":
        startDate.setMonth(today.getMonth() - 3);
        break;
      case "6m":
        startDate.setMonth(today.getMonth() - 6);
        break;
      case "1y":
        startDate.setFullYear(today.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(today.getMonth() - 1);
    }

    if (onApply) {
      onApply({
        startDate: dayjs(startDate).format("YYYY-MM-DD"),
        endDate: dayjs(endDate).format("YYYY-MM-DD"),
      });
    }

    setCustomRange(null);
  }, [dateRange]);

  // Custom Range → Auto Apply
  const handleCustomRange = (_, dateStrings) => {
    if (!dateStrings || !dateStrings[0]) {
      setCustomRange(null);
      setDateRange(null);
      return;
    }

    setCustomRange(dateStrings);
    setDateRange(null);

    if (onApply) {
      onApply({
        startDate: dateStrings[0],
        endDate: dateStrings[1],
      });
    }
  };

  const rangePickerValue =
    customRange?.length === 2
      ? [dayjs(customRange[0]), dayjs(customRange[1])]
      : null;

  return (
    <Space size="middle">
      <Radio.Group
        value={dateRange}
        onChange={(e) => setDateRange(e.target.value)}
        buttonStyle="solid"
        disabled={isLoading}
      >
        {quickOptions.map((opt) => (
          <Radio.Button key={opt} value={opt}>
            {opt.toUpperCase()}
          </Radio.Button>
        ))}
      </Radio.Group>

      <RangePicker
        onChange={handleCustomRange}
        value={rangePickerValue}
        format="YYYY-MM-DD"
        disabled={isLoading}
        allowClear
      />
    </Space>
  );
}

DateSelect.propTypes = {
  initialRange: PropTypes.string,
  onApply: PropTypes.func,
  isLoading: PropTypes.bool,
  quickOptions: PropTypes.arrayOf(PropTypes.string),
};

export default DateSelect;
