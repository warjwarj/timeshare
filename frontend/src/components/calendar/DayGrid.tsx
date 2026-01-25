import React, { useEffect, useMemo, useRef, useState } from "react";
import { ourUseDispatch, ourUseSelector } from '../../store/hooks';
import { selectSelectedDateAsTzDate, setSelectedDate } from '../../store/slices/appSlice';
import { deleteEvent, makeEventSelectors, updateEvent } from '../../store/slices/eventsSlice';
import type { DayGridConfig } from "../../utils/dayGridUtils";
import { setDayEventPositions } from "../../utils/dayGridUtils";
import { isValidDate } from "../../utils/utils";
import { ChevronLeft, ChevronRight } from '../svgs/Chevrons';
import type { EventBarProps, EventBarStyle } from "./EventBar";
import { EventBar } from './EventBar';
import { TZDate } from "@date-fns/tz";

import '../../../index.css';

type DayGridStyle = {
  eventStyle: EventBarStyle;
}

type DayGridProps = {
  gridStyle: DayGridStyle;
  gridConfig: DayGridConfig;
};

const DayGrid: React.FC<DayGridProps> = ({ gridStyle, gridConfig }) => {
  const { selectedDate, totalSlots, timeLabels, gridLabel } = gridConfig;
  const { eventStyle } = gridStyle;
  const dispatch = ourUseDispatch();

  // selectors
  const { selectEventsSpanningDate } = useMemo(() => makeEventSelectors(), []);
  const events = ourUseSelector(state => selectEventsSpanningDate(state, selectedDate));

  // refs and state for grid measurement
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(0);
  const [eventProps, setEventProps] = useState<EventBarProps[]>([]);

  // measure container height on mount and resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const updateHeight = () => setContainerHeight(container.getBoundingClientRect().height);
    updateHeight();
    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  // calculate event positions when events or grid dimensions change
  useEffect(() => {
    if (!isValidDate(selectedDate) || events.length === 0 || !gridRef.current || containerHeight === 0) {
      setEventProps([]);
      return;
    }
    const gridWidth = gridRef.current.getBoundingClientRect().width;
    setEventProps(setDayEventPositions(events, gridConfig, containerHeight, gridWidth, eventStyle));
  }, [events, gridConfig, containerHeight, eventStyle, selectedDate]);

  // day navigation handler
  const navigateDay = (delta: number) => {
    if (!isValidDate(selectedDate)) return;
    const tz = selectedDate.timeZone;
    const newDate = new TZDate(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + delta, tz);
    dispatch(setSelectedDate({ dateIsoStr: newDate.toISOString() }));
  };

  return (
    <div className="w-full h-[calc(95%-2.5rem)]">
      {/* Day navigation */}
      <div className="flex items-center justify-center w-full h-10 mt-3">
        <div className="flex-1 flex justify-end">
          <button
            onClick={() => navigateDay(-1)}
            className="p-2 rounded-full hover:bg-light-accent dark:hover:bg-dark-accent transition-colors"
            aria-label="Previous day"
          >
            <ChevronLeft classes="w-6 h-6 text-light-primary-text dark:text-dark-primary-text" />
          </button>
        </div>
        <div className="px-4 py-1 text-center text-2xl font-bold text-light-primary-text dark:text-dark-primary-text rounded transition-colors">
          {gridLabel}
        </div>
        <div className="flex-1 flex justify-start">
          <button
            onClick={() => navigateDay(1)}
            className="p-2 rounded-full hover:bg-light-accent dark:hover:bg-dark-accent transition-colors"
            aria-label="Next day"
          >
            <ChevronRight classes="w-6 h-6 text-light-primary-text dark:text-dark-primary-text" />
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        id="day-grid-container"
        className="w-full h-full flex p-4 box-border"
      >
        {/* Time labels column */}
        <div
          className="flex flex-col flex-shrink-0 whitespace-nowrap w-fit overflow-hidden"
          style={{ height: containerHeight }}
        >
          {timeLabels.map((label, index) => (
            <div
              key={`label-${index}`}
              className="flex-1 text-sm text-light-secondary-text dark:text-dark-secondary-text text-right pr-2 flex items-end justify-end"
            >
              {label}
            </div>
          ))}
        </div>

        {/* Events grid */}
        <div className="flex-1 relative" style={{ height: containerHeight }}>
          {/* Background slot lines */}
          <div className="absolute inset-0 flex flex-col">
            {Array.from({ length: totalSlots }).map((_, index) => (
              <div
                key={`slot-${index}`}
                className="flex-1 flex items-center"
              >
                <hr className="w-full" />
              </div>
            ))}
          </div>

          {/* Events layer */}
          <div
            ref={gridRef}
            className="absolute inset-0 ml-2 mr-2 mb-2"
            style={{ height: containerHeight }}
          >
            {eventProps.map((evp) => (
              <EventBar
                key={evp.key}
                eventProps={evp}
                updateEvent={(ev) => dispatch(updateEvent(ev))}
                deleteEvent={(uuid) => dispatch(deleteEvent(uuid))}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export { DayGrid };
export type { DayGridProps, DayGridStyle };
