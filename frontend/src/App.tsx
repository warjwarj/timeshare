// react


// components
import { Grid } from './components/Grid';

// types
import { TimeSpan } from './types/TimeSpan'; // why does ts not have enums??
import type { GridStyle } from './components/Grid'

// utils
import TestEvents from './utils/TestEvents'

function App() {

  // eventgrid style specifications
  const evGridStyle: GridStyle = {
    eventHolderStyle: {
      eventHeightStyle: "1.6em",
      defaultEventStyle: "absolute pb-0.5 pl-2 text-white text-center text-sm flex items-center justify-left text-nowrap"
    },
    cellStyle: {
      heightStyle: "300px",
    }
  }

  return (
    <div>
      <Grid
        colCount={2}
        cellCount={62}
        events={TestEvents}
        egStyle={evGridStyle}
        start={new Date(2024, 11, 30)} // so the grid starts on a Monday.
        cellStep={TimeSpan.Day}
      />;
    </div>
  )
}

export default App
