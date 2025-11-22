// types
import type { EventProps } from '../components/Event';

// css
import '../../index.css';

/*

*/

type CellInfoModalContent = {
  eventsInCell: EventProps[];
};
const CellInfoModalContent: React.FC<CellInfoModalContent> = ({ eventsInCell }) => {
  return (
    <>
      {eventsInCell.sort((a, b) => a.evStyle.lane - b.evStyle.lane).map((ev) => {
        return (
          <div key={ev.key + "cell-modal-content"}>
            <h3 className={`${ev.evStyle.colour}`}>
              <strong>{ev.eventDTO.title}</strong>
            </h3>
            <div> id: {ev.eventDTO.id}</div>
            <div> Lane: {ev.evStyle.lane}</div>
            <div> Start: {ev.eventDTO.start.toDateString()}</div>
            <div> End: {ev.eventDTO.end.toDateString()}</div>
          </div>
        )
      })}
    </>
  );
};

export { CellInfoModalContent };