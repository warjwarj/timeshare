
import { ViewHeader } from '../components/ViewHeader.tsx';
import { ViewBody } from '../components/ViewBody.tsx';
import { TimeSelector } from '../components/TimeSelector.tsx';
import { selectSelectedIanaTimezone, selectCurrentDatetimeAsTzDate } from "../store/slices/appSlice.ts"
import { ourUseSelector } from '../store/hooks.ts';
import { TZDate } from "@date-fns/tz";
import { isValidDate } from '../utils/utils.ts';
import { DateSelector } from '../components/DateSelector.tsx';

const EventsView: React.FC = () => {
  const tz = ourUseSelector(selectSelectedIanaTimezone);
  const currentDatetime = ourUseSelector(selectCurrentDatetimeAsTzDate)

  if (!isValidDate(currentDatetime)) {
    return;
  }

  const tzDate = new TZDate(currentDatetime, tz)
  return (
    <ViewBody id={"EventsView"}>
      <ViewHeader>
        <> </>
      </ViewHeader>
      <TimeSelector onChange={(time: Date) => { console.log(time) }} defaultHours={currentDatetime.getHours()} defaultMins={currentDatetime.getMinutes()} />
      <DateSelector onlyMonthSelector={false} startDate={currentDatetime} />
      {tzDate.toISOString()}
      {tz}
    </ViewBody>
  );
}

export { EventsView }