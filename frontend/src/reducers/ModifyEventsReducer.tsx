// types
import type { ModifyEventsAction } from "../actions/ModifyEventsAction";
import type { EventDTO } from "../types/EventDTO";

/*
  Action that describes the modification of an event
*/

function ModifyEventsReducer(state: EventDTO[][], action: ModifyEventsAction): EventDTO[][] {
  switch (action.type) {
    case 'UPDATE_EVENT':
      return state.map(eventRow =>
        eventRow.map(ev =>
          ev.id === action.payload.ev.id
            ? { ...ev, start: action.payload.ev.start, end: action.payload.ev.end }
            : ev
        )
      );
    case 'UPDATE_ALL_EVENTS':
      return action.payload.evs;
    case "DELETE_EVENT":
    default:
      return state;
  }
}

export { ModifyEventsReducer }