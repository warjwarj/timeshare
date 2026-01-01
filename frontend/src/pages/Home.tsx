import { useEffect, useState } from "react";
import { ourUseSelector, ourUseDispatch } from '../store/hooks';
import { EventsView } from "./EventsView.tsx";
import { getCurrentDate, selectCurrentDatetime } from "../store/slices/appSlice.ts";
import { Sidebar } from "../components/Sidebar.tsx";
import type { SidebarLink } from "../components/Sidebar.tsx";
import { DateSelector } from "../components/DateSelector.tsx";
import { CollapseButton } from "../components/CollapseButton.tsx";

// users homepage
const Home: React.FC = () => {
  const currentDatetime = ourUseSelector(selectCurrentDatetime)
  const dispatch = ourUseDispatch()

  useEffect(() => {
    dispatch(getCurrentDate())
  }, [dispatch])

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
    <div id="Home" className="flex w-full h-[calc(100vh-5rem)] border-box">

      {/* Sidebar*/}
      <div className="h-full">
        <Sidebar links={sidebarLinks} isCollapsed={isCollapsed} />
      </div>

      {/* Content to right of sidebar */}
      <div className={`h-full ${!isCollapsed ? "w-[calc(100vw-20rem)]" : "w-full"}`}>

        {/* Row above main content */}
        <div className="flex justify-between min-h-20 pl-3 items-center border-b border-light-border dark:border-dark-border overflow-hidden">
          <div className="h-15 w-15">
            <CollapseButton collapsed={isCollapsed} setCollapsed={setIsCollapsed} />
          </div>
          {/* Date Selector */}
          <div className="min-h-20 border-light-border dark:border-dark-border items-center justify-center">
            <DateSelector onlyMonthSelector={false} startDate={new Date(2024, 11, 30)} />
          </div>
        </div>

        {/* Main content */}
        <div className="overflow-auto">
          <EventsView currentDatetime={currentDatetime} />
        </div>
      </div>

    </div>
  );
}

export { Home } 