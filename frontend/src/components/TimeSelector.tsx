import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';


const minutes = Array.from({ length: 60 }).map((_, i) => i.toString().padStart(2, "0"))
const hours = Array.from({ length: 24 }).map((_, i) => i.toString().padStart(2, "0"))

type TimeSelectorProps = {
  onChange: (time: Date) => void
  defaultMins: number
  defaultHours: number
}

const TimeSelector: React.FC<TimeSelectorProps> = ({ onChange, defaultMins, defaultHours }) => {

  const [selectedMin, setSelectedMin] = useState(defaultMins)
  const [selectedHour, setSelectedHour] = useState(defaultHours)

  // helper states and refs
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Update dropdown position when opened
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 4,
        right: window.innerWidth - rect.right,
      });
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const internalOnChange = (m: number, h: number)=> {
    setSelectedMin(m)
    setSelectedHour(h)
    console.log()
  }

  return (
    <>
      <div className="w-full h-auto">
        {/* selected time */}
        <div className="flex flex-row p-2 rounded-lg border w-min">
          <button
            ref={buttonRef}
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-center"
          >
            <p className="text-lg font-semibold">
              {selectedHour.toString().padStart(2, "0")}
            </p>
            <span className="text-lg font-semibold"> : </span>
            <p className="text-lg font-semibold">
              {selectedMin.toString().padStart(2, "0")}
            </p>
          </button>
        </div>

        {/*  dropdown calendar */}
        {isOpen && createPortal(
          <div
            ref={dropdownRef}
            className="flex flex-row justify-between fixed z-50 w-40 h-60 border rounded-lg px-2 bg-light-background dark:bg-dark-background shadow-lg overflow-x-hidden"
            style={{ top: dropdownPosition.top, right: dropdownPosition.right }}
          >
            {/* Hour navigation */}
            <div className="flex flex-col p-2 items-center justify-between overflow-x-hidden">
              {hours.map((h, i) => {
                return (
                  <button
                    onClick={() => internalOnChange(selectedMin, i)}
                    className={`p-2 rounded-full ${selectedHour == i ? "bg-blue-500 text-white" : "hover:bg-v-light-accent dark:hover:bg-dark-accent"}`}
                  >
                    {h}
                  </button>)
              })}
            </div>
            {/* Minuite navigation */}
            <div className="flex flex-col p-2 items-center justify-between overflow-x-hidden">
              {minutes.map((m, i) => {
                return (
                  <button
                    onClick={() => internalOnChange(i, selectedHour)}
                    className={`p-2 rounded-full ${selectedMin == i ? "bg-blue-500 text-white" : "hover:bg-v-light-accent dark:hover:bg-dark-accent"}`}
                  >
                    {m}
                  </button>)
              })}
            </div>
          </div>,
          document.body
        )}
      </div >
    </>
  );
}

export { TimeSelector }