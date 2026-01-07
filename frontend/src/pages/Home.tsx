import { useEffect, useState } from "react";
import { ourUseDispatch } from '../store/hooks';
import { EventsView } from "./EventsView.tsx";
import { getCurrentDate } from "../store/slices/appSlice.ts";
import { Sidebar } from "../components/Sidebar.tsx";
import type { SidebarLink } from "../components/Sidebar.tsx";
import { CollapseButton } from "../components/CollapseButton.tsx";

// users homepage
const Home: React.FC = () => {
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
    <div id="Home" className="flex w-full h-[calc(100dvh-5rem)] border-box overflow-x-hidden">

      {/* Sidebar*/}
      <div className="h-full">
        <Sidebar links={sidebarLinks} isCollapsed={isCollapsed} />
      </div>

      {/* Content to right of sidebar */}
      <div className={`h-full overflow-none ${!isCollapsed ? "w-[calc(100dvw-20rem)]" : "w-full"}`}>
        <div className="">
          <EventsView>
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