// react
import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';

// components
import { Modal } from '../Modal';
import { EventInfoModalContent } from './EventInfoModalContent';

// types
import { type EventDTO } from '../../types/EventDTO';

// css
import '../../../index.css';

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

const formatDate = (date: Date): string => {
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
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

    // track modal visibility
    const [showModal, setShowModal] = useState(false);

    // track hover popup
    const [showHover, setShowHover] = useState(false);
    const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });
    const hoverTimeout = useRef<number | null>(null);

    const handleMouseEnter = (e: React.MouseEvent) => {
      hoverTimeout.current = window.setTimeout(() => {
        setHoverPos({ x: e.clientX, y: e.clientY });
        setShowHover(true);
      }, 300);
    };

    const handleMouseLeave = () => {
      if (hoverTimeout.current) {
        clearTimeout(hoverTimeout.current);
        hoverTimeout.current = null;
      }
      setShowHover(false);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
      if (showHover) {
        setHoverPos({ x: e.clientX, y: e.clientY });
      }
    };

    return (
      <div key={eventProps.eventDTO.key}>
        <span
          onClick={() => { setShowHover(false); setShowModal(true); }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onMouseMove={handleMouseMove}
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
        {showHover && createPortal(
          <div
            className="fixed z-50 pointer-events-none px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg max-w-xs"
            style={{
              left: `${hoverPos.x + 12}px`,
              top: `${hoverPos.y + 12}px`,
            }}
          >
            <div className="font-semibold mb-1">{eventProps.eventDTO.name}</div>
            <div className="text-gray-300 text-xs">
              <div>{formatDate(eventProps.eventDTO.start)}</div>
              <div>to {formatDate(eventProps.eventDTO.end)}</div>
            </div>
          </div>,
          document.body
        )}
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