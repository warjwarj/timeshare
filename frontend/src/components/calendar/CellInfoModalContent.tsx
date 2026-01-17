// react
import { useState } from 'react';
import { createPortal } from 'react-dom';

// components
import { Modal } from '../Modal';
import { AddEventModalContent } from '../events/AddEventModalContent';

// types
import type { EventProps } from '../events/Event';
import type { EventDTO } from '../../types/EventDTO';

// css
import '../../../index.css';

type CellInfoModalContentProps = {
  eventsInCell: EventProps[];
  cellDate: Date;
  onAddEvent: (newEvent: Omit<EventDTO, 'key' | 'uuid'>) => void;
};
const CellInfoModalContent: React.FC<CellInfoModalContentProps> = ({ eventsInCell, cellDate, onAddEvent }) => {
  const [showAddEventModal, setShowAddEventModal] = useState(false);

  const defaultStart = new Date(cellDate);
  defaultStart.setHours(9, 0, 0, 0);

  const defaultEnd = new Date(cellDate);
  defaultEnd.setHours(10, 0, 0, 0);

  return (
    <>
      {eventsInCell.sort((a, b) => a.evStyle.lane - b.evStyle.lane).map((ev) => {
        return (
          <div className="bg-light-background dark:bg-dark-background text-light-primary-text dark:text-dark-primary-text" key={ev.key + "cell-modal-content"}>
            <h3 style={{
              backgroundColor: ev.eventDTO.colour
            }}>
              <strong>{ev.eventDTO.name}</strong>
            </h3>
            <div>
              <div> id: {ev.eventDTO.uuid}</div>
              <div> Lane: {ev.evStyle.lane}</div>
              <div> Start: {ev.eventDTO.start.toDateString()}</div>
              <div> End: {ev.eventDTO.end.toDateString()}</div>
            </div>
          </div>
        )
      })}

      {showAddEventModal && createPortal(
        <Modal
          label="Add Event"
          isOpen={showAddEventModal}
          onClose={() => setShowAddEventModal(false)}
        >
          <AddEventModalContent
            start={defaultStart}
            end={defaultEnd}
            onSave={onAddEvent}
            onClose={() => setShowAddEventModal(false)}
          />
        </Modal>,
        document.body
      )}

      <button
        onClick={() => setShowAddEventModal(true)}
        className="
          w-full mt-3 py-2 px-4 rounded
          bg-light-background dark:bg-dark-background
          text-light-primary-text dark:text-dark-primary-text
          border border-light-border dark:border-dark-border
          hover:bg-dark-background hover:text-dark-primary-text
          dark:hover:bg-light-background dark:hover:text-light-primary-text
          transition-colors font-bold
        "
      >
        + Add Event
      </button>
    </>
  );
};

export { CellInfoModalContent };