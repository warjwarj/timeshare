// types
import type { EventDTO } from "../types/EventDTO";
import type { ModifyEventsAction } from "../actions/ModifyEventsAction";

// utils
import { isValidDate } from "../utils/utils";

// events
function EventsReducer(
  state: EventDTO[],
  action: ModifyEventsAction
) {
  let newEvents = state;
  switch (action.type) {
    case 'SET_ALL_EVENTS':
      newEvents = action.payload.evs.map(ev => {
        const startDate = new Date(ev.start)
        const endDate = new Date(ev.end)
        if (isValidDate(startDate) && isValidDate(endDate)) {
          return { ...ev, start: startDate, end: endDate }
        }
      }).filter(x => x != null);
      break;
    case 'UPDATE_EVENT':
      newEvents = state.map(ev => {
        return ev.id == action.payload.ev.id ?
          action.payload.ev :
          ev
      })
      break;
    case 'DELETE_EVENT':
      newEvents = newEvents.filter(ev => ev.id === action.payload.ev.id)
      break;
    default:
      break;
  }
  // return new state
  return newEvents
}

export { EventsReducer }