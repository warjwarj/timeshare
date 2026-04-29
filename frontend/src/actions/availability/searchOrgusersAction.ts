import type { UserDTO } from "../../types/UserDTO";
import fetchWrapper, { type FetchWrapperResponse } from "../../utils/fetchWrapper";

export default function searchOrgusersAction(term: string, signal: AbortSignal): Promise<FetchWrapperResponse<UserDTO[]>> {
  return fetchWrapper(`/orgusers/search/${term}`, undefined, { method: "GET", signal: signal })
}
