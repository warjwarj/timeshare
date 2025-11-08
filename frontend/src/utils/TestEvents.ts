import type { StandardEvent } from '../types/EventModel';

const events: StandardEvent[] = [
  // Jan
  { start: new Date(2025, 0, 2), end: new Date(2025, 0, 6), title: "Conference", extraClasses: "bg-blue-500", left: 0, width: 0, lane: 0 },
  { start: new Date(2025, 0, 1), end: new Date(2025, 0, 4), title: "Meeting", extraClasses: "bg-green-500", left: 0, width: 0, lane: 0 },
  { start: new Date(2025, 0, 3), end: new Date(2025, 0, 3), title: "Vacation", extraClasses: "bg-red-500", left: 0, width: 0, lane: 0 },
  { start: new Date(2025, 0, 15), end: new Date(2025, 0, 20), title: "Project Sprint", extraClasses: "bg-yellow-500", left: 0, width: 0, lane: 0 },
  { start: new Date(2025, 0, 5), end: new Date(2025, 0, 8), title: "Workshop", extraClasses: "bg-purple-500", left: 0, width: 0, lane: 0 },
  { start: new Date(2025, 0, 7), end: new Date(2025, 0, 10), title: "Team Offsite", extraClasses: "bg-pink-500", left: 0, width: 0, lane: 0 },
  { start: new Date(2025, 0, 9), end: new Date(2025, 0, 12), title: "Code Review", extraClasses: "bg-indigo-500", left: 0, width: 0, lane: 0 },
  { start: new Date(2025, 0, 11), end: new Date(2025, 0, 13), title: "1:1 Sync", extraClasses: "bg-teal-500", left: 0, width: 0, lane: 0 },
  { start: new Date(2025, 0, 4), end: new Date(2025, 0, 5), title: "Lunch Break", extraClasses: "bg-orange-500", left: 0, width: 0, lane: 0 },
  { start: new Date(2025, 0, 13), end: new Date(2025, 0, 14), title: "Client Call", extraClasses: "bg-emerald-500", left: 0, width: 0, lane: 0 },
  { start: new Date(2025, 0, 21), end: new Date(2025, 0, 25), title: "Hackathon", extraClasses: "bg-fuchsia-500", left: 0, width: 0, lane: 0 },
  { start: new Date(2025, 0, 23), end: new Date(2025, 0, 27), title: "QA Testing", extraClasses: "bg-rose-500", left: 0, width: 0, lane: 0 },
  { start: new Date(2025, 0, 26), end: new Date(2025, 0, 29), title: "Planning Week", extraClasses: "bg-cyan-500", left: 0, width: 0, lane: 0 },
  { start: new Date(2025, 0, 10), end: new Date(2025, 0, 11), title: "Coffee Chat", extraClasses: "bg-lime-500", left: 0, width: 0, lane: 0 },
  { start: new Date(2025, 0, 18), end: new Date(2025, 0, 22), title: "System Upgrade", extraClasses: "bg-sky-500", left: 0, width: 0, lane: 0 },
  { start: new Date(2025, 0, 8), end: new Date(2025, 0, 9), title: "Standup", extraClasses: "bg-gray-500", left: 0, width: 0, lane: 0 },

  // New Jan events
  { start: new Date(2025, 0, 14), end: new Date(2025, 0, 16), title: "Design Review", extraClasses: "bg-pink-300", left: 0, width: 0, lane: 0 },
  { start: new Date(2025, 0, 17), end: new Date(2025, 0, 19), title: "Client Workshop", extraClasses: "bg-blue-300", left: 0, width: 0, lane: 0 },
  { start: new Date(2025, 0, 20), end: new Date(2025, 0, 22), title: "Team Retrospective", extraClasses: "bg-green-300", left: 0, width: 0, lane: 0 },

  // Feb
  { start: new Date(2025, 0, 30), end: new Date(2025, 1, 3), title: "Conference Prep", extraClasses: "bg-blue-400", left: 0, width: 0, lane: 0 },
  { start: new Date(2025, 1, 2), end: new Date(2025, 1, 6), title: "Marketing Launch", extraClasses: "bg-red-400", left: 0, width: 0, lane: 0 },
  { start: new Date(2025, 1, 4), end: new Date(2025, 1, 9), title: "Product Demo", extraClasses: "bg-green-400", left: 0, width: 0, lane: 0 },
  { start: new Date(2025, 1, 8), end: new Date(2025, 1, 11), title: "Client Training", extraClasses: "bg-yellow-400", left: 0, width: 0, lane: 0 },
  { start: new Date(2025, 1, 10), end: new Date(2025, 1, 14), title: "End of Quarter Review", extraClasses: "bg-purple-400", left: 0, width: 0, lane: 0 },
  { start: new Date(2025, 1, 15), end: new Date(2025, 1, 19), title: "Annual Summit", extraClasses: "bg-pink-400", left: 0, width: 0, lane: 0 },
  { start: new Date(2025, 1, 18), end: new Date(2025, 1, 21), title: "Design Sprint", extraClasses: "bg-teal-400", left: 0, width: 0, lane: 0 },
  { start: new Date(2025, 1, 20), end: new Date(2025, 1, 24), title: "Innovation Week", extraClasses: "bg-orange-400", left: 0, width: 0, lane: 0 },

  // New Feb events
  { start: new Date(2025, 1, 5), end: new Date(2025, 1, 7), title: "Budget Review", extraClasses: "bg-indigo-300", left: 0, width: 0, lane: 0 },
  { start: new Date(2025, 1, 12), end: new Date(2025, 1, 13), title: "Team Lunch", extraClasses: "bg-emerald-300", left: 0, width: 0, lane: 0 },
  { start: new Date(2025, 1, 22), end: new Date(2025, 1, 25), title: "Client Presentation", extraClasses: "bg-yellow-300", left: 0, width: 0, lane: 0 },
];


export default events