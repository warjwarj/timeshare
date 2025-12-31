// types
import type { EventProps } from './Event';

// css
import '../../../index.css';

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
          <div className="bg-light-background dark:bg-dark-background text-light-primary-text dark:text-dark-primary-text" key={ev.key + "cell-modal-content"}>
            <h3 style={{
              backgroundColor: ev.eventDTO.colour
            }}>
              <strong>{ev.eventDTO.name}</strong>
            </h3>
            <div>
              <div> id: {ev.eventDTO.uuid}</div>
              <div> Lane: {ev.evStyle.lane}</div>
              <div> Start: {ev.eventDTO.start.toDateString()}</div>
              <div> End: {ev.eventDTO.end.toDateString()}</div>
            </div>
          </div>
        )
      })}
    </>
  );
};

export { CellInfoModalContent };