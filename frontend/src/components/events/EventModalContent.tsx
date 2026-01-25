// react
import { useState } from 'react';

// react types

// types
import type { EventDTO } from '../../types/EventDTO';

// utils

// css
import '../../../index.css';
import { SaveButton } from '../SaveButton';
import { ourUseSelector } from '../../store/hooks';
import { selectSelectedIanaTimezone } from '../../store/slices/appSlice';
import { toastService } from '../../toastService';

const inputClass = "w-full px-4 py-2 bg-[#F5F5F5] dark:bg-[#2A2A2A] border border-light-border dark:border-dark-border text-light-primary-text dark:text-dark-primary-text rounded-lg focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent focus:border-transparent";
const labelClass = "block text-sm font-medium text-light-primary-text dark:text-dark-primary-text mb-2";


/*
  Modal for adding or editing an event.
*/

type EventModalContentProps = {
  event: EventDTO & { start: Date, end: Date } | null;
  editing: boolean;
  onSave: (updatedEvent: EventDTO) => void;
  onDelete: (uuid: string) => void;
  onClose: () => void;
};
const EventModalContent: React.FC<EventModalContentProps> = ({ event, editing, onSave, onDelete, onClose }) => {
  const tz = ourUseSelector(selectSelectedIanaTimezone)

  console.log(event)

  // init form data with rule values if they exist
  const [formData, setFormData] = useState({
    name: event?.name || "",
    iana_timezone: event?.iana_timezone || tz,
    start: event?.start.toISOString().slice(0, 16) || "",
    end: event?.end?.toISOString().slice(0, 16) || "",
    colour: event?.colour || "#525252"
  })

  // save updated event object
  const internalSave = () => {
    const outgoingState: EventDTO = {
      ...formData,
      ...{ iana_timezone: editing ? formData.iana_timezone : tz },
      ...{ uuid: editing && event ? event.uuid : null },
    }
    onSave(outgoingState)
    onClose();
  }

  // delete event
  const internalDelete = () => {
    if (editing && event?.uuid) {
      onDelete(event.uuid);
      onClose();
    } else {
      toastService.showError("Couldn't delete event", "Event's uuid was null. This shouldn't happen...")
    }
  }

  return (
    <div
      className="text-light-primary-text dark:text-dark-primary-text"
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          internalSave();
        }
      }}>

      {/* Name */}
      <div className="pb-6">
        <label htmlFor="rule-name" className={labelClass}>
          Event name
        </label>
        <input
          type="text"
          id="rule-name"
          defaultValue={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className={inputClass}
          placeholder="e.g., Lunch Break"
        />
      </div>

      {/* Colour */}
      <div className="pb-6">
        <label htmlFor="addEventModalContent_Colour" className={labelClass}>
          Colour:
        </label>
        <input
          id="addEventModalContent_Colour"
          type="color"
          value={formData.colour}
          onChange={(e) => setFormData(prev => ({ ...prev, colour: e.target.value }))}
          className={inputClass}
        />
      </div>

      {/* Timezone (need to add a warning or something) */}
      <div>
        <label className={"block text-xl font-medium text-light-primary-text dark:text-dark-primary-text mb-2"}>Timezone: {formData.iana_timezone}</label>
      </div>

      {/* Date range */}
      <div className="grid grid-cols-2 gap-4 pb-6">
        <div>
          <label htmlFor="start-date" className={labelClass}>
            Event start
          </label>
          <input
            type="datetime-local"
            id="start-datetime"
            value={formData.start}
            onChange={(e) => setFormData(prev => ({ ...prev, start: e.target.value }))}
            className={inputClass}
            required
          />
        </div>
        <div>
          <label htmlFor="end-date" className={labelClass}>
            Event end
          </label>
          <input
            type="datetime-local"
            id="end-datetime"
            value={formData.end}
            onChange={(e) => setFormData(prev => ({ ...prev, end: e.target.value }))}
            className={inputClass}
            required
          />
        </div>
      </div>

      <div className="justify-end flex gap-2 mt-2">
        <button
          onClick={internalDelete}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Delete
        </button>
        <SaveButton onClick={internalSave} children={"Save"} />
      </div>
    </div>
  );
};

export { EventModalContent };