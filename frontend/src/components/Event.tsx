// react
import { useState } from 'react';
import { createPortal } from 'react-dom';

// components
import { Modal } from './Modal';
import { EventInfoModalContent } from './EventInfoModalContent';

// types
import { type EventDTO } from '../types/EventDTO';

// css
import '../../index.css';

/*

*/

type EventStyle = {
  defaultEventStyle: string;
  eventHeightStyle: string;
}
type EventProps = {
  eventDTO: EventDTO
  evStyle: EventStyle
  updateEvent: (updatedEvent: EventDTO) => void;
};
const Event: React.FC<EventProps> = ({ eventDTO, evStyle, updateEvent }) => {

  // track popup visibility
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <span
        onClick={() => setShowModal(true)}
        key={`event-${eventDTO.id}`}
        className={
          `${evStyle.defaultEventStyle}
          ${eventDTO.extraClasses}
          ${eventDTO.colour}`
        }
        style={{
          height: `${evStyle.eventHeightStyle}px`,
          left: `${eventDTO.left}px`,
          width: `${eventDTO.width}px`,
          top: `calc(${eventDTO.lane} * ${evStyle.eventHeightStyle})`
        }}
      >
        <span className="block max-w-full">
          {eventDTO.title}
        </span>
      </span>
      {showModal && createPortal(
        <Modal label={eventDTO.title} isOpen={showModal} onClose={() => setShowModal(false)} >
          <EventInfoModalContent event={eventDTO} updateEvent={updateEvent} />
        </Modal>,
        document.body
      )}
    </>
  )
};

export { Event };
export type { EventStyle }