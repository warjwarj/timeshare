import { useEffect, useState } from 'react';
import { ViewBody } from '../components/ViewBody.tsx';
import { ViewHeader } from '../components/ViewHeader.tsx';
import {
  getAvailabilityRules,
  selectAvailabilityRules,
  selectAvailabilityPending,
  createAvailabilityRule,
  updateAvailabilityRule,
  deleteAvailabilityRule
} from '../store/slices/availabilitySlice.ts';
import { ourUseDispatch, ourUseSelector } from '../store/hooks.ts';
import { Modal } from '../components/Modal.tsx';
import { SaveButton } from '../components/SaveButton.tsx';
import type { AvailabilityRuleDTO } from '../types/AvailabilityRuleDTO';
import { WeekDayEnum } from '../types/dateTypes.ts';

const WEEKDAY_NAMES = Object.values(WeekDayEnum).map(wd => wd.substring(0, 3));

type AvailabilityRuleFormData = {
  uuid?: string;
  name: string;
  prevents_booking: boolean;
  weekdays: number[];
  start_time: string;
  end_time: string;
  start_date: string;
  end_date: string;
};

const emptyFormData: AvailabilityRuleFormData = {
  name: '',
  prevents_booking: true,
  weekdays: [],
  start_time: '',
  end_time: '',
  start_date: '',
  end_date: '',
};

