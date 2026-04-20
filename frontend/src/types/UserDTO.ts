import type { TZDate } from "@date-fns/tz";

export type UserDTO = {
  uuid: string;
  name: string;
  email: string;
  role: string;
  createdAt: string
}

export type ProcessedUserDTO = Omit<UserDTO, "createdAt"> & {
  createdAt: TZDate
}