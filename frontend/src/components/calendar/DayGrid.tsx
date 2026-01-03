import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { EventDTO } from "../../types/EventDTO";
import { TimeSpanEnum, type TimeSpan } from "../../types/dateTypes";
import { isValidDate } from "../../utils/utils";
import {
  setDayEventPositions,
  generateTimeLabels,
  calculateTotalSlots,
  type DayGridConfig
} from "../../utils/dayGridUtils";
import type { EventProps, EventStyle } from "./Event";
import { Event } from './Event';

import { ourUseDispatch, ourUseSelector } from '../../store/hooks';
import { updateEvent, deleteEvent, makeEventSelectors } from '../../store/slices/eventsSlice';

import '../../../index.css';

/*
  Day Grid component - displays a single day's events in a vertical time-based layout
*/

type DayGridStyle = {
  eventStyle: EventStyle;
}

type DayGridProps = {
  style: DayGridStyle;
  date: Date;
  timeStart?: number;      // Start hour (default: 0)
  timeEnd?: number;        // End hour (default: 24)
  timeStep?: TimeSpan;     // Step granularity (default: Hour)
  snapToStep?: boolean;    // Snap events to step (default: false)
};

const DayGrid: React.FC<DayGridProps> = ({
  style,
  date,
  timeStart = 0,
  timeEnd = 24,
  timeStep = TimeSpanEnum.Hour,
  snapToStep = false
}) => {

  const { selectEventsSpanningDate } = useMemo(
    () => makeEventSelectors(),
    []
  );

  const events = ourUseSelector(state =>
    selectEventsSpanningDate(state, date)
  );

  const dispatch = ourUseDispatch();
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [eventProps, setEventProps] = useState<EventProps[]>([]);
  const [containerHeight, setContainerHeight] = useState(0);

  // calculate grid dimensions
  const totalSlots = calculateTotalSlots(timeStart, timeEnd, timeStep);
  const slotHeight = containerHeight > 0 ? containerHeight / totalSlots : 0;
  const gridHeight = containerHeight;

  // measure container height on mount and resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const updateHeight = () => {
      const height = container.getBoundingClientRect().height;
      setContainerHeight(height);
    };
    updateHeight();
    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  // update event positions
  useEffect(() => {
    console.log(events)
    if (!events) {
      return;
    }
    if (events.length === 0 || !isValidDate(date) || !gridRef.current) {
      setEventProps([]);
      return;
    }
    const gridWidth = gridRef.current.getBoundingClientRect().width;
    const config: DayGridConfig = {
      date,
      timeStart,
      timeEnd,
      timeStep,
      snapToStep,
      gridHeight,
      gridWidth,
      defaultEventStyle: style.eventStyle
    };
    setEventProps(setDayEventPositions(events, config));
  }, [events, date, timeStart, timeEnd, timeStep, snapToStep, gridHeight, style.eventStyle]);

  // callback update single event
  const updateEventCallback = useCallback((moddedev: EventDTO) => {
    dispatch(updateEvent(moddedev));
  }, [dispatch]);

  // // callback add new event
  // const addEventCallback = useCallback((newEvent: Omit<EventDTO, 'key' | 'uuid'>) => {
  //   dispatch(addEvent(newEvent));
  // }, [dispatch]);

  // callback delete event
  const deleteEventCallback = useCallback((uuid: string) => {
    dispatch(deleteEvent(uuid));
  }, [dispatch]);

  // generate time labels
  const timeLabels = generateTimeLabels(timeStart, timeEnd, timeStep);

  return (
    <div
      ref={containerRef}
      id="day-grid-container"
      className="w-full h-full flex p-4 box-border"
    >
      {/* Time labels column */}
      <div
        className="flex flex-col flex-shrink-0 whitespace-nowrap w-fit"
      >
        {timeLabels.map((label, index) => (
          <div
            key={`label-${index}`}
            className="text-sm text-light-secondary-text dark:text-dark-secondary-text text-right pr-2 flex items-start justify-end"
            style={{ height: slotHeight }}
          >
            {label}
          </div>
        ))}
      </div>

      {/* Events grid */}
      <div className="flex-1 relative" style={{ height: gridHeight }}>
        {/* Background slot lines */}
        <div className="absolute inset-0">
          {Array.from({ length: totalSlots }).map((_, index) => (
            <div
              key={`slot-${index}`}
              className="border-b border-light-border dark:border-dark-border h-auto"
              style={{ height: slotHeight }}
              />
          ))}
        </div>

        {/* Events layer */}
        <div
          ref={gridRef}
          className="absolute inset-0"
          style={{ height: gridHeight }}
        >
          {eventProps.map((evp: EventProps) => (
            <Event
              key={evp.key}
              eventProps={evp}
              updateEvent={updateEventCallback}
              deleteEvent={deleteEventCallback}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export { DayGrid };
export type { DayGridProps, DayGridStyle };
