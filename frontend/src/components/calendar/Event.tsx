// react
import { useState } from 'react';
import { createPortal } from 'react-dom';

// components
import { Modal } from '../Modal';
import { EventInfoModalContent } from './EventInfoModalContent';

// types
import { type EventDTO } from '../../types/EventDTO';

// css
import '../../../index.css';

/*

*/

type EventStyle = {
  defaultEventStyle: string;
  eventHeightStyle: string;
  extraClasses: string;
  colour: string;
  left: number;
  width: number;
  lane: number;
  top?: number; // Optional: direct top position in pixels (used by DayGrid)
}
type EventProps = {
  readonly eventDTO: EventDTO
  evStyle: EventStyle
  key: string
};
const Event: React.FC<{
  eventProps: EventProps,
  updateEvent: (updatedEvent: EventDTO) => void;
  deleteEvent: (uuid: string) => void;
}> = ({
  eventProps,
  updateEvent,
  deleteEvent
}) => {

    // track popup visibility
    const [showModal, setShowModal] = useState(false);

    return (
      <div key={eventProps.eventDTO.key}>
        <span
          onClick={() => setShowModal(true)}
          key={`event-${eventProps.eventDTO.uuid}`}
          className={
            `${eventProps.evStyle.defaultEventStyle}
              ${eventProps.evStyle.extraClasses}
              cursor-pointer transition-all duration-200 hover:scale-[1.02]
              hover:z-10 active:scale-[0.98] overflow-hidden`
          }
          style={{
            height: `${eventProps.evStyle.eventHeightStyle}px`,
            left: `${eventProps.evStyle.left}px`,
            width: `${eventProps.evStyle.width}px`,
            top: eventProps.evStyle.top !== undefined
              ? `${eventProps.evStyle.top}px`
              : `calc(${eventProps.evStyle.lane + 1} * ${eventProps.evStyle.eventHeightStyle})`,
            backgroundColor: eventProps.evStyle.colour,
          }}
        >
          <span className="block max-w-full truncate px-2 font-medium">
            {eventProps.eventDTO.name}
          </span>
        </span>
        {showModal && createPortal(
          <Modal
            label={`${eventProps.eventDTO.name}`}
            isOpen={showModal}
            onClose={() => setShowModal(false)}
          >
            <EventInfoModalContent
              event={eventProps}
              updateEvent={updateEvent}
              deleteEvent={deleteEvent}
              closePopup={() => setShowModal(false)}
            />
          </Modal>,
          document.body
        )}
      </div>
    )
  };

export { Event };
export type { EventStyle }
export type { EventProps }