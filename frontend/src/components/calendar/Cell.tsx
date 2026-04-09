// react
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

// components
import { Modal } from '../Modal';
import { CellInfoModalContent } from './CellInfoModalContent';

// types
import type { EventDTO } from '../../types/EventDTO';
import type { EventBarProps } from './EventBar';

// css
import '../../../index.css';
import { setSelectedDate } from '../../store/slices/appSlice';

// utils
import { ourUseDispatch } from '../../store/hooks';
import type { ProcessedDayAvailabilityDTO } from '../../types/DayAvailabilityDTO';

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
  availability: ProcessedDayAvailabilityDTO | undefined;
  getEvents: (cellIndex: number) => EventBarProps[];
  onAddEvent: (newEvent: Omit<EventDTO, 'key' | 'uuid'>) => void;
  isOutsideMonth?: boolean;
  isSelected?: boolean;
  isHighlighted?: boolean;
};
const Cell: React.FC<CellProps> = (props: CellProps) => {

  // props
  const { label, rowEndIndex, rowStartIndex, cellIndex, egcStyle, cellDate,
    availability, getEvents, onAddEvent, isOutsideMonth, isSelected, isHighlighted } = props

  const dispatch = ourUseDispatch()
  const [showModal, setShowModal] = useState(false);
  const cellId = `row:${rowStartIndex}-${rowEndIndex}, cell:${cellIndex}`

  // attach click handlers
  useEffect(() => {
    document.getElementById(cellId)?.addEventListener("dblclick", () => {
      setShowModal(true)
    })
    document.getElementById(cellId)?.addEventListener("click", () => {
      dispatch(setSelectedDate({ dateIsoStr: cellDate.toISOString() }))
    })
  }, [cellDate, cellId, dispatch])

  const statusColorMap = {
    "Full Day": {
      normal: "bg-green-200 dark:bg-green-800 text-green-900 dark:text-green-100",
      faded: "bg-green-200/40 dark:bg-green-900/20 text-light-secondary-text dark:text-dark-secondary-text"
    },
    "Part Day": {
      normal: "bg-yellow-200 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-100",
      faded: "bg-yellow-200/40 dark:bg-yellow-900/20 text-light-secondary-text dark:text-dark-secondary-text"
    },
    "None": {
      normal: "bg-red-200 dark:bg-red-900 text-red-900 dark:text-red-100",
      faded: "bg-red-200/40 dark:bg-red-900/20 text-light-secondary-text dark:text-dark-secondary-text"
    },
  } as const;

  const defaultColor = isOutsideMonth
    ? "bg-light-border/30 dark:bg-dark-border/30 text-light-secondary-text dark:text-dark-secondary-text"
    : "bg-light-background dark:bg-dark-background text-black dark:text-white";

  const key = availability?.brief?.trim() as keyof typeof statusColorMap | undefined;
  const match = key ? statusColorMap[key] : undefined;
  const statusColor = match
    ? (isOutsideMonth ? match.faded : match.normal)
    : defaultColor;

  const cellClassName = [
    "border border-light-border dark:border-less-dark-border flex justify-center overflow-hidden",
    statusColor,
    isSelected && "ring-2 ring-inset ring-blue-500",
    isHighlighted && "text-2xl font-bold",
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
export type { CellStyle };
