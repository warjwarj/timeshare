// css
import '../../index.css';

/*

*/

type CellInfoModalContent = {
  label: string
};
const CellInfoModalContent: React.FC<CellInfoModalContent> = ({ label }) => {
  return (
    <>
      <p>CLICKED ON A CELL: {label}</p>
    </>
  );
};

export { CellInfoModalContent };