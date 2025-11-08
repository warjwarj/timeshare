// react stuff
import { useState } from 'react';
import { createPortal } from 'react-dom';

// components
import { Modal } from './Modal';
import { EventInfoModalContent } from './EventInfoModalContent';

// types
import type { EventModel } from '../types/EventModel';

// css
import '../../index.css';

/*

This component will render a row of events onto the grid

*/

type EventHolderStyle = {
  defaultEventStyle: string;
  eventHeightStyle: string;
}
type EventHolderProps = {
  events: EventModel[];
  ehStyle: EventHolderStyle;
};
const EventHolder: React.FC<EventHolderProps> = ({ events, ehStyle }) => {

  // track popup visibility
  const [showModal, setShowModal] = useState(false);

  // display events for the row
  return (
    <>
      <div className="absolute top-8 left-0 w-full">
        {events?.map((ev, i) => {
          const label = `${ev.start.toDateString()}  ${ev.end.toDateString()}`
          return (
            <span
              onClick={() => setShowModal(true)}
              key={`event-${i}`}
              className={
                `${ehStyle.defaultEventStyle}
                ${ev.extraClasses}`
              }
              style={{
                height: `${ehStyle.eventHeightStyle}px`,
                left: `${ev.left}px`,
                width: `${ev.width}px`,
                top: `calc(${ev.lane} * ${ehStyle.eventHeightStyle})`
              }}
            >
              <span>{label}</span>
              {showModal && createPortal(
                <Modal isOpen={showModal} onClose={() => setShowModal(false)} >
                  <EventInfoModalContent label={label}/>
                </Modal>,
                document.body
              )}
            </span>
          )
        })}
      </div>
    </>
  );
};

export { EventHolder };
export type { EventHolderStyle }