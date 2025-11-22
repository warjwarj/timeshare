// components
import { Grid } from './components/Grid';

// types
import type { GridStyle } from './components/Grid';
import { TimeSpan } from './types/TimeSpan'; // why does ts not have enums??

// utils
import { useReducer } from 'react';
import { EventsContext, EventsDispatchContext } from './contexts/EventsContext.tsx';
import { EventsReducer } from './reducers/EventsReducer';
import TestEvents from './utils/TestEvents';

function App() {

  // events reducer
  const [events, eventsDispatch] = useReducer(EventsReducer, TestEvents)

  // eventgrid style specifications
  const evGridStyle: GridStyle = {
    // default event style
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
  }

  return (
    <div>
      <EventsContext value={events}>
        <EventsDispatchContext value={eventsDispatch}>
          <Grid
            colCount={7}
            cellCount={62}
            events={TestEvents}
            egStyle={evGridStyle}
            start={new Date(2024, 11, 30)} // so the grid starts on a Monday.
            cellStep={TimeSpan.Day}
          />
        </EventsDispatchContext>
      </EventsContext>
    </div>
  )
}

export default App
