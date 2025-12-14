import { useContext, useEffect, useLayoutEffect } from 'react'
import axios from 'axios';

// components
import { Grid } from '../components/Grid';

// types
import { TimeSpan } from '../types/TimeSpan';
import type { GridStyle } from '../components/Grid';

// utils
import { EventsDispatchContext } from "../contexts/EventsContext";
import { apiClient } from "../utils/apiClient";

// eventgrid style
const evGridStyle: GridStyle = {
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
    apiClient.get("/events/testevents", { signal: controller.signal })
      .then(res => {
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
    <div className="bg-gray-50 dark:bg-gray-900">
      <Grid
        egStyle={evGridStyle}
        start={new Date(2024, 11, 30)} // so the grid starts on a Monday.
        cellStep={TimeSpan.Day}
      />
    </div>
  );
}

export { Dashboard }