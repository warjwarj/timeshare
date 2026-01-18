import { useEffect, useState } from 'react';
import '../../../index.css';
import type { AvailabilityRuleDTO } from '../../types/AvailabilityRuleDTO';
import { WeekDayEnum } from '../../types/dateTypes';
import { SaveButton } from '../SaveButton';
import { selectSelectedIanaTimezone } from "../../store/slices/appSlice";
import { TZDate } from '@date-fns/tz';
import { isValid } from "date-fns";
import { ourUseSelector } from '../../store/hooks';

// consts
const WEEKDAY_NAMES = Object.values(WeekDayEnum).map(wd => wd.substring(0, 3));
const inputClass = "w-full px-4 py-2 bg-[#F5F5F5] dark:bg-[#2A2A2A] border border-light-border dark:border-dark-border text-light-primary-text dark:text-dark-primary-text rounded-lg focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent focus:border-transparent";
const labelClass = "block text-sm font-medium text-light-primary-text dark:text-dark-primary-text mb-2";

type AvailabilityRuleModalContentProps = {
  rule: AvailabilityRuleDTO
  editing: boolean
  onDelete: (uuid: string) => void
  onSave: (rule: AvailabilityRuleDTO, uuid?: string) => void;
  onClose: () => void;
}

const AvailabilityRuleModalContent: React.FC<AvailabilityRuleModalContentProps> = ({ rule, editing, onClose, onSave }) => {
  const tz = ourUseSelector(selectSelectedIanaTimezone)

  // init form data with rule values if they exist
  const [formData, setFormData] = useState({
    uuid: "",
    name: rule.name || "",
    prevents_booking: rule.prevents_booking || false,
    weekdays: rule.weekdays || [],
    start_datetime: rule.start_datetime?.split('T')[0] || "",
    end_datetime: rule.end_datetime?.split('T')[0] || "",
    start_time: rule.start_time || '',
    end_time: rule.end_time || '',
  })

  useEffect(() => {
    console.log(formData)
  }, [formData])

  const toggleWeekday = (day: number) => {
    setFormData(prev => ({
      ...prev,
      weekdays: prev.weekdays.includes(day)
        ? prev.weekdays.filter(d => d !== day)
        : [...prev.weekdays, day].sort()
    }));
  };

  const internalSave = () => {
    const outgoingState: AvailabilityRuleDTO = {
      ...formData,
      ...(rule?.uuid && { uuid: rule.uuid })
    }
    onSave(outgoingState);
    onClose()
  }

  return (
    <div className="space-y-4"
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          internalSave()
        }
      }}>
      {/* Name */}
      <div>
        <label htmlFor="rule-name" className={labelClass}>
          Rule Name
        </label>
        <input
          type="text"
          id="rule-name"
          defaultValue={rule.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className={inputClass}
          placeholder="e.g., Lunch Break"
        />
      </div>

      {/* Prevents Booking Toggle */}
      <div>
        <label className={labelClass}>Rule Type</label>
        <label className="inline-flex items-center cursor-pointer">
          <span className="select-none me-3 text-sm text-light-secondary-text dark:text-dark-secondary-text">Allows</span>
          <input
            type="checkbox"
            checked={rule.prevents_booking}
            onChange={(e) => setFormData(prev => ({ ...prev, prevents_booking: e.target.checked }))}
            className="sr-only peer"
          />
          <div className="relative w-11 h-6 bg-green-500 rounded-full peer peer-checked:bg-red-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:start-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
          <span className="select-none ms-3 text-sm text-light-secondary-text dark:text-dark-secondary-text">Blocks</span>
        </label>
      </div>

      {/* Weekdays */}
      <div>
        <label className={labelClass}>Weekdays (optional)</label>
        <div className="flex flex-wrap gap-2">
          {WEEKDAY_NAMES.map((name, index) => (
            <button
              key={index}
              type="button"
              onClick={() => toggleWeekday(index)}
              className={`px-3 py-1 text-sm rounded-full border transition-colors ${formData.weekdays.includes(index)
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-transparent text-light-primary-text dark:text-dark-primary-text border-light-border dark:border-dark-border hover:bg-light-accent dark:hover:bg-dark-accent'
                }`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {/* Date Range */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="start-date" className={labelClass}>
            Rule start datetime (optional)
          </label>
          <input
            type="datetime-local"
            id="start-datetime"
            value={formData.start_datetime}
            onChange={(e) => setFormData(prev => ({ ...prev, start_datetime: new TZDate(e.target.value, tz).toISOString() }))}
            className={inputClass}
            required
          />
        </div>
        <div>
          <label htmlFor="end-date" className={labelClass}>
            Rule end datetime (optional)
          </label>
          <input
            type="datetime-local"
            id="end-datetime"
            value={formData.end_datetime}
            onChange={(e) => setFormData(prev => ({ ...prev, end_datetime: e.target.value }))}
            className={inputClass}
            required
          />
        </div>
      </div>

      {/* Time Range */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="start-time" className={labelClass}>
            Start time per day (optional)
          </label>
          <input
            type="time"
            id="start-time"
            value={formData.start_time}
            onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="end-time" className={labelClass}>
            End time per day (optional)
          </label>
          <input
            type="time"
            id="end-time"
            value={formData.end_time}
            onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex justify-between gap-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm text-light-primary-text dark:text-dark-primary-text border border-light-border dark:border-dark-border rounded-lg hover:bg-light-accent dark:hover:bg-dark-accent transition-colors"
        >
          Cancel
        </button>
        <SaveButton onClick={() => internalSave()}>
          {editing ? 'Update' : 'Create'}
        </SaveButton>
      </div>
    </div>
  )
};

export { AvailabilityRuleModalContent };
export type { AvailabilityRuleModalContentProps }
