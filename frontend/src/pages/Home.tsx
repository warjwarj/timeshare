import { useReducer } from "react";

import { Dashboard } from "./Dashboard";

import { EventsContext, EventsDispatchContext } from '../contexts/EventsContext.tsx';
import { EventsReducer } from '../reducers/EventsReducer';
import TestEvents from '../utils/TestEvents';

// users homepage
const Home: React.FC = () => {

  // events reducer
  const [events, eventsDispatch] = useReducer(EventsReducer, TestEvents)

  // render users homepage
  return (
    <div>
      <EventsContext value={events}>
        <EventsDispatchContext value={eventsDispatch}>
          <Dashboard />
        </EventsDispatchContext>
      </EventsContext>
    </div>
  );
}

export { Home }