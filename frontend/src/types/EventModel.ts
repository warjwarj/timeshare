
// TODO - have different types for the represention of an event on the DOM (react component)
// ... and for the object we use to pass the data around.
type EventModel = {
  id: string
  start: Date; // event start
  end: Date;   // inclusive
  title: string;
  extraClasses: string;
  left: number;
  width: number;
  lane: number;
};

export type { EventModel };