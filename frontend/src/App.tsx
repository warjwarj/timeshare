import { EventGrid } from './components/EventGrid';

function App() {

  // test events
  const events = [
    { start: 2, end: 6, title: "Conference", extraClasses: "bg-blue-500", left: 0, width: 0, top: 0 },
    { start: 1, end: 4, title: "Meeting", extraClasses: "bg-green-500", left: 0, width: 0, top: 0 },
    { start: 3, end: 3, title: "Vacation", extraClasses: "bg-red-500", left: 0, width: 0, top: 0 },
    { start: 15, end: 20, title: "Project Sprint", extraClasses: "bg-yellow-500", left: 0, width: 0, top: 0 },
    { start: 5, end: 8, title: "Workshop", extraClasses: "bg-purple-500", left: 0, width: 0, top: 0 },
    { start: 7, end: 10, title: "Team Offsite", extraClasses: "bg-pink-500", left: 0, width: 0, top: 0 },
    { start: 9, end: 12, title: "Code Review", extraClasses: "bg-indigo-500", left: 0, width: 0, top: 0 },
    { start: 11, end: 13, title: "1:1 Sync", extraClasses: "bg-teal-500", left: 0, width: 0, top: 0 },
    { start: 4, end: 5, title: "Lunch Break", extraClasses: "bg-orange-500", left: 0, width: 0, top: 0 },
    { start: 13, end: 14, title: "Client Call", extraClasses: "bg-emerald-500", left: 0, width: 0, top: 0 },
    { start: 21, end: 25, title: "Hackathon", extraClasses: "bg-fuchsia-500", left: 0, width: 0, top: 0 },
    { start: 23, end: 27, title: "QA Testing", extraClasses: "bg-rose-500", left: 0, width: 0, top: 0 },
    { start: 26, end: 29, title: "Planning Week", extraClasses: "bg-cyan-500", left: 0, width: 0, top: 0 },
    { start: 10, end: 11, title: "Coffee Chat", extraClasses: "bg-lime-500", left: 0, width: 0, top: 0 },
    { start: 18, end: 22, title: "System Upgrade", extraClasses: "bg-sky-500", left: 0, width: 0, top: 0 },
    { start: 8, end: 9, title: "Standup", extraClasses: "bg-gray-500", left: 0, width: 0, top: 0 },
    { start: 30, end: 34, title: "Conference Prep", extraClasses: "bg-blue-400", left: 0, width: 0, top: 0 },
    { start: 33, end: 37, title: "Marketing Launch", extraClasses: "bg-red-400", left: 0, width: 0, top: 0 },
    { start: 35, end: 40, title: "Product Demo", extraClasses: "bg-green-400", left: 0, width: 0, top: 0 },
    { start: 39, end: 42, title: "Client Training", extraClasses: "bg-yellow-400", left: 0, width: 0, top: 0 },
    { start: 41, end: 45, title: "End of Quarter Review", extraClasses: "bg-purple-400", left: 0, width: 0, top: 0 },
    { start: 46, end: 50, title: "Annual Summit", extraClasses: "bg-pink-400", left: 0, width: 0, top: 0 },
    { start: 49, end: 52, title: "Design Sprint", extraClasses: "bg-teal-400", left: 0, width: 0, top: 0 },
    { start: 51, end: 55, title: "Innovation Week", extraClasses: "bg-orange-400", left: 0, width: 0, top: 0 },
  ];

  // eventgrid style specifications
  const evGridStyle = {
    RowHeightPx: 300,
    EventHeightPx: 20,
    DefaultEventStyle: "relative pb-0.5 pl-2 text-white text-center text-sm flex items-center justify-left"
  }

  return (
    <>
      <EventGrid columns={20} cells={62} events={events} egStyle={evGridStyle} />;
    </>
  )
}

export default App
