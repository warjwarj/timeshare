import { useState } from 'react';
import '../../../index.css';
import { deleteAvailabilityRule, updateAvailabilityRule } from '../../store/slices/availabilitySlice';
import type { AvailabilityRuleDTO } from '../../types/AvailabilityRuleDTO';
import { WeekDayEnum } from '../../types/dateTypes';
import { ourUseDispatch } from '../../store/hooks';
import { createPortal } from 'react-dom';
import { AvailabilityRuleModalContent } from './AvailabilityRuleModalContent';
import { Modal } from '../Modal';
import React from 'react';
import { formatDate } from '../../utils/utils';

const WEEKDAY_NAMES = Object.values(WeekDayEnum).map(wd => wd.substring(0, 3));

type AvailabilityRuleListItemProps = {
  rule: AvailabilityRuleDTO & { uuid: string }
}

const AvailabilityRuleListItem: React.FC<AvailabilityRuleListItemProps> = ({ rule }) => {
  const dispatch = ourUseDispatch();

  const [showModal, setShowModal] = useState<boolean>(false)

  const onSave = async (rule: AvailabilityRuleDTO) => {
    await dispatch(updateAvailabilityRule({ ...rule, }));
  };

  const onDelete = async (uuid: string) => {
    await dispatch(deleteAvailabilityRule(uuid));
  };

  return (
    <React.Fragment key={rule.uuid}>
      <div
        key={rule.uuid}
        className="p-4 flex flex-col justify-between bg-light-background dark:bg-dark-background border border-light-border dark:border-dark-border rounded-lg"
      >
        <div className="flex gap-6 items-start mb-3">
          <h3 className="font-semibold text-light-primary-text dark:text-dark-primary-text">
            {rule.name}
          </h3>
          <span className={`px-2 py-1 text-xs rounded-full ${rule.prevents_booking
            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            }`}>
            {rule.prevents_booking ? 'Prevents' : 'Allows'}
          </span>
        </div>

        {(
          <div className="mb-2 text-sm text-light-secondary-text dark:text-dark-secondary-text">
            <span className="font-medium">Weekdays: </span>
            {rule.weekdays && (
              <>{rule.weekdays.map(d => WEEKDAY_NAMES[d]).join(', ')}</>
            )}
          </div>
        )}

        <div className="mb-2 text-sm text-light-secondary-text dark:text-dark-secondary-text">
          <span className="font-medium">Start & end: </span>
          {rule.start_datetime && rule.end_datetime && rule.iana_timezone && (
            <>{formatDate(new Date(rule.start_datetime), rule.iana_timezone)} to {formatDate(new Date(rule.end_datetime), rule.iana_timezone)}</>
          )}
        </div>

        <div className="mb-2 text-sm text-light-secondary-text dark:text-dark-secondary-text">
          <span className="font-medium">Working hours: </span>
          {rule.start_time || '00:00'} - {rule.end_time || '23:59'}
        </div>

        <div className="flex justify-start gap-2 mt-4">
          <button
            onClick={() => setShowModal(true)}
            className="px-3 py-1 text-sm bg-light-accent dark:bg-dark-accent text-light-primary-text dark:text-dark-primary-text rounded hover:opacity-80 transition-opacity"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(rule.uuid ?? "")}
            className="px-3 py-1 text-sm bg-red-400 text-white rounded hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      {showModal && createPortal(
        <Modal
          label="Edit availability rule"
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        >
          <AvailabilityRuleModalContent
            rule={rule}
            editing={true}
            onClose={() => setShowModal(false)}
            onDelete={onDelete}
            onSave={onSave}
          />
        </Modal>,
        document.body
      )}
    </React.Fragment>
  )
};

export { AvailabilityRuleListItem };
export type { AvailabilityRuleListItemProps }