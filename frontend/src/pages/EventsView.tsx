
import { ViewHeader } from '../components/ViewHeader.tsx';
import { ViewBody } from '../components/ViewBody.tsx';
import { TimeSelector } from '../components/TimeSelector.tsx';

const EventsView: React.FC = () => {


  return (
    <ViewBody id={"EventsView"}>
      <ViewHeader>
        <></>
      </ViewHeader>

      <TimeSelector onChange={(time: Date) => {console.log(time)}} defaultHours={1} defaultMins={6} />
    </ViewBody>
  );
}

export { EventsView }