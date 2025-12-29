import { Grid } from '../components/Grid';
import type { GridStyle } from '../components/Grid';
import { TimeSpan } from '../types/dateTypes'


// eventgrid style
const gridStyle: GridStyle = {
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
  cellCount: 35
}

const Dashboard: React.FC = () => {
  return (
    <div id="Dashboard" className="flex">
      <Grid
        egStyle={gridStyle}
        start={new Date(2024, 11, 30)}
        cellStep={TimeSpan.Day}
      />
    </div>
  );
}

export { Dashboard }