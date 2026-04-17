import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import type { SidebarLink } from "./components/Sidebar";
import { Sidebar } from "./components/Sidebar";
import { ourUseDispatch } from "./store/hooks";
import { getCurrentDate, setIsPhone } from "./store/slices/appSlice";

type MainLayoutContext = {
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  isPhone: boolean;
};

const sidebarLinks: SidebarLink[] = [
  { label: "Search", path: "/search" },
  { label: "Calendar", path: "/calendar" },
  { label: "Events", path: "/events" },
  { label: "Availability", path: "/availability" },
  { label: "Settings", path: "/settings" },
];

const MainLayout: React.FC = () => {
  const dispatch = ourUseDispatch();

  useEffect(() => {
    dispatch(getCurrentDate());
  }, [dispatch]);

  // Track sidebar visibility. Default to closed if on phone view
  const isPhone = !window.matchMedia("(min-width: 768px)").matches;
  const [isCollapsed, setIsCollapsed] = useState(isPhone);

  useEffect(() => {
    dispatch(setIsPhone({ isPhone: isPhone }))
  }, [dispatch, isPhone])

  const handleBackdropClick = () => {
    if (isPhone && !isCollapsed) {
      setIsCollapsed(true);
    }
  };

  return (
    <div id="MainLayout" className="flex w-full h-[calc(100vh-5rem)] border-box overflow-x-hidden">
      {/* Backdrop overlay for phone view */}
      {isPhone && !isCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={handleBackdropClick}
        />
      )}

      {/* Sidebar */}
      <div className={`${isPhone ? "fixed top-0 left-0 h-full z-50" : "h-full"}`}>
        <Sidebar links={sidebarLinks} isCollapsed={isCollapsed} setIsCollapsed={handleBackdropClick} />
      </div>

      {/* Content to right of sidebar */}
      <div className={`h-full overflow-none ${!isCollapsed && !isPhone ? "w-[calc(100dvw-20rem)]" : "w-full"}`}>
        <Outlet context={{ isCollapsed, setIsCollapsed, isPhone }} />
      </div>
    </div>
  );
};

export { MainLayout };
export type { MainLayoutContext };
