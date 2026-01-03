import { useEffect, useState } from "react";
import { ourUseSelector, ourUseDispatch } from '../store/hooks';
import { EventsView } from "./EventsView.tsx";
import { makeAppSelectors, getCurrentDate } from "../store/slices/appSlice.ts";
import { Sidebar } from "../components/Sidebar.tsx";
import type { SidebarLink } from "../components/Sidebar.tsx";
import { CollapseButton } from "../components/CollapseButton.tsx";
import { isValidDate } from "../utils/utils.ts";
import { getEvents } from '../store/slices/eventsSlice.ts';

// users homepage
const Home: React.FC = () => {
  const dispatch = ourUseDispatch()

  // memoised selectors
  const { selectCurrentDatetimeAsDate, selectSelectedDateAsDate } = makeAppSelectors()
  const currentDate = ourUseSelector(selectCurrentDatetimeAsDate);
  const selectedDate = ourUseSelector(selectSelectedDateAsDate);

  useEffect(() => {
    dispatch(getCurrentDate())
  }, [dispatch])

  // get events on page load
  useEffect(() => {
    if (!isValidDate(currentDate)) {
      return;
    }
    const endDate = new Date(currentDate);
    endDate.setMonth(endDate.getMonth() + 1);
    const prm = dispatch(getEvents({ start: currentDate, end: endDate }))
    return () => {
      prm.abort()
    };
  }, [dispatch, currentDate]);

  // Track sidebar visibility. Default to closed if on phone view
  const isPhone = window.matchMedia('(min-width: 768px)').matches;
  const [isCollapsed, setIsCollapsed] = useState(!isPhone)

  const sidebarLinks: SidebarLink[] = [
    { label: 'Events', path: '/home' },
    { label: 'Availability', path: '/availability' },
    { label: 'Settings', path: '/settings' },
  ];

  // render users homepage
  return (
    <div id="Home" className="flex w-full max-h-[calc(100vh-5rem)] border-box">

      {/* Sidebar*/}
      <div className="h-full">
        <Sidebar links={sidebarLinks} isCollapsed={isCollapsed} />
      </div>

      {/* Content to right of sidebar */}
      <div className={`h-full overflow-none ${!isCollapsed ? "w-[calc(100vw-20rem)]" : "w-full"}`}>
        <div className="">
          <EventsView currentDate={currentDate} selectedDate={selectedDate}>
            {/* Children rendered in the header area */}
            <div className="h-16 w-16">
              <CollapseButton collapsed={isCollapsed} setCollapsed={setIsCollapsed} />
            </div>
          </EventsView>
        </div>
      </div>

    </div>
  );
}

export { Home } 