// componenents
import { useLayoutContext } from '../utils/utils';
import SearchBar from './search/SearchBar';
import { CollapseButton } from './utils/CollapseButton';

type ViewHeaderProps = {
  children?: React.ReactNode;
  hideSearch?: boolean;
}
const ViewHeader: React.FC<ViewHeaderProps> = ({ children, hideSearch = false }) => {
  const { isCollapsed, setIsCollapsed, isPhone } = useLayoutContext();
  return (
    <div className="flex h-[5rem] gap-3 p-2 border-b border-light-border dark:border-dark-border items-center">
      {/* Collapse button on the left of the header area. Hidden when sidebar is open on phone. */}
      {!(isPhone && !isCollapsed) && (
        <div className="flex h-16 w-16 justify-start border-light-border dark:border-dark-border">
          <CollapseButton collapsed={isCollapsed} setCollapsed={setIsCollapsed} />
        </div>
      )}
      {!hideSearch &&
        <div className="flex items-center mt-4 mb-4 border-light-border dark:border-dark-border">
          <SearchBar />
        </div>
      }
      {children}
    </div>
  );
};

export { ViewHeader }