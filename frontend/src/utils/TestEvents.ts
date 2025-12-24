import type { EventDTO } from '../types/EventDTO';

const events: EventDTO[] = [
  // Jan
  { uuid: "1", start: new Date(2025, 0, 2), end: new Date(2025, 0, 6), name: "Conference", colour: "bg-blue-500" },
  { uuid: "2", start: new Date(2025, 0, 1), end: new Date(2025, 0, 4), name: "Meeting", colour: "bg-green-500" },
  { uuid: "3", start: new Date(2025, 0, 3), end: new Date(2025, 0, 3), name: "Vacation", colour: "bg-red-500" },
  { uuid: "4", start: new Date(2025, 0, 15), end: new Date(2025, 0, 20), name: "Project Sprint", colour: "bg-yellow-500" },
  { uuid: "5", start: new Date(2025, 0, 5), end: new Date(2025, 0, 8), name: "Workshop", colour: "bg-purple-500" },
  { uuid: "6", start: new Date(2025, 0, 7), end: new Date(2025, 0, 10), name: "Team Offsite", colour: "bg-pink-500" },
  { uuid: "7", start: new Date(2025, 0, 9), end: new Date(2025, 0, 12), name: "Code Review", colour: "bg-indigo-500" },
  { uuid: "8", start: new Date(2025, 0, 11), end: new Date(2025, 0, 13), name: "1:1 Sync", colour: "bg-teal-500" },
  { uuid: "9", start: new Date(2025, 0, 4), end: new Date(2025, 0, 5), name: "Lunch Break", colour: "bg-orange-500" },
  { uuid: "10", start: new Date(2025, 0, 13), end: new Date(2025, 0, 14), name: "Client Call", colour: "bg-emerald-500" },
  { uuid: "11", start: new Date(2025, 0, 21), end: new Date(2025, 0, 25), name: "Hackathon", colour: "bg-fuchsia-500" },
  { uuid: "12", start: new Date(2025, 0, 23), end: new Date(2025, 0, 27), name: "QA Testing", colour: "bg-rose-500" },
  { uuid: "13", start: new Date(2025, 0, 26), end: new Date(2025, 0, 29), name: "Planning Week", colour: "bg-cyan-500" },
  { uuid: "14", start: new Date(2025, 0, 10), end: new Date(2025, 0, 11), name: "Coffee Chat", colour: "bg-lime-500" },
  { uuid: "15", start: new Date(2025, 0, 18), end: new Date(2025, 0, 22), name: "System Upgrade", colour: "bg-sky-500" },
  { uuid: "16", start: new Date(2025, 0, 8), end: new Date(2025, 0, 9), name: "Standup", colour: "bg-gray-500" },

  // New Jan events
  { uuid: "17", start: new Date(2025, 0, 14), end: new Date(2025, 0, 16), name: "Design Review", colour: "bg-pink-300" },
  { uuid: "18", start: new Date(2025, 0, 17), end: new Date(2025, 0, 19), name: "Client Workshop", colour: "bg-blue-300" },
  { uuid: "19", start: new Date(2025, 0, 20), end: new Date(2025, 0, 22), name: "Team Retrospective", colour: "bg-green-300" },

  // Feb
  { uuid: "20", start: new Date(2025, 0, 30), end: new Date(2025, 1, 3), name: "Conference Prep", colour: "bg-blue-400" },
  { uuid: "21", start: new Date(2025, 1, 2), end: new Date(2025, 1, 6), name: "Marketing Launch", colour: "bg-red-400" },
  { uuid: "22", start: new Date(2025, 1, 4), end: new Date(2025, 1, 9), name: "Product Demo", colour: "bg-green-400" },
  { uuid: "23", start: new Date(2025, 1, 8), end: new Date(2025, 1, 11), name: "Client Training", colour: "bg-yellow-400" },
  { uuid: "24", start: new Date(2025, 1, 10), end: new Date(2025, 1, 14), name: "End of Quarter Review", colour: "bg-purple-400" },
  { uuid: "25", start: new Date(2025, 1, 15), end: new Date(2025, 1, 19), name: "Annual Summit", colour: "bg-pink-400" },
  { uuid: "26", start: new Date(2025, 1, 18), end: new Date(2025, 1, 21), name: "Design Sprint", colour: "bg-teal-400" },
  { uuid: "27", start: new Date(2025, 1, 20), end: new Date(2025, 1, 24), name: "Innovation Week", colour: "bg-orange-400" },

  // New Feb events
  { uuid: "28", start: new Date(2025, 1, 5), end: new Date(2025, 1, 7), name: "Budget Review", colour: "bg-indigo-300" },
  { uuid: "29", start: new Date(2025, 1, 12), end: new Date(2025, 1, 13), name: "Team Lunch", colour: "bg-emerald-300" },
  { uuid: "30", start: new Date(2025, 1, 22), end: new Date(2025, 1, 25), name: "Client Presentation", colour: "bg-yellow-300" },
];



export default events