const AvailabilityView: React.FC = () => {
  const dispatch = ourUseDispatch();
  const rules = ourUseSelector(selectAvailabilityRules);
  const pending = ourUseSelector(selectAvailabilityPending);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<AvailabilityRuleDTO | null>(null);
  const [formData, setFormData] = useState<AvailabilityRuleFormData>(emptyFormData);

  useEffect(() => {
    const promise = dispatch(getAvailabilityRules());
    return () => promise.abort();
  }, [dispatch]);

  const openCreateModal = () => {
    setEditingRule(null);
    setFormData(emptyFormData);
    setIsModalOpen(true);
  };

  const openEditModal = (rule: AvailabilityRuleDTO) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      prevents_booking: rule.prevents_booking,
      weekdays: rule.weekdays || [],
      start_time: rule.start_time || '',
      end_time: rule.end_time || '',
      start_date: rule.start_date?.split('T')[0] || '',
      end_date: rule.end_date?.split('T')[0] || '',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRule(null);
    setFormData(emptyFormData);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      return;
    }

    const ruleData: AvailabilityRuleDTO = {
      name: formData.name,
      prevents_booking: formData.prevents_booking,
      weekdays: formData.weekdays.length > 0 ? formData.weekdays : null,
      start_time: formData.start_time || null,
      end_time: formData.end_time || null,
      start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
      end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
    };

    if (editingRule) {
      await dispatch(updateAvailabilityRule({ ...ruleData, uuid: editingRule.uuid }));
    } else {
      await dispatch(createAvailabilityRule(ruleData));
    }
    closeModal();
  };

  const handleDelete = async (uuid: string) => {
    await dispatch(deleteAvailabilityRule(uuid));
  };

  const toggleWeekday = (day: number) => {
    setFormData(prev => ({
      ...prev,
      weekdays: prev.weekdays.includes(day)
        ? prev.weekdays.filter(d => d !== day)
        : [...prev.weekdays, day].sort()
    }));
  };

  const inputClass = "w-full px-4 py-2 bg-[#F5F5F5] dark:bg-[#2A2A2A] border border-light-border dark:border-dark-border text-light-primary-text dark:text-dark-primary-text rounded-lg focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent focus:border-transparent";
  const labelClass = "block text-sm font-medium text-light-primary-text dark:text-dark-primary-text mb-2";

  return (
    <ViewBody id={"AvailabilityView"}>
      <ViewHeader>
        <div className="flex ml-auto items-center">
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Add Rule
          </button>
        </div>
      </ViewHeader>

      <div className="flex-1 overflow-y-auto p-4">

        {!pending && rules.length === 0 && (
          <div className="text-center text-light-secondary-text dark:text-dark-secondary-text py-8">
            No availability rules yet. Click "Add Rule" to create one.
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rules.map(rule => (
            <div
              key={rule.uuid}
              className="p-4 bg-light-background dark:bg-dark-background border border-light-border dark:border-dark-border rounded-lg"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-light-primary-text dark:text-dark-primary-text">
                  {rule.name}
                </h3>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  rule.prevents_booking
                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                }`}>
                  {rule.prevents_booking ? 'Blocks' : 'Allows'}
                </span>
              </div>

              {rule.weekdays && rule.weekdays.length > 0 && (
                <div className="mb-2 text-sm text-light-secondary-text dark:text-dark-secondary-text">
                  <span className="font-medium">Days: </span>
                  {rule.weekdays.map(d => WEEKDAY_NAMES[d]).join(', ')}
                </div>
              )}

              {(rule.start_time || rule.end_time) && (
                <div className="mb-2 text-sm text-light-secondary-text dark:text-dark-secondary-text">
                  <span className="font-medium">Time: </span>
                  {rule.start_time || '00:00'} - {rule.end_time || '23:59'}
                </div>
              )}

              {(rule.start_date || rule.end_date) && (
                <div className="mb-2 text-sm text-light-secondary-text dark:text-dark-secondary-text">
                  <span className="font-medium">Dates: </span>
                  {rule.start_date?.split('T')[0] || 'Start'} to {rule.end_date?.split('T')[0] || 'End'}
                </div>
              )}

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => openEditModal(rule)}
                  className="px-3 py-1 text-sm bg-light-accent dark:bg-dark-accent text-light-primary-text dark:text-dark-primary-text rounded hover:opacity-80 transition-opacity"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(rule.uuid)}
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal
        label={editingRule ? 'Edit Rule' : 'Create Rule'}
        isOpen={isModalOpen}
        onClose={closeModal}
      >
        <div className="space-y-4">
          {/* Name */}
          <div>
            <label htmlFor="rule-name" className={labelClass}>
              Rule Name
            </label>
            <input
              type="text"
              id="rule-name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className={inputClass}
              placeholder="e.g., Lunch Break"
            />
          </div>

          {/* Prevents Booking Toggle */}
          <div>
            <label className={labelClass}>Rule Type</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="prevents_booking"
                  checked={formData.prevents_booking}
                  onChange={() => setFormData(prev => ({ ...prev, prevents_booking: true }))}
                  className="w-4 h-4"
                />
                <span className="text-sm text-light-primary-text dark:text-dark-primary-text">
                  Blocks booking
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="prevents_booking"
                  checked={!formData.prevents_booking}
                  onChange={() => setFormData(prev => ({ ...prev, prevents_booking: false }))}
                  className="w-4 h-4"
                />
                <span className="text-sm text-light-primary-text dark:text-dark-primary-text">
                  Allows booking
                </span>
              </label>
            </div>
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
                  className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                    formData.weekdays.includes(index)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-transparent text-light-primary-text dark:text-dark-primary-text border-light-border dark:border-dark-border hover:bg-light-accent dark:hover:bg-dark-accent'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="start-time" className={labelClass}>
                Start Time (optional)
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
                End Time (optional)
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

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="start-date" className={labelClass}>
                Start Date (optional)
              </label>
              <input
                type="date"
                id="start-date"
                value={formData.start_date}
                onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="end-date" className={labelClass}>
                End Date (optional)
              </label>
              <input
                type="date"
                id="end-date"
                value={formData.end_date}
                onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                className={inputClass}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <SaveButton onClick={handleSave}>
              {editingRule ? 'Update' : 'Create'}
            </SaveButton>
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 text-sm text-light-primary-text dark:text-dark-primary-text border border-light-border dark:border-dark-border rounded-lg hover:bg-light-accent dark:hover:bg-dark-accent transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </ViewBody>
  );
};

export { AvailabilityView };
