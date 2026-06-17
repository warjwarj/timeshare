// react
import { useState } from 'react';
import { createPortal } from 'react-dom';

// components
import { Modal } from '../Modal';

// types
import { addHours } from "date-fns";
import type { ProcessedEventDTO } from '../../types/EventDTO';
import type { EventBarProps } from './EventBar';

// css
import { TZDate } from '@date-fns/tz';
import '../../../index.css';
import { formatDate } from '../../utils/utils';
import { EventModalContent } from '../events/EventModalContent';

type CellInfoModalContentProps = {
  eventsInCell: EventBarProps[];
  cellDate: Date;
  onAddEvent: (newEvent: Omit<ProcessedEventDTO, 'uuid'>) => void;
};
const CellInfoModalContent: React.FC<CellInfoModalContentProps> = ({ eventsInCell, cellDate, onAddEvent }) => {
  const [showAddEventModal, setShowAddEventModal] = useState(false);

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
              <div> Start: {formatDate(ev.eventDTO.start, ev.eventDTO.iana_timezone)}</div>
              <div> End: {formatDate(ev.eventDTO.end, ev.eventDTO.iana_timezone)}</div>
            </div>
          </div>
        )
      })}

      {showAddEventModal && createPortal(
        <Modal
          label="Add event"
          isOpen={showAddEventModal}
          onClose={() => setShowAddEventModal(false)}
        >
          <EventModalContent
            event={{ start: new TZDate(cellDate), end: addHours(new TZDate(cellDate), 1), uuid: "", name: "", iana_timezone: "", colour: "#525252", blocking: false }}
            editing={false}
            onClose={() => setShowAddEventModal(false)}
            onDelete={() => { }}
            onSave={onAddEvent}
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
