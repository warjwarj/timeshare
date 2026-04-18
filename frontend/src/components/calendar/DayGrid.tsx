import { TZDate } from "@date-fns/tz";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ourUseDispatch, ourUseSelector } from '../../store/hooks';
import { selectSelectedIanaTimezone, setSelectedDate } from '../../store/slices/appSlice';
import { deleteEvent, makeEventSelectors, updateEvent } from '../../store/slices/eventsSlice';
import type { DayGridConfig } from "../../utils/dayGridUtils";
import { setDayEventPositions } from "../../utils/dayGridUtils";
import { isValidDate, parseTimeToMinutes, toDateNum } from "../../utils/utils";
import type { EventBarProps, EventBarStyle } from "./EventBar";
import { EventBar } from './EventBar';

import { ChevronLeft, ChevronRight } from "lucide-react";
import '../../../index.css';
import { makeDayAvailabilitySelectors } from "../../store/slices/availabilitySlice";

type DayGridStyle = {
  eventStyle: EventBarStyle;
}

type DayGridProps = {
  gridStyle: DayGridStyle;
  gridConfig: DayGridConfig;
};

const DayGrid: React.FC<DayGridProps> = ({ gridStyle, gridConfig }) => {
  const { selectedDate, timeLabels, gridLabel } = gridConfig;
  const { eventStyle } = gridStyle;
  const dispatch = ourUseDispatch();

  // select timezone so we can refresh grid on change
  const selectedTz = ourUseSelector(selectSelectedIanaTimezone);

  // event selectors
  const { selectEventsSpanningDate } = useMemo(() => makeEventSelectors(), []);
  const events = ourUseSelector(state => selectEventsSpanningDate(state, selectedDate));

  // availability selectors
  const { selectProcessedDayAvailabilitysBetweenDates } = useMemo(() => makeDayAvailabilitySelectors(), []);
  const dayAvailabilitites = ourUseSelector(state => selectProcessedDayAvailabilitysBetweenDates(state, selectedDate, selectedDate));
  const availabilityForDate = dayAvailabilitites.find(dav => toDateNum(dav.date) == toDateNum(selectedDate))

  // refs and state for grid measurement
  const gridRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [eventProps, setEventProps] = useState<EventBarProps[]>([]);

  // measure container height on mount and resize
  useEffect(() => {
    const container = gridRef.current;
    if (!container) return;
    const updateDimensions = () => { setContainerWidth(container.getBoundingClientRect().width); setContainerHeight(container.scrollHeight); }
    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  // calculate event positions when events or grid dimensions change
  useEffect(() => {
    if (!isValidDate(selectedDate) || events.length === 0 || !gridRef.current || containerHeight === 0) {
      setEventProps([]);
      return;
    }
    setEventProps(setDayEventPositions(events, gridConfig, containerHeight, containerWidth, eventStyle));
  }, [events, gridConfig, containerHeight, containerWidth, eventStyle, selectedDate, selectedTz]);

  // day navigation handler
  const navigateDay = (delta: number) => {
    if (!isValidDate(selectedDate)) return;
    const tz = selectedDate.timeZone;
    const newDate = new TZDate(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + delta, tz);
    dispatch(setSelectedDate({ dateIsoStr: newDate.toISOString() }));
  };

  const getSlotColourFromTimeLabel = (label: string): string => {
    if (!availabilityForDate?.start_time || !availabilityForDate.end_time) {
      return "bg-red-200 dark:bg-red-900 text-red-900 dark:text-red-100";
    }
    const slotMins = parseTimeToMinutes(label);
    const dayStartTimeMins = parseTimeToMinutes(availabilityForDate?.start_time);
    const dayEndTimeMins = parseTimeToMinutes(availabilityForDate?.end_time);
    if (slotMins === -1 || dayStartTimeMins === -1 || dayEndTimeMins === -1) {
      return "";
    } else if (slotMins > (dayStartTimeMins - 60) && slotMins < dayStartTimeMins || slotMins > (dayEndTimeMins - 60) && slotMins < dayEndTimeMins) {
      return "bg-yellow-200 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-100";
    } else if (slotMins < dayStartTimeMins || slotMins >= dayEndTimeMins) {
      return "bg-red-200 dark:bg-red-900 text-red-900 dark:text-red-100";
    } else if (slotMins >= dayStartTimeMins && slotMins <= dayEndTimeMins) {
      return "bg-green-200 dark:bg-green-800 text-green-900 dark:text-green-100";
    }
    return "";
  }

  return (
    <div
      id="day-grid-container"
      className="w-full h-full flex flex-col p-4 box-border gap-4"
    >
      {/* Month navigation */}
      <div className="flex flex-col w-full mt-3">
        <div className="px-4 py-1 text-center text-2xl font-bold text-light-primary-text dark:text-dark-primary-text rounded transition-colors">
          {gridLabel}
        </div>
        <div className="flex justify-center">
          <button
            onClick={() => navigateDay(-1)}
            className="p-2 rounded-full hover:bg-light-accent dark:hover:bg-dark-accent transition-colors"
            aria-label="Previous day"
          >
            <ChevronLeft />
          </button>
          <button
            onClick={() => navigateDay(1)}
            className="p-2 rounded-full hover:bg-light-accent dark:hover:bg-dark-accent transition-colors"
            aria-label="Next day"
          >
            <ChevronRight />
          </button>
        </div>
      </div>

      {/* Events grid */}
      <div className="flex-1 relative" >

        {/* time slot lines and labls */}
        <div className="absolute inset-0 flex flex-col">
          {timeLabels.map((label, index) => (
            <>
              <hr className="w-full self-start border-light-border dark:border-dark-border" />
              <div
                key={`slot-${index}`}
                className={`flex-1 w-full self-start flex text-sm ${getSlotColourFromTimeLabel(label)} pr-2`}
              >
                {label}
              </div>
            </>
          ))}
          <hr className="w-full self-start border-light-border dark:border-dark-border" />
        </div>

        {/* Events layer */}
        <div ref={gridRef} className="absolute inset-0 ml-15">
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
  );
};

export { DayGrid };
export type { DayGridProps, DayGridStyle };

