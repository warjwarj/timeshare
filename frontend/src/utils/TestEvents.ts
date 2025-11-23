import type { EventDTO } from '../types/EventDTO';

const events: EventDTO[] = [
  // Jan
  { id: "1", start: new Date(2025, 0, 2), end: new Date(2025, 0, 6), title: "Conference", colour: "bg-blue-500" },
  { id: "2", start: new Date(2025, 0, 1), end: new Date(2025, 0, 4), title: "Meeting", colour: "bg-green-500" },
  { id: "3", start: new Date(2025, 0, 3), end: new Date(2025, 0, 3), title: "Vacation", colour: "bg-red-500" },
  { id: "4", start: new Date(2025, 0, 15), end: new Date(2025, 0, 20), title: "Project Sprint", colour: "bg-yellow-500" },
  { id: "5", start: new Date(2025, 0, 5), end: new Date(2025, 0, 8), title: "Workshop", colour: "bg-purple-500" },
  { id: "6", start: new Date(2025, 0, 7), end: new Date(2025, 0, 10), title: "Team Offsite", colour: "bg-pink-500" },
  { id: "7", start: new Date(2025, 0, 9), end: new Date(2025, 0, 12), title: "Code Review", colour: "bg-indigo-500" },
  { id: "8", start: new Date(2025, 0, 11), end: new Date(2025, 0, 13), title: "1:1 Sync", colour: "bg-teal-500" },
  { id: "9", start: new Date(2025, 0, 4), end: new Date(2025, 0, 5), title: "Lunch Break", colour: "bg-orange-500" },
  { id: "10", start: new Date(2025, 0, 13), end: new Date(2025, 0, 14), title: "Client Call", colour: "bg-emerald-500" },
  { id: "11", start: new Date(2025, 0, 21), end: new Date(2025, 0, 25), title: "Hackathon", colour: "bg-fuchsia-500" },
  { id: "12", start: new Date(2025, 0, 23), end: new Date(2025, 0, 27), title: "QA Testing", colour: "bg-rose-500" },
  { id: "13", start: new Date(2025, 0, 26), end: new Date(2025, 0, 29), title: "Planning Week", colour: "bg-cyan-500" },
  { id: "14", start: new Date(2025, 0, 10), end: new Date(2025, 0, 11), title: "Coffee Chat", colour: "bg-lime-500" },
  { id: "15", start: new Date(2025, 0, 18), end: new Date(2025, 0, 22), title: "System Upgrade", colour: "bg-sky-500" },
  { id: "16", start: new Date(2025, 0, 8), end: new Date(2025, 0, 9), title: "Standup", colour: "bg-gray-500" },

  // New Jan events
  { id: "17", start: new Date(2025, 0, 14), end: new Date(2025, 0, 16), title: "Design Review", colour: "bg-pink-300" },
  { id: "18", start: new Date(2025, 0, 17), end: new Date(2025, 0, 19), title: "Client Workshop", colour: "bg-blue-300" },
  { id: "19", start: new Date(2025, 0, 20), end: new Date(2025, 0, 22), title: "Team Retrospective", colour: "bg-green-300" },

  // Feb
  { id: "20", start: new Date(2025, 0, 30), end: new Date(2025, 1, 3), title: "Conference Prep", colour: "bg-blue-400" },
  { id: "21", start: new Date(2025, 1, 2), end: new Date(2025, 1, 6), title: "Marketing Launch", colour: "bg-red-400" },
  { id: "22", start: new Date(2025, 1, 4), end: new Date(2025, 1, 9), title: "Product Demo", colour: "bg-green-400" },
  { id: "23", start: new Date(2025, 1, 8), end: new Date(2025, 1, 11), title: "Client Training", colour: "bg-yellow-400" },
  { id: "24", start: new Date(2025, 1, 10), end: new Date(2025, 1, 14), title: "End of Quarter Review", colour: "bg-purple-400" },
  { id: "25", start: new Date(2025, 1, 15), end: new Date(2025, 1, 19), title: "Annual Summit", colour: "bg-pink-400" },
  { id: "26", start: new Date(2025, 1, 18), end: new Date(2025, 1, 21), title: "Design Sprint", colour: "bg-teal-400" },
  { id: "27", start: new Date(2025, 1, 20), end: new Date(2025, 1, 24), title: "Innovation Week", colour: "bg-orange-400" },

  // New Feb events
  { id: "28", start: new Date(2025, 1, 5), end: new Date(2025, 1, 7), title: "Budget Review", colour: "bg-indigo-300" },
  { id: "29", start: new Date(2025, 1, 12), end: new Date(2025, 1, 13), title: "Team Lunch", colour: "bg-emerald-300" },
  { id: "30", start: new Date(2025, 1, 22), end: new Date(2025, 1, 25), title: "Client Presentation", colour: "bg-yellow-300" },
];



export default events