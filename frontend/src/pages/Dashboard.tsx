import { useContext, useEffect } from 'react'

// components
import { Grid } from '../components/Grid';

// types
import { TimeSpan } from '../types/TimeSpan';
import type { GridStyle } from '../components/Grid';

// utils
import { EventsDispatchContext } from "../contexts/EventsContext";
import { apiClient } from "../utils/apiClient";

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
  cellCount: 62
}

const Dashboard: React.FC = () => {

  // retrieve events on page load
  const eventsDispatch = useContext(EventsDispatchContext)

  useEffect(() => {
    const controller = new AbortController();
    apiClient.get("/events/all", { signal: controller.signal })
      .then(res => {
        if (!res) { return; }
        eventsDispatch({
          type: "SET_ALL_EVENTS",
          payload: { evs: res.data }
        })
      })
    return () => {
      controller.abort();
    };
  }, [eventsDispatch]);

  return (
    <div id="Dashboard" className="flex">
      <Grid
        egStyle={gridStyle}
        start={new Date(2024, 11, 30)}
        cellStep={TimeSpan.Day}
      />
    </div>
  );
}

export { Dashboard }