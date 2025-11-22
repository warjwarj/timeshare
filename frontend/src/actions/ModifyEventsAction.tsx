// types
import type { EventDTO } from  '../types/EventDTO';

/*
  Action that describes the modification of one or more events
*/

type ModifyEventsAction =
  | { type: 'SET_ALL_EVENTS'; payload: { evs: EventDTO[] } }
  | { type: 'UPDATE_EVENT'; payload: { ev: EventDTO } }
  | { type: 'ADD_EVENT'; payload: { ev: EventDTO } }
  | { type: 'DELETE_EVENT'; payload: { ev: EventDTO } };
export type { ModifyEventsAction }