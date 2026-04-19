import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

type GenericDropDownProps = {
  initialHeightPx: number;
  initialWidthPx: number;
  iconChildren: ReactNode;
  bodyChildren: ReactNode;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

/**
 * Render an icon which opens a dropdown.
 */
export default function GenericDropdown({ initialHeightPx, initialWidthPx, iconChildren, bodyChildren, isOpen, setIsOpen }: GenericDropDownProps) {

  const DROPDOWN_HEIGHT = initialHeightPx;
  const DROPDOWN_WIDTH = initialWidthPx;

  // helper states and refs
  const [dropdownPosition, setDropdownPosition] = useState<React.CSSProperties>({});
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen || !buttonRef.current) {
      return;
    }
    const rect = buttonRef.current.getBoundingClientRect();
    const position: React.CSSProperties = {};

    // Vertical positioning
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    if (spaceBelow >= DROPDOWN_HEIGHT + 4) {
      position.top = rect.bottom + 4;
      position.maxHeight = Math.min(DROPDOWN_HEIGHT, spaceBelow - 4);
    } else {
      position.bottom = window.innerHeight - rect.top + 4;
      position.maxHeight = Math.min(DROPDOWN_HEIGHT, spaceAbove - 4);
    }

    // Horizontal positioning
    const spaceRight = window.innerWidth - rect.left;
    const spaceLeft = rect.right;
    if (spaceRight >= DROPDOWN_WIDTH) {
      position.left = rect.left;
      position.width = Math.min(DROPDOWN_WIDTH, spaceRight);
    } else {
      position.right = window.innerWidth - rect.right;
      position.width = Math.min(DROPDOWN_WIDTH, spaceLeft);
    }

    setDropdownPosition(position);
  }, [isOpen, DROPDOWN_HEIGHT, DROPDOWN_WIDTH]);

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

  return (
    <>
      {/* Icon - use to open when collpased */}
      <div className="flex flex-row p-2 rounded-lg border w-min overflow-auto justify-center">
        <button
          ref={buttonRef}
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-center text-lg font-semibold"
        >
          {iconChildren}
        </button>
      </div>

      {/* Body */}
      {isOpen && createPortal(
        <div
          ref={dropdownRef}
          className="fixed z-50 border rounded-lg px-2 bg-light-background dark:bg-dark-background shadow-lg"
          style={dropdownPosition}
        >
          {bodyChildren}
        </div>,
        document.body
      )}
    </>
  );
}
