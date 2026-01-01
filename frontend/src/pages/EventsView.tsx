import { Grid } from '../components/calendar/Grid';
import type { GridStyle } from '../components/calendar/Grid';
import { TimeSpanEnum } from "../types/dateTypes";

// eventgrid style
const gridStyle: GridStyle = {
  eventStyle: {
    eventHeightStyle: "1.6em",
    defaultEventStyle: "absolute pb-0.5 pl-2 text-white text-center text-sm items-center justify-left text-nowrap",
    extraClasses: "",
    colour: "",
    lane: 0,
    left: 0,
    width: 0
  },
  cellStyle: {
    heightStyle: "150px",
  },
  colCount: 7,
  cellCount: 35
}

type EventsViewProps = {
  currentDatetime: string
}

const EventsView: React.FC<EventsViewProps> = ({ currentDatetime }) => {

  return (
    <div id="EventsView" className="flex">
      <Grid
        egStyle={gridStyle}
        start={new Date(currentDatetime)}
        cellStep={TimeSpanEnum.Day}
      />
    </div>
  );
}

export { EventsView }