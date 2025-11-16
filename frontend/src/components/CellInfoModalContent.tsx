// types
import type { EventDTO } from '../types/EventDTO';

// css
import '../../index.css';

/*

*/

type CellInfoModalContent = {
  eventsInCell: EventDTO[];
};
const CellInfoModalContent: React.FC<CellInfoModalContent> = ({ eventsInCell }) => {
  return (
    <>
      {eventsInCell.sort((a, b) => a.lane - b.lane).map((ev) => {
        return (
          <div key={ev.id}>
            <h3 className={`${ev.colour}`}>
              <strong>{ev.title}</strong>
            </h3>
            <div> id: {ev.id}</div>
            <div> Lane: {ev.lane}</div>
            <div> Start: {ev.start.toDateString()}</div>
            <div> End: {ev.end.toDateString()}</div>
          </div>
        )
      })}
    </>
  );
};

export { CellInfoModalContent };