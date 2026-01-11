import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { ourUseDispatch } from "../store/hooks";
import { getCurrentDate } from "../store/slices/appSlice";
import { Sidebar } from "../components/Sidebar";
import type { SidebarLink } from "../components/Sidebar";

type MainLayoutContext = {
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
};

const sidebarLinks: SidebarLink[] = [
  { label: "Events", path: "/home" },
  { label: "Availability", path: "/availability" },
  { label: "Settings", path: "/settings" },
];

const MainLayout: React.FC = () => {
  const dispatch = ourUseDispatch();

  useEffect(() => {
    dispatch(getCurrentDate());
  }, [dispatch]);

  // Track sidebar visibility. Default to closed if on phone view
  const isPhone = window.matchMedia("(min-width: 768px)").matches;
  const [isCollapsed, setIsCollapsed] = useState(!isPhone);

  return (
    <div id="MainLayout" className="flex w-full h-[calc(100dvh-5rem)] border-box overflow-x-hidden">
      {/* Sidebar */}
      <div className="h-full">
        <Sidebar links={sidebarLinks} isCollapsed={isCollapsed} />
      </div>

      {/* Content to right of sidebar */}
      <div className={`h-full overflow-none ${!isCollapsed ? "w-[calc(100dvw-20rem)]" : "w-full"}`}>
        <Outlet context={{ isCollapsed, setIsCollapsed }} />
      </div>
    </div>
  );
};

export { MainLayout };
export type { MainLayoutContext };
