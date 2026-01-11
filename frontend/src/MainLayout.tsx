import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { ourUseDispatch } from "./store/hooks";
import { getCurrentDate } from "./store/slices/appSlice";
import { Sidebar } from "./components/Sidebar";
import type { SidebarLink } from "./components/Sidebar";

type MainLayoutContext = {
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  isPhone: boolean;
};

const sidebarLinks: SidebarLink[] = [
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

  const handleBackdropClick = () => {
    if (isPhone && !isCollapsed) {
      setIsCollapsed(true);
    }
  };

  return (
    <div id="MainLayout" className="flex w-full h-[calc(100dvh-5rem)] border-box overflow-x-hidden">
      {/* Backdrop overlay for phone view */}
      {isPhone && !isCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={handleBackdropClick}
        />
      )}

      {/* Sidebar */}
      <div className={`${isPhone ? "fixed top-0 left-0 h-screen z-50" : "h-full"}`}>
        <Sidebar links={sidebarLinks} isCollapsed={isCollapsed} setIsCollapsed={handleBackdropClick}/>
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
