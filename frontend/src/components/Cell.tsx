// react
import { useState } from 'react';
import { createPortal } from 'react-dom';

// components
import { Modal } from './Modal';

import { CellInfoModalContent } from './CellInfoModalContent';

// css
import '../../index.css';
import type { EventProps } from './Event';

/*

*/

type CellStyle = {
  heightStyle: string
}
type CellProps = {
  label: string;
  rowEndIndex: number;
  rowStartIndex: number;
  cellIndex: number;
  egcStyle: CellStyle;
  getEvents: (cellIndex: number) => EventProps[];
};
const Cell: React.FC<CellProps> = ({ label, rowEndIndex, rowStartIndex, cellIndex, egcStyle, getEvents }) => {

  // track popup visibility
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div
        onClick={() => setShowModal(true)}
        key={`row:${rowStartIndex}-${rowEndIndex}, cell:${cellIndex}`}
        className="border border-gray-300 flex justify-center text-black dark:text-white"
        style={{
          height: egcStyle.heightStyle
        }}
      >
        <span className="top-4">{label}</span>
      </div>
      {showModal && createPortal(
        <Modal label={`${label}`} isOpen={showModal} onClose={() => setShowModal(false)} >
          <CellInfoModalContent eventsInCell={getEvents(cellIndex)} />
        </Modal>,
        document.body
      )}
    </>
  );
};

export { Cell };
export type { CellStyle }