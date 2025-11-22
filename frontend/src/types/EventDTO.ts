
// TODO - have different types for the represention of an event on the DOM (react component)
// ... and for the object we use to pass the data around.
type EventDTO = {
  key: string; 
  id: string
  start: Date; // event start
  end: Date;   // inclusive
  title: string;
  colour: string;
};

export type { EventDTO };