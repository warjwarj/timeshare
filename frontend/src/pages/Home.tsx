import { useReducer, useState } from "react";

import { Dashboard } from "./Dashboard";

import { EventsContext, EventsDispatchContext } from '../contexts/EventsContext.tsx';
import { EventsReducer } from '../reducers/EventsReducer';
import TestEvents from '../utils/TestEvents';
import { Sidebar } from "../components/Sidebar.tsx";
import type { SidebarLink } from "../components/Sidebar.tsx";
import { CollapseButton } from "../components/CollapseButton.tsx";

// users homepage
const Home: React.FC = () => {
  
  // events reducer
  const [events, eventsDispatch] = useReducer(EventsReducer, TestEvents)
  
  // Track sidebar visibility. Default to closed if on phone view
  const isPhone = window.matchMedia('(min-width: 768px)').matches;
  const [isCollapsed, setIsCollapsed] = useState(!isPhone)

  const sidebarLinks: SidebarLink[] = [
    { label: 'Dashboard', path: '/' },
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
        <div className="flex h-20 pl-3 items-center border-b border-light-border dark:border-dark-border overflow-hidden">
          <div className="h-15 w-15">
            <CollapseButton collapsed={isCollapsed} setCollapsed={setIsCollapsed} />
          </div>
        </div>

        {/* Main content */}
        <div className="overflow-auto">
          <EventsContext value={events}>
            <EventsDispatchContext value={eventsDispatch}>
              <Dashboard />
            </EventsDispatchContext>
          </EventsContext>
        </div>
      </div>

    </div>
  );
}

export { Home } 