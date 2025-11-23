// components
import { Grid } from '../components/Grid';

// types
import { TimeSpan } from '../types/TimeSpan';
import type { GridStyle } from '../components/Grid';

// eventgrid style
const evGridStyle: GridStyle = {
  eventStyle: {
    eventHeightStyle: "1.6em",
    defaultEventStyle: "absolute pb-0.5 pl-2 text-white text-center text-sm items-center justify-left text-nowrap",
    extraClasses: "",
    colour: "",
    lane: 0,
    left: 0,
    width: 0
  },
  cellStyle: {
    heightStyle: "150px",
  },
  colCount: 7,
  cellCount: 62
}

const Dashboard: React.FC = () => {
  return (
    <div>
      <h1>Dashboard</h1>
      <Grid
        egStyle={evGridStyle}
        start={new Date(2024, 11, 30)} // so the grid starts on a Monday.
        cellStep={TimeSpan.Day}
      />
    </div>
  );
}

export { Dashboard }