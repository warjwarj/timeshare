// react
import { useState } from 'react';
import { createPortal } from 'react-dom';

// components
import { Modal } from './Modal';
import { EventInfoModalContent } from './EventInfoModalContent';

// types
import { type EventModel } from '../types/EventModel';

// css
import '../../index.css';

/*

*/

type EventStyle = {
  defaultEventStyle: string;
  eventHeightStyle: string;
}
type EventProps = {
  ev: EventModel
  evStyle: EventStyle
};
const Event: React.FC<EventProps> = ({ ev, evStyle }) => {

  // track popup visibility
  const [showModal, setShowModal] = useState(false);

  return (
    <span
      onClick={() => setShowModal(true)}
      key={`event-${ev.id}`}
      className={
        `${evStyle.defaultEventStyle}
        ${ev.extraClasses}`
      }
      style={{
        height: `${evStyle.eventHeightStyle}px`,
        left: `${ev.left}px`,
        width: `${ev.width}px`,
        top: `calc(${ev.lane} * ${evStyle.eventHeightStyle})`
      }}
    >
      <span className="block max-w-full">
        {ev.title}
      </span>
      {showModal && createPortal(
        <Modal label={ev.title} isOpen={showModal} onClose={() => setShowModal(false)} >
          <EventInfoModalContent event={ev} />
        </Modal>,
        document.body
      )}
    </span>
  )
};

export { Event };
export type { EventStyle }