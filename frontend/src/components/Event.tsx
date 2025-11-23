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
  extraClasses: string;
  colour: string;
  left: number;
  width: number;
  lane: number;
}
type EventProps = {
  readonly eventDTO: EventDTO
  evStyle: EventStyle
  key: string
};
const Event: React.FC<{
  eventProps: EventProps,
  updateEvent: (updatedEvent: EventDTO) => void;
}> = ({
  eventProps,
  updateEvent
}) => {

    // track popup visibility
    const [showModal, setShowModal] = useState(false);

    return (
      <div key={eventProps.eventDTO.key}>
        <span
          onClick={() => setShowModal(true)}
          key={`event-${eventProps.eventDTO.id}`}
          className={
            `${eventProps.evStyle.defaultEventStyle}
              ${eventProps.evStyle.extraClasses}`
          }
          style={{
            height: `${eventProps.evStyle.eventHeightStyle}px`,
            left: `${eventProps.evStyle.left}px`,
            width: `${eventProps.evStyle.width}px`,
            top: `calc(${eventProps.evStyle.lane + 1} * ${eventProps.evStyle.eventHeightStyle})`,
            backgroundColor: eventProps.evStyle.colour
          }}
        >
          <span className="block max-w-full">
            {eventProps.eventDTO.title}
          </span>
        </span>
        {showModal && createPortal(
          <Modal
            label={ `${eventProps.eventDTO.title}` }
            isOpen={showModal}
            onClose={ () => setShowModal(false) }
          >
            <EventInfoModalContent
              event={ eventProps }
              updateEvent={ updateEvent }
              closePopup={ () => setShowModal(false) }
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