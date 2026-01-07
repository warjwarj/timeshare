import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { EventDTO } from "../../types/EventDTO";
import { TimeSpanEnum, type TimeSpan, WeekDayEnum, MonthEnum } from "../../types/dateTypes";
import { isValidDate } from "../../utils/utils";
import {
  setDayEventPositions,
  generateTimeLabels,
  calculateTotalSlots,
  type DayGridConfig
} from "../../utils/dayGridUtils";
import type { EventProps, EventStyle } from "./Event";
import { Event } from './Event';
import { ChevronLeft, ChevronRight } from '../svgs/Chevrons';

import { ourUseDispatch, ourUseSelector } from '../../store/hooks';
import { updateEvent, deleteEvent, makeEventSelectors } from '../../store/slices/eventsSlice';
import { selectSelectedDateAsDate, setSelectedDate } from '../../store/slices/appSlice';

import '../../../index.css';

/*
  Day Grid component - displays a single day's events in a vertical time-based layout
*/

type DayGridStyle = {
  eventStyle: EventStyle;
}

type DayGridProps = {
  style: DayGridStyle;
  timeStart?: number;      // Start hour (default: 0)
  timeEnd?: number;        // End hour (default: 24)
  timeStep?: TimeSpan;     // Step granularity (default: Hour)
  snapToStep?: boolean;    // Snap events to step (default: false)
};

const DayGrid: React.FC<DayGridProps> = ({
  style,
  timeStart = 0,
  timeEnd = 24,
  timeStep = TimeSpanEnum.Hour,
  snapToStep = false
}) => {

  const dispatch = ourUseDispatch();
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [eventProps, setEventProps] = useState<EventProps[]>([]);
  const [containerHeight, setContainerHeight] = useState(0);

  // memoised selectors
  const selectedDate = ourUseSelector(selectSelectedDateAsDate);

  // calculate grid dimensions
  const totalSlots = calculateTotalSlots(timeStart, timeEnd, timeStep);
  const gridHeight = containerHeight;

  const { selectEventsSpanningDate } = useMemo(
    () => makeEventSelectors(),
    []
  );

  const events = ourUseSelector(state =>
    selectEventsSpanningDate(state, selectedDate)
  );

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
    if (!events) {
      return;
    }
    if (events.length === 0 || !isValidDate(selectedDate) || !gridRef.current) {
      setEventProps([]);
      return;
    }
    const gridWidth = gridRef.current.getBoundingClientRect().width;
    const config: DayGridConfig = {
      selectedDate,
      timeStart,
      timeEnd,
      timeStep,
      snapToStep,
      gridHeight,
      gridWidth,
      defaultEventStyle: style.eventStyle
    };
    setEventProps(setDayEventPositions(events, config));
  }, [events, selectedDate, timeStart, timeEnd, timeStep, snapToStep, gridHeight, style.eventStyle]);

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

  // Navigate to previous day
  const goToPrevDay = useCallback(() => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    dispatch(setSelectedDate({ dateISOStr: newDate.toISOString() }));
  }, [dispatch, selectedDate]);

  // Navigate to next day
  const goToNextDay = useCallback(() => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    dispatch(setSelectedDate({ dateISOStr: newDate.toISOString() }));
  }, [dispatch, selectedDate]);

  // Format date label
  const weekdayNames = Object.values(WeekDayEnum);
  const monthNames = Object.values(MonthEnum);
  const dayLabel = isValidDate(selectedDate)
    ? `${weekdayNames[selectedDate.getDay() === 0 ? 6 : selectedDate.getDay() - 1]}, ${monthNames[selectedDate.getMonth()].substring(0, 3)} ${selectedDate.getDate()}, ${selectedDate.getFullYear()}`
    : '';

  // generate time labels
  const timeLabels = generateTimeLabels(timeStart, timeEnd, timeStep);

  return (
    <div className="w-full h-[calc(95%-2.5rem)]">
      {/* Day navigation */}
      <div className="flex items-center justify-between w-full h-10 mt-3">
        <div className="flex-1 flex justify-end">
          <button
            onClick={goToPrevDay}
            className="p-2 rounded-full hover:bg-light-accent dark:hover:bg-dark-accent transition-colors"
            aria-label="Previous day"
          >
            <ChevronLeft classes="w-6 h-6 text-light-primary-text dark:text-dark-primary-text" />
          </button>
        </div>
        <div className="px-4 py-1 text-center text-2xl font-bold text-light-primary-text dark:text-dark-primary-text rounded transition-colors">
          {dayLabel}
        </div>
        <div className="flex-1 flex justify-start">
          <button
            onClick={goToNextDay}
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
          style={{ height: gridHeight }}
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
        <div className="flex-1 relative" style={{ height: gridHeight }}>
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
    </div>
  );
};

export { DayGrid };
export type { DayGridProps, DayGridStyle };
