// css
import '../../index.css';

/*

*/

type EventInfoModalContent = {
  label: string
};
const EventInfoModalContent: React.FC<EventInfoModalContent> = ({ label }) => {
  return (
    <>
      <p>CLICKED ON AN EVENT: {label}</p>
    </>
  );
};

export { EventInfoModalContent };