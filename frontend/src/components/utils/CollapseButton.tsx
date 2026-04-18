import { ChevronsLeft, ChevronsRight } from "lucide-react";

type CollapseButtonProps = {
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

const CollapseButton: React.FC<CollapseButtonProps> = ({ collapsed, setCollapsed }) => {
  return (
    <button
      onClick={() => setCollapsed(!collapsed)}
      className="
      font-medium
      w-full h-full
      flex
      justify-center
      rounded-lg
      transition-all 
      duration-200 
      hover:border-dark-primary-text
      dark:hover:border-light-primary-text
      bg-light-background 
      dark:bg-dark-background
      hover:bg-dark-background 
      dark:hover:bg-light-background
      text-light-primary-text
      dark:text-dark-primary-text
      hover:bg-v-light-accent 
      hover:dark:bg-v-dark-accent "
      aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
    >
      {collapsed ? <ChevronsRight className="w-full h-full" /> : <ChevronsLeft className="w-full h-full" />}
    </button>
  );
}

export { CollapseButton };
