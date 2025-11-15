
// TODO - have different types for the represention of an event on the DOM (react component)
// ... and for the object we use to pass the data around.
type EventDTO = {
  id: string
  start: Date; // event start
  end: Date;   // inclusive
  title: string;
  extraClasses: string;
  colour: string;
  left: number;
  width: number;
  lane: number;
};

export type { EventDTO };