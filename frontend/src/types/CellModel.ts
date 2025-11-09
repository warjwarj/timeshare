import type { EventModel } from "./EventModel"

type CellModel = {
  label: string;
  lanes: Map<number, EventModel>;
}

export type { CellModel }