// componenents
import { useLayoutContext } from '../utils/utils';
import { CollapseButton } from './utils/CollapseButton';

type ViewHeaderProps = {
  children: React.ReactNode;
}
const ViewHeader: React.FC<ViewHeaderProps> = ({ children }) => {
  const { isCollapsed, setIsCollapsed, isPhone } = useLayoutContext();
  return (
    <div className="flex h-[5rem] gap-1 p-2 border-b border-light-border dark:border-dark-border items-center">

      {/* Collapse button on the left of the header area. Hidden when sidebar is open on phone. */}
      {!(isPhone && !isCollapsed) && (
        <div className="flex justify-start border-light-border dark:border-dark-border">
          <div className="h-16 w-16">
            <CollapseButton collapsed={isCollapsed} setCollapsed={setIsCollapsed} />
          </div>
        </div>
      )}
      {children}
    </div>
  );
};

export { ViewHeader }