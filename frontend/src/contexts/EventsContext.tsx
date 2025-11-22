import { createContext } from "react";
import type { EventDTO } from "../types/EventDTO";
import type { ModifyEventsAction } from "../actions/ModifyEventsAction";


export const EventsContext = createContext<EventDTO[]>([])
export const EventsDispatchContext = createContext<(action: ModifyEventsAction) => void>(() => {});
