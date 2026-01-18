// react
import { useState } from 'react';

// react types
import type { ChangeEvent } from 'react'

// types
import type { EventDTO } from '../../types/EventDTO';
import type { EventProps } from './Event';
import { TZDate } from '@date-fns/tz';

// utils
import { isValidDate } from '../../utils/utils';

// css
import '../../../index.css';
import { SaveButton } from '../SaveButton';

/*

*/

type EventInfoModalContentProps = {
  event: EventProps;
  updateEvent: (updatedEvent: EventDTO) => void;
  deleteEvent: (uuid: string) => void;
  closePopup: () => void;
};
const EventInfoModalContent: React.FC<EventInfoModalContentProps> = ({ event, updateEvent, deleteEvent, closePopup }) => {
  const tz = event.eventDTO.start.timeZone;

  // save updated event object
  const handleSave = () => {
    if (updateEvent) updateEvent(updatedEvent);
    closePopup();
  }

  // delete event
  const handleDelete = () => {
    deleteEvent(event.eventDTO.uuid);
    closePopup();
  }

  // track the modified event before we save
  const [updatedEvent, setUpdatedEvent] = useState(event.eventDTO);

  // format TZDate for the html input
  const formatDateForInput = (date: TZDate): string => {
    if (!isValidDate(date)) {
      return "";
    }
    // Format as YYYY-MM-DDTHH:mm for datetime-local input
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  // change updated event object
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const [datePart, timePart] = value.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hours, minutes] = timePart.split(':').map(Number);
    const newDate = new TZDate(year, month - 1, day, hours, minutes, 0, 0, tz);
    setUpdatedEvent((prev) => ({
      ...prev,
      [id.includes("Start") ? "start" : "end"]: newDate,
    }));
  }

  return (
    <div
      className="text-light-primary-text dark:text-dark-primary-text"
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          handleSave();
        }
      }}>
      <h3 style={{
        backgroundColor: event.eventDTO.colour
      }}
      >
        <strong>{event.eventDTO.name}</strong>
      </h3>

      <div>Id: {event.eventDTO.uuid}</div>
      <div>Lane: {event.evStyle.lane}</div>

      <div>
        <label htmlFor="eventInfoModalContent_Start" className="block mb-1">
          Start:
        </label>
        <input
          id="eventInfoModalContent_Start"
          type="datetime-local"
          defaultValue={formatDateForInput(updatedEvent.start)}
          onChange={handleChange}
          className="border rounded p-1"
        />
      </div>

      <div>
        <label htmlFor="eventInfoModalContent_End" className="block mb-1">
          End:
        </label>
        <input
          id="eventInfoModalContent_End"
          type="datetime-local"
          defaultValue={formatDateForInput(updatedEvent.end)}
          onChange={handleChange}
          className="border rounded p-1"
        />
      </div>
      <div className="justify-end flex gap-2 mt-2">
        <button
          onClick={handleDelete}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Delete
        </button>
        <SaveButton onClick={handleSave} children={"Save"} />
      </div>
    </div>
  );
};

export { EventInfoModalContent };