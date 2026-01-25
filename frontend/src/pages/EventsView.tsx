
import { ViewHeader } from '../components/ViewHeader.tsx';
import { ViewBody } from '../components/ViewBody.tsx';
import { TimeSelector } from '../components/TimeSelector.tsx';
import { selectSelectedIanaTimezone, selectCurrentDatetimeAsTzDate } from "../store/slices/appSlice.ts"
import { ourUseSelector } from '../store/hooks.ts';
import { isValidDate } from '../utils/utils.ts';
import { DateSelector } from '../components/DateSelector.tsx';

const EventsView: React.FC = () => {
  const tz = ourUseSelector(selectSelectedIanaTimezone);
  const currentDatetime = ourUseSelector(selectCurrentDatetimeAsTzDate)

  if (!isValidDate(currentDatetime)) {
    return;
  }

  return (
    <ViewBody id={"EventsView"}>
      <ViewHeader>
        <> </>
      </ViewHeader>
      <TimeSelector onChange={(time: Date) => { console.log(time) }} defaultHours={currentDatetime.getHours()} defaultMins={currentDatetime.getMinutes()} />
      <DateSelector onlyMonthSelector={false} startDate={currentDatetime} />
      {currentDatetime.toISOString()}
      {tz}
    </ViewBody>
  );
}

export { EventsView }