// css
import '../../index.css';
import type { EventModel } from '../types/EventModel';

/*

*/

type EventInfoModalContent = {
  event: EventModel
};
const EventInfoModalContent: React.FC<EventInfoModalContent> = ({ event }) => {
  console.log(event)
  return (
    <>
      <h3 className={`${event.extraClasses}`}>
        <strong>{event.title}</strong>
      </h3>
      <div> id: {event.id}</div>
      <div> Lane: {event.lane}</div>
      <div> Start: {event.start.toDateString()}</div>
      <div> End: {event.end.toDateString()}</div>
      <hr />
    </>
  );
};

export { EventInfoModalContent };