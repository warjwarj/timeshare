import { useState } from 'react';
import '../../../index.css';
import { deleteEvent, updateEvent } from '../../store/slices/eventsSlice';
import type { EventDTO } from '../../types/EventDTO';
import { ourUseDispatch } from '../../store/hooks';
import { createPortal } from 'react-dom';
import { EventModalContent } from './EventModalContent';
import { Modal } from '../Modal';
import React from 'react';
import { formatDate } from '../../utils/utils';

type EventListItemProps = {
  event: EventDTO & { uuid: string; start: Date; end: Date }
}

const EventListItem: React.FC<EventListItemProps> = ({ event }) => {
  const dispatch = ourUseDispatch();

  const [showModal, setShowModal] = useState<boolean>(false)

  const onSave = async (ev: EventDTO) => {
    await dispatch(updateEvent(ev));
  };

  const onDelete = async (uuid: string) => {
    await dispatch(deleteEvent(uuid));
  };

  return (
    <React.Fragment key={event.uuid}>
      <div
        key={event.uuid}
        className="p-4 flex flex-col justify-between bg-light-background dark:bg-dark-background border border-light-border dark:border-dark-border rounded-lg"
      >
        <div className="flex justify-between gap-6 items-start mb-3">
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full border border-light-border dark:border-dark-border"
              style={{ backgroundColor: event.colour || '#525252' }}
            />
            <h3 className="font-semibold text-light-primary-text dark:text-dark-primary-text">
              {event.name}
            </h3>
          </div>
        </div>

        <div className="mb-2 text-sm text-light-secondary-text dark:text-dark-secondary-text">
          <span className="font-medium">Start: </span>
          {formatDate(event.start, event.iana_timezone || 'UTC')}
        </div>

        <div className="mb-2 text-sm text-light-secondary-text dark:text-dark-secondary-text">
          <span className="font-medium">End: </span>
          {formatDate(event.end, event.iana_timezone || 'UTC')}
        </div>

        <div className="mb-2 text-sm text-light-secondary-text dark:text-dark-secondary-text">
          <span className="font-medium">Timezone: </span>
          {event.iana_timezone}
        </div>

        <div className="flex justify-start gap-2 mt-4">
          <button
            onClick={() => setShowModal(true)}
            className="px-3 py-1 text-sm bg-light-accent dark:bg-dark-accent text-light-primary-text dark:text-dark-primary-text rounded hover:opacity-80 transition-opacity"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(event.uuid)}
            className="px-3 py-1 text-sm bg-red-400 text-white rounded hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      {showModal && createPortal(
        <Modal
          label="Edit event"
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        >
          <EventModalContent
            event={event}
            editing={true}
            onClose={() => setShowModal(false)}
            onDelete={onDelete}
            onSave={onSave}
          />
        </Modal>,
        document.body
      )}
    </React.Fragment>
  )
};

export { EventListItem };
export type { EventListItemProps }
