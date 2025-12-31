// react
import { useState } from 'react';

// react types
import type { ChangeEvent } from 'react'

// types
import type { EventDTO } from '../../types/EventDTO';
import type { EventProps } from './Event';

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
  closePopup: () => void;
};
const EventInfoModalContent: React.FC<EventInfoModalContentProps> = ({ event, updateEvent, closePopup }) => {

  // save updated event object
  const handleSave = () => {
    if (updateEvent) updateEvent(updatedEvent);
    closePopup();
  }

  // track the modified event before we save
  const [updatedEvent, setUpdatedEvent] = useState(event.eventDTO);

  // format js date for the html input
  const formatDateForInput = (date: Date): string => {
    const tzOffset = date.getTimezoneOffset() * 60000;
    if (!isValidDate(date)) {
      return "";
    }
    return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
  }

  // change updated event object
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const newDate = new Date(value);
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
      <SaveButton onClick={handleSave} children={"Save"} />
    </div>
  );
};

export { EventInfoModalContent };