import { ourUseDispatch, ourUseSelector } from '../store/hooks';
import { selectSelectedIanaTimezone, setSelectedTimezone } from "../store/slices/appSlice";
import { SaveButton } from './SaveButton';

import '../../index.css';
import { useState } from 'react';

// consts
const timezones = Intl.supportedValuesOf('timeZone');

type TimezoneSelectorModalContentProps = {
  onClose: () => void;
}

const TimezoneSelectorModalContent: React.FC<TimezoneSelectorModalContentProps> = ({ onClose }) => {
  const selectedTimezone = ourUseSelector(selectSelectedIanaTimezone)
  const dispatch = ourUseDispatch()
  const [internalSelectedTz, setInternalSelectedTz] = useState("")

  const internalSave = () => {
    dispatch(setSelectedTimezone({ newTz: internalSelectedTz }))
  }

  const internalResetToLocal = () => {
    const loc = Intl.DateTimeFormat().resolvedOptions().timeZone
    dispatch(setSelectedTimezone({ newTz: loc }))
    onClose()
  }

  return (
    <div className="space-y-4">

      {/* Timezone selector */}
      {timezones && (
        <select id="timezone-selector" name="timezones" onChange={(e) => setInternalSelectedTz(e.target.value)}>
          {timezones.map(tz => {
            const tzStr = tz.toString()
            const selected = tzStr === selectedTimezone;
            if (selected) {
              return <option value={tz} selected>{tz.toString()}</option>
            } else {
              return <option value={tz}>{tz.toString()}</option>
            }
          })}
        </select>
      )}

      <div className="flex justify-between gap-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm text-light-primary-text dark:text-dark-primary-text border border-light-border dark:border-dark-border rounded-lg hover:bg-light-accent dark:hover:bg-dark-accent transition-colors"
        >
          Cancel
        </button>
        <button 
          type="button"
          onClick={internalResetToLocal}
          className="px-4 py-2 text-sm text-light-primary-text dark:text-dark-primary-text border border-light-border dark:border-dark-border rounded-lg hover:bg-light-accent dark:hover:bg-dark-accent transition-colors">
          Reset to detected local timezone
        </button>
        <SaveButton onClick={() => internalSave()}>
          Save
        </SaveButton>
      </div>
    </div>
  )
};

export { TimezoneSelectorModalContent };
export type { TimezoneSelectorModalContentProps };

