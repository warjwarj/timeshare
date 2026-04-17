import { ViewBody } from '../components/ViewBody.tsx';
import { ViewHeader } from '../components/ViewHeader.tsx';


/**
 * Search users I guess for the mo
 */
const SearchView: React.FC = () => {

  return (
    <ViewBody id={"SearchView"}>
      <ViewHeader>
        {/* Add button */}
        <div className="flex ml-auto items-center">
        </div>
      </ViewHeader>
    </ViewBody>
  );
};

export { SearchView };