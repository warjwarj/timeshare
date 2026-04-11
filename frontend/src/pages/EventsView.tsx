import { addHours } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { EventModalContent } from '../components/events/EventModalContent.tsx';
import { Modal } from '../components/Modal.tsx';
import { ViewBody } from '../components/ViewBody.tsx';
import { ViewHeader } from '../components/ViewHeader.tsx';
import { ourUseDispatch, ourUseSelector } from '../store/hooks.ts';
import { selectCurrentDatetimeAsTzDate } from '../store/slices/appSlice.ts';
import {
  addEvent,
  deleteEvent,
  getEvents,
  makeEventSelectors,
  updateEvent
} from '../store/slices/eventsSlice.ts';
import type { ProcessedEventDTO } from '../types/EventDTO';

import { TZDate } from '@date-fns/tz';
import { z } from 'zod';
import { GenericFilterSortGrid } from '../components/GenericFilterSortGrid.tsx';

// this is the shape of the data in the grid (zod object)
const EventSchema = z.object({
  name: z.string(),
  start: z.date(),
  end: z.date(),
  iana_timezone: z.string(),
  colour: z.string(),
  uuid: z.string(),
})
// this is ts type representation of the above
type EventSchemaType = z.infer<typeof EventSchema>

/**
 * Events View page. Tabulated representation of the events visible to the user.
 */
const EventsView: React.FC = () => {

  // dispatch
  const dispatch = ourUseDispatch();
  // selectors
  const { selectProcessedEventsAsDate } = useMemo(() => makeEventSelectors(), []);
  const events = ourUseSelector(selectProcessedEventsAsDate);
  const currentDate = ourUseSelector(selectCurrentDatetimeAsTzDate);
  // state
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [selectedEvent, setSelectedEvent] = useState<EventSchemaType | null>(null);

  // get events for now until the next year
  useEffect(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1).toISOString();
    const end = new Date(now.getFullYear() + 1, 11, 31).toISOString();
    const promise = dispatch(getEvents({ start, end }));
    return () => promise.abort();
  }, [dispatch]);

  // callbacks
  const onAdd = async (event: ProcessedEventDTO) => {
    await dispatch(addEvent(event));
  };
  const onUpdate = async (ev: ProcessedEventDTO) => {
    await dispatch(updateEvent(ev));
  };
  const onDelete = async (uuid: string) => {
    await dispatch(deleteEvent(uuid));
  };

  return (
    <ViewBody id={"EventsView"}>
      <ViewHeader>
        {/* Add button */}
        <div className="flex ml-auto items-center">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Add Event
          </button>
        </div>
      </ViewHeader>

      {/* This is the generic filter grid */}
      <GenericFilterSortGrid schema={EventSchema} data={events} rowClickedCallback={(ev: EventSchemaType) => setSelectedEvent(ev)} />

      {/* Add modal */}
      {showAddModal && createPortal(
        <Modal
          label="Add event"
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
        >
          <EventModalContent
            event={{ start: new TZDate(currentDate), end: addHours(new TZDate(currentDate), 1), uuid: "", name: "", iana_timezone: "", colour: "#525252" }}
            editing={false}
            onClose={() => setShowAddModal(false)}
            onDelete={() => { }}
            onSave={onAdd}
          />
        </Modal>,
        document.body
      )}

      {/* Update modal */}
      {selectedEvent && createPortal(
        <Modal
          label="Update event"
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
        >
          <EventModalContent
            event={{
              ...selectedEvent,
              start: new TZDate(selectedEvent.start, selectedEvent.iana_timezone),
              end: new TZDate(selectedEvent.end, selectedEvent.iana_timezone),
            } as ProcessedEventDTO}
            editing={true}
            onClose={() => setSelectedEvent(null)}
            onDelete={onDelete}
            onSave={onUpdate}
          />
        </Modal>,
        document.body
      )}

    </ViewBody>
  );
};

export { EventsView };

// const EventsView: React.FC = () => {
//   const dispatch = ourUseDispatch();
//   const { selectProcessedEventsAsDate } = useMemo(() => makeEventSelectors(), []);
//   const events = ourUseSelector(selectProcessedEventsAsDate);
//   const currentDate = ourUseSelector(selectCurrentDatetime);

//   const [showModal, setShowModal] = useState<boolean>(false);

//   useEffect(() => {
//     const now = new Date();
//     const start = new Date(now.getFullYear(), 0, 1).toISOString();
//     const end = new Date(now.getFullYear() + 1, 11, 31).toISOString();
//     const promise = dispatch(getEvents({ start, end }));
//     return () => promise.abort();
//   }, [dispatch]);

//   const onAdd = async (event: EventDTO) => {
//     await dispatch(addEvent(event));
//   };

//   return (
//     <ViewBody id={"EventsView"}>

//       <ViewHeader>
//         {/* Add button */}
//         <div className="flex ml-auto items-center">
//           <button
//             onClick={() => setShowModal(true)}
//             className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
//           >
//             Add Event
//           </button>
//         </div>
//       </ViewHeader>

//       {/* Existing events */}
//       <div className="flex-1 overflow-y-auto p-4">
//         {events.length === 0 && (
//           <div className="text-center text-light-secondary-text dark:text-dark-secondary-text py-8">
//             No events yet. Click "Add Event" to create one.
//           </div>
//         )}
//         <div className="flex flex-col gap-2">
//           {events
//             .filter((event): event is EventDTO & { uuid: string; start: Date; end: Date } => !!event.uuid)
//             .map(event => (
//               <EventListItem key={event.uuid} event={event} />
//             ))}
//         </div>
//       </div>

//       {/* This is the add modal */}
//       {showModal && createPortal(
//         <Modal
//           label="Add event"
//           isOpen={showModal}
//           onClose={() => setShowModal(false)}
//         >
//           <EventModalContent
//             event={{ start: new Date(currentDate), end: addHours(new Date(currentDate), 1), uuid: "", name: "", iana_timezone: "", colour: "#525252" }}
//             editing={false}
//             onClose={() => setShowModal(false)}
//             onDelete={() => { }}
//             onSave={onAdd}
//           />
//         </Modal>,
//         document.body
//       )}

//     </ViewBody>
//   );
// };

// export { EventsView };
