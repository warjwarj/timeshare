// types
import { type EventModel } from '../types/EventModel';

// css
import '../../index.css';

/*

*/

type CellInfoModalContent = {
  label: string
  eventsInCell: EventModel[];
};
const CellInfoModalContent: React.FC<CellInfoModalContent> = ({ eventsInCell }) => {
  return (
    <>
      {eventsInCell.sort((a, b) => a.lane - b.lane).map((ev) => {
        return (
          <>
            <h3 className={`${ev.extraClasses}`}>
              <strong>{ev.title}</strong>
            </h3>
            <div> id: {ev.id}</div>
            <div> Lane: {ev.lane}</div>
            <div> Start: {ev.start.toDateString()}</div>
            <div> End: {ev.end.toDateString()}</div>
            <hr />
          </>
        )
      })}
    </>
  );
};

export { CellInfoModalContent };