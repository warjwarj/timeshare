import { useState, type ReactNode } from 'react';

import { Grid } from '../components/calendar/Grid';
import type { GridStyle } from '../components/calendar/Grid';
import { MonthEnum, TimeSpanEnum, WeekDayEnum } from "../types/dateTypes";
import { DayGrid } from '../components/calendar/DayGrid';
import type { EventStyle } from '../components/calendar/Event';
import { DateSelector } from "../components/DateSelector.tsx";
import { getPreviousMonday } from '../utils/utils.ts';

type ViewMode = 'day' | 'month' | 'both';

// event style
const eventStyle: EventStyle = {
  eventHeightStyle: "1.6em",
  defaultEventStyle: "absolute pb-0.5 pl-2 text-white text-center text-sm items-center justify-left text-nowrap",
  extraClasses: "",
  colour: "",
  lane: 0,
  left: 0,
  width: 0
};

// eventgrid style
const gridStyle: GridStyle = {
  eventStyle: eventStyle,
  cellStyle: {
    heightStyle: "150px",
  },
  colCount: 7,
  cellCount: 35
}

type EventsViewProps = {
  currentDate: Date;
  selectedDate: Date;
  children: ReactNode;
}

const EventsView: React.FC<EventsViewProps> = ({ currentDate, selectedDate, children }) => {

  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const showMonth = viewMode === 'month' || viewMode === 'both';
  const showDay = viewMode === 'day' || viewMode === 'both';

  const monthNames = Object.values(MonthEnum)
  const weekdayNames = Object.values(WeekDayEnum)

  return (
    <div id="EventsView" className="flex flex-col h-[calc(100dvh-5rem)]">
      {/* View Mode Selector */}
      <div className="flex h-[5rem] gap-1 p-2 border-b border-light-border dark:border-dark-border">

        {/* children rendered on the left of the header area. */}
        <div className="flex mr-20 justify-start border-light-border dark:border-dark-border">
          {children}
        </div>

        {/* events view controls. */}
        <div className="flex ml-auto border-light-border dark:border-dark-border">
          <button
            onClick={() => setViewMode('month')}
            className={`px-3 py-1 rounded text-sm transition-colors
            ${viewMode === 'month'
                ? 'bg-dark-background text-dark-primary-text dark:bg-light-background dark:text-light-primary-text'
                : 'bg-light-background text-light-primary-text dark:bg-dark-background dark:text-dark-primary-text hover:bg-light-accent dark:hover:bg-dark-accent'
              }`}
          >
            Month
          </button>
          <button
            onClick={() => setViewMode('day')}
            className={`px-3 py-1 rounded text-sm transition-colors
            ${viewMode === 'day'
                ? 'bg-dark-background text-dark-primary-text dark:bg-light-background dark:text-light-primary-text'
                : 'bg-light-background text-light-primary-text dark:bg-dark-background dark:text-dark-primary-text hover:bg-light-accent dark:hover:bg-dark-accent'
              }`}
          >
            Day
          </button>
          <button
            onClick={() => setViewMode('both')}
            className={`px-3 py-1 rounded text-sm transition-colors
            ${viewMode === 'both'
                ? 'bg-dark-background text-dark-primary-text dark:bg-light-background dark:text-light-primary-text'
                : 'bg-light-background text-light-primary-text dark:bg-dark-background dark:text-dark-primary-text hover:bg-light-accent dark:hover:bg-dark-accent'
              }`}
          >
            Both
          </button>

          {/* Date Selector */}
          <DateSelector onlyMonthSelector={false} startDate={new Date(2024, 11, 30)} />
        </div>
      </div>

      {/* Events views. */}
      <div className={`flex flex-1 overflow-hidden`}>
        {showMonth && (
          <div className={`${viewMode === 'both' ? 'flex-1' : 'w-full'} max-h-[calc(100dvh-6rem)] overflow-y-auto`}>
            <Grid
              currentDate={currentDate}
              selectedDate={selectedDate}
              egStyle={gridStyle}
              start={getPreviousMonday(selectedDate)}
              cellStep={TimeSpanEnum.Day}
              colHeaders={weekdayNames.map(x => x.substring(0, 3))}
              gridLabel={monthNames[selectedDate.getMonth()] + " " + selectedDate.getFullYear()}
            />
          </div>
        )}
        {showDay && (
          <div className={`${viewMode === 'both' ? 'flex-1' : 'w-full'} max-h-[calc(100dvh-6rem)] overflow-hidden`}>
            <DayGrid
              date={new Date(selectedDate)}
              timeStart={0}
              timeEnd={24}
              timeStep={TimeSpanEnum.Mins30}
              snapToStep={true}
              style={{
                eventStyle: eventStyle,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export { EventsView }