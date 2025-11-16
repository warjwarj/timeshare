// react
import { useState } from 'react'

// react types
import type { ChangeEvent } from 'react'

// types
import type { EventDTO } from '../types/EventDTO';

// utils
import { isValidDate } from '../utils/utils';

// css
import '../../index.css';

/*

*/

type EventInfoModalContentProps = {
  event: EventDTO
  updateEvent: (updatedEvent: EventDTO) => void;
};
const EventInfoModalContent: React.FC<EventInfoModalContentProps> = ({ event, updateEvent }) => {

  // track the modified event before we save
  const [updatedEvent, setUpdatedEvent] = useState(event);

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

  // save updated event object
  const handleSave = () => {
    if (updateEvent) updateEvent(updatedEvent);
    console.log("Saved event:", updatedEvent);
  }

  return (
    <>
      <h3 className={updatedEvent.colour}>
        <strong>{updatedEvent.title}</strong>
      </h3>

      <div>id: {updatedEvent.id}</div>
      <div>Lane: {updatedEvent.lane}</div>

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
      <div className="flex justify-end">
        <button className="hover:bg-black bg-white text-black hover:text-white font-bold py-2 px-4 rounded" onClick={handleSave}>
          Save
        </button>
      </div>
    </>
  );
};

export { EventInfoModalContent };