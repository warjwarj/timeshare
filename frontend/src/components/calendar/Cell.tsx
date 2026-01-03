// react
import { useState } from 'react';
import { createPortal } from 'react-dom';

// components
import { Modal } from '../Modal';
import { CellInfoModalContent } from './CellInfoModalContent';

// types
import type { EventProps } from './Event';
import type { EventDTO } from '../../types/EventDTO';

// css
import '../../../index.css';

type CellStyle = {
  heightStyle: string
}
type CellProps = {
  label: string;
  rowEndIndex: number;
  rowStartIndex: number;
  cellIndex: number;
  egcStyle: CellStyle;
  cellDate: Date;
  getEvents: (cellIndex: number) => EventProps[];
  onAddEvent: (newEvent: Omit<EventDTO, 'key' | 'uuid'>) => void;
};
const Cell: React.FC<CellProps> = ({ label, rowEndIndex, rowStartIndex, cellIndex, egcStyle, cellDate, getEvents, onAddEvent }) => {

  // track popup visibility
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div
        onClick={() => setShowModal(true)}
        key={`row:${rowStartIndex}-${rowEndIndex}, cell:${cellIndex}`}
        className="border bg-light-background border-light-border p-1 dark:border-dark-border flex justify-center text-black dark:bg-dark-background dark:text-white overflow-hidden"
        style={{
          height: egcStyle.heightStyle
        }}
      >
        <span>
          {label}
        </span>
      </div>
      {showModal && createPortal(
        <Modal label={cellDate.toDateString()} isOpen={showModal} onClose={() => setShowModal(false)} >
          <CellInfoModalContent
            eventsInCell={getEvents(cellIndex)}
            cellDate={cellDate}
            onAddEvent={onAddEvent}
          />
        </Modal>,
        document.body
      )}
    </>
  );
};

export { Cell };
export type { CellStyle }