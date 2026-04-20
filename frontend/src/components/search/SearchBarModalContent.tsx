import { HttpStatusCode } from "axios";
import { useEffect, useState } from "react";
import { inputLabel, textInput } from "../../../PredefinedStyles";
import { toastService } from "../../toastService";
import type { UserDTO } from "../../types/UserDTO";
import { apiClient } from "../../utils/apiClient";
import { tryParseAxiosMessage } from "../../utils/utils";
import UserSearchItem from "./UserSearchItem";


type SearchBarModalContentProps = {
  onClose: () => void;
  selectedUser: UserDTO | null;
  setSelectedUser: (user: UserDTO) => void
}

export default function SearchBarModalContent({ setSelectedUser }: SearchBarModalContentProps) {

  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<UserDTO[]>([])

  // search api call 
  const search = async (term: string, signal: AbortSignal) => {
    const res = await apiClient.get(`/users/search/${term}`, {
      signal,
      validateStatus: status => status < 500,
    })
    if (res.status !== HttpStatusCode.Ok) {
      const errMsg = tryParseAxiosMessage(res);
      toastService.showError("Couldn't search", errMsg);
      return;
    }
    setSearchResults(res.data as UserDTO[])
  }

  // call api with debounce
  useEffect(() => {
    if (!searchTerm) {
      return;
    }
    const abort = new AbortController()
    const handler = setTimeout(() => {
      search(searchTerm, abort.signal)
    }, 500);
    return () => {
      clearTimeout(handler);
      abort.abort()
    };
  }, [searchTerm]);

  return (
    <div className="flex flex-col gap-3 w-full h-full p-3 rounded-lg border border-light-border dark:border-dark-border">
      <div className="pb-6">
        <label htmlFor="rule-name" className={inputLabel}>
          Search users
        </label>
        <input
          type="text"
          id="search-term"
          onChange={(e) => setSearchTerm(e.target.value)}
          className={textInput}
          placeholder="e.g., John"
        />
      </div>
      <div className="flex flex-col gap-3">
        {searchResults.length !== 0 && searchResults.map(user => {
          return <UserSearchItem minimal={false} user={user} />
        })}
        {searchTerm !== "" && searchResults.length === 0 &&
          <div>
            No results.
          </div>
        }
      </div>
    </div >
  )
}