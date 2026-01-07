// react
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

// components
import { Modal } from '../Modal';
import { CellInfoModalContent } from './CellInfoModalContent';

// types
import type { EventProps } from './Event';
import type { EventDTO } from '../../types/EventDTO';

// css
import '../../../index.css';
import { setSelectedDate } from '../../store/slices/appSlice';

// utils
import { ourUseDispatch } from '../../store/hooks';

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
  isOutsideMonth?: boolean;
  isSelected?: boolean;
  isHighlighted?: boolean;
};
const Cell: React.FC<CellProps> = ({ label, rowEndIndex, rowStartIndex, cellIndex, egcStyle, cellDate, getEvents, onAddEvent, isOutsideMonth, isSelected, isHighlighted }) => {
  const dispatch = ourUseDispatch()

  // track popup visibility
  const [showModal, setShowModal] = useState(false);

  const cellId = `row:${rowStartIndex}-${rowEndIndex}, cell:${cellIndex}`

  useEffect(() => {
    document.getElementById(cellId)?.addEventListener("dblclick", () => cellDoubleClicked())
    document.getElementById(cellId)?.addEventListener("click", () => cellClicked())
  }, [])

  const cellClassName = [
    "border border-light-border dark:border-dark-border flex justify-center overflow-hidden",
    isOutsideMonth
      ? "bg-light-border/30 dark:bg-dark-border/30 text-light-secondary-text dark:text-dark-secondary-text"
      : "bg-light-background dark:bg-dark-background text-black dark:text-white",
    isSelected && "ring-2 ring-inset ring-blue-500",
    isHighlighted && !isSelected && "text-2xl font-bold",
    isHighlighted && isSelected && "text-2xl font-bold ring-2 ring-inset ring-blue-500"
  ].filter(Boolean).join(" ");

  const cellClicked = () => {
    dispatch(setSelectedDate({ dateISOStr: cellDate.toISOString() }))
  }
  
  const cellDoubleClicked = () => {    
    setShowModal(true)
  }

  return (
    <>
      <div
        id={cellId}
        key={cellId}
        className={cellClassName}
        style={{
          height: egcStyle.heightStyle
        }}
      >
        <div >
          <span>
            {label}
          </span>
        </div>
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