import { DarkModeToggle } from "./DarkModeToggle";
import { DateSelector } from "./DateSelector";

type SidebarLink = {
  label: string;
  path: string;
}

type SidebarProps = {
  isCollapsed: boolean;
  links: SidebarLink[];
  userName?: string;
  userEmail?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ links, isCollapsed }) => {
  return (
    <div className={`h-full ${isCollapsed ? "hidden" : "w-100"}`}>
      <div
        className={`h-full overflow-hidden flex flex-col bg-light-background border-r border-light-border dark:border-dark-border text-light-primary-text
          dark:text-dark-primary-text dark:bg-dark-background`}
      >

        {/* Date Selector */}
        <div className="min-h-20 border-b border-light-border dark:border-dark-border items-center justify-center">
          <DateSelector startDate={new Date(2024, 11, 30)} />
        </div>

        {/* Links */}
        <div className="border-b border-light-border dark:border-dark-border">
          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-2">
              {links && links.map((link: SidebarLink, index: number) => (
                <li key={index}>
                  <a
                    href={link.path}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg group block
                   hover:bg-v-light-accent hover:dark:bg-v-dark-accent
                  ${isCollapsed ? 'justify-center' : ''}`}
                    title={isCollapsed ? link.label : ''}
                    aria-label={link.label}
                  >
                    {!isCollapsed && (
                      <span className="text-sm font-medium whitespace-nowrap">{link.label}</span>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Footer */}
        <div className="p-4 mt-auto justify-self-end border-t border-b border-light-border dark:border-dark-border">
            <DarkModeToggle />
        </div>

      </div>
    </div>
  );
}

export { Sidebar }
export type { SidebarProps, SidebarLink }