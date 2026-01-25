// react
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

// components
import { Modal } from '../Modal';
import { CellInfoModalContent } from './CellInfoModalContent';

// types
import type { EventBarProps } from './EventBar';
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
  getEvents: (cellIndex: number) => EventBarProps[];
  onAddEvent: (newEvent: Omit<EventDTO, 'key' | 'uuid'>) => void;
  isOutsideMonth?: boolean;
  isSelected?: boolean;
  isHighlighted?: boolean;
};
const Cell: React.FC<CellProps> = ({ label, rowEndIndex, rowStartIndex, cellIndex, egcStyle, cellDate, getEvents, onAddEvent, isOutsideMonth, isSelected, isHighlighted }) => {
  const dispatch = ourUseDispatch()

  // track popup visibility
  const [showModal, setShowModal] = useState(false);

  // cell id in grid
  const cellId = `row:${rowStartIndex}-${rowEndIndex}, cell:${cellIndex}`

  useEffect(() => {
    document.getElementById(cellId)?.addEventListener("dblclick", () => {
      setShowModal(true)
    })
    document.getElementById(cellId)?.addEventListener("click", () => {
      dispatch(setSelectedDate({ dateIsoStr: cellDate.toISOString() })) 
    })
  }, [cellDate])

  const cellClassName = [
    "border border-light-border dark:border-dark-border flex justify-center overflow-hidden",
    isOutsideMonth
      ? "bg-light-border/30 dark:bg-dark-border/30 text-light-secondary-text dark:text-dark-secondary-text"
      : "bg-light-background dark:bg-dark-background text-black dark:text-white",
    isSelected && "ring-2 ring-inset ring-blue-500",
    isHighlighted && !isSelected && "text-2xl font-bold",
    isHighlighted && isSelected && "text-2xl font-bold ring-2 ring-inset ring-blue-500"
  ].filter(Boolean).join(" ");

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