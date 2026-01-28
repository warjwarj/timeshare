import { useEffect, useMemo, useState } from 'react';
import { ViewBody } from '../components/ViewBody.tsx';
import { ViewHeader } from '../components/ViewHeader.tsx';
import {
  getEvents,
  makeEventSelectors,
  addEvent
} from '../store/slices/eventsSlice.ts';
import { ourUseDispatch, ourUseSelector } from '../store/hooks.ts';
import { Modal } from '../components/Modal.tsx';
import type { EventDTO } from '../types/EventDTO';
import { EventListItem } from '../components/events/EventListItem.tsx';
import { EventModalContent } from '../components/events/EventModalContent.tsx';
import { createPortal } from 'react-dom';
import { selectCurrentDatetime } from '../store/slices/appSlice.ts';
import { addHours } from 'date-fns';


const EventsView: React.FC = () => {
  const dispatch = ourUseDispatch();
  const { selectProcessedEventsAsDate } = useMemo(() => makeEventSelectors(), []);
  const events = ourUseSelector(selectProcessedEventsAsDate);
  const currentDate = ourUseSelector(selectCurrentDatetime);

  const [showModal, setShowModal] = useState<boolean>(false);

  useEffect(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1).toISOString();
    const end = new Date(now.getFullYear() + 1, 11, 31).toISOString();
    const promise = dispatch(getEvents({ start, end }));
    return () => promise.abort();
  }, [dispatch]);

  const onAdd = async (event: EventDTO) => {
    await dispatch(addEvent(event));
  };

  return (
    <ViewBody id={"EventsView"}>

      <ViewHeader>
        {/* Add button */}
        <div className="flex ml-auto items-center">
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Add Event
          </button>
        </div>
      </ViewHeader>

      {/* Existing events */}
      <div className="flex-1 overflow-y-auto p-4">
        {events.length === 0 && (
          <div className="text-center text-light-secondary-text dark:text-dark-secondary-text py-8">
            No events yet. Click "Add Event" to create one.
          </div>
        )}
        <div className="flex flex-col gap-2">
          {events
            .filter((event): event is EventDTO & { uuid: string; start: Date; end: Date } => !!event.uuid)
            .map(event => (
              <EventListItem key={event.uuid} event={event} />
            ))}
        </div>
      </div>

      {/* This is the add modal */}
      {showModal && createPortal(
        <Modal
          label="Add event"
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        >
          <EventModalContent
            event={{ start: new Date(currentDate), end: addHours(new Date(currentDate), 1) } as EventDTO & { start: Date, end: Date }}
            editing={false}
            onClose={() => setShowModal(false)}
            onDelete={() => {}}
            onSave={onAdd}
          />
        </Modal>,
        document.body
      )}

    </ViewBody>
  );
};

export { EventsView };
