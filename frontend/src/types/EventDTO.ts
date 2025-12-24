
// TODO - have different types for the represention of an event on the DOM (react component)
// ... and for the object we use to pass the data around.
type EventDTO = {
  key: string; 
  uuid: string
  start: Date; // event start
  end: Date;   // inclusive
  name: string;
  colour: string;
};

export type { EventDTO };