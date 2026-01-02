// react
import { useState } from 'react';

// react types
import type { ChangeEvent } from 'react';

// types
import type { EventDTO } from '../../types/EventDTO';

// components
import { SaveButton } from '../SaveButton';

// utils
import { isValidDate, isNullOrWhitespace } from '../../utils/utils';
import { toastService } from '../../toastService';

// css
import '../../../index.css';

type AddEventModalContentProps = {
  start: Date;
  end: Date;
  onSave: (newEvent: Omit<EventDTO, 'key' | 'uuid'>) => void;
  onClose: () => void;
};
const AddEventModalContent: React.FC<AddEventModalContentProps> = ({ start, end, onSave, onClose }) => {
  const [name, setName] = useState("");
  const [colour, setColour] = useState('#3b82f6');
  const [eventStart, setEventStart] = useState(start);
  const [eventEnd, setEventEnd] = useState(end);

  const formatDateForInput = (date: Date): string => {
    const tzOffset = date.getTimezoneOffset() * 60000;
    if (!isValidDate(date)) {
      return "";
    }
    return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
  };

  const handleStartChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEventStart(new Date(e.target.value));
  };

  const handleEndChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEventEnd(new Date(e.target.value));
  };

  const handleSave = () => {
    if (eventStart > eventEnd) {
      toastService.showError("Invalid input", "Event start time must be before end time.")
      return
    }
    if (isNullOrWhitespace(name)) {
      toastService.showError("Invalid input", "Event name must not be empty.")
      return
    }
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      colour,
      start: eventStart,
      end: eventEnd,
    });
    onClose();
  };

  return (
    <div
      className="text-light-primary-text dark:text-dark-primary-text space-y-4"
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          handleSave();
        }
      }}
    >
      <div>
        <label htmlFor="addEventModalContent_Name" className="block mb-1">
          Name:
        </label>
        <input
          id="addEventModalContent_Name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Event name"
          className="border rounded p-1 w-full"
          autoFocus
        />
      </div>

      <div>
        <label htmlFor="addEventModalContent_Colour" className="block mb-1">
          Colour:
        </label>
        <input
          id="addEventModalContent_Colour"
          type="color"
          value={colour}
          onChange={(e) => setColour(e.target.value)}
          className="border rounded p-1 h-10 w-20 cursor-pointer"
        />
      </div>

      <div>
        <label htmlFor="addEventModalContent_Start" className="block mb-1">
          Start:
        </label>
        <input
          id="addEventModalContent_Start"
          type="datetime-local"
          defaultValue={formatDateForInput(eventStart)}
          onChange={handleStartChange}
          className="border rounded p-1"
        />
      </div>

      <div>
        <label htmlFor="addEventModalContent_End" className="block mb-1">
          End:
        </label>
        <input
          id="addEventModalContent_End"
          type="datetime-local"
          defaultValue={formatDateForInput(eventEnd)}
          onChange={handleEndChange}
          className="border rounded p-1"
        />
      </div>

      <SaveButton onClick={handleSave}>Save</SaveButton>
    </div>
  );
};

export { AddEventModalContent };