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
    // default event style
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
  }

  return (
    <div>
      <Grid
        colCount={7}
        cellCount={62}
        events={TestEvents}
        egStyle={evGridStyle}
        start={new Date(2024, 11, 30)} // so the grid starts on a Monday.
        cellStep={TimeSpan.Day}
      />
    </div>
  )
}

export default App
