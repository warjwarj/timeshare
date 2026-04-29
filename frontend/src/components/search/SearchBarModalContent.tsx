import { useEffect, useState } from "react";
import { inputLabel, textInput } from "../../../PredefinedStyles";
import searchOrgusersAction from "../../actions/availability/searchOrgusersAction";
import { toastService } from "../../toastService";
import type { UserDTO } from "../../types/UserDTO";
import UserSearchItem from "./UserSearchItem";


type SearchBarModalContentProps = {
  onClose: () => void; selectedUser: UserDTO | null;
  setSelectedUser: (user: UserDTO) => void
}

export default function SearchBarModalContent({ setSelectedUser }: SearchBarModalContentProps) {

  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<UserDTO[]>([])

  // search api call 
  const search = async (term: string, signal: AbortSignal) => {
    const errMsg = "Couldn't search orgusers"
    const res = await searchOrgusersAction(term, signal)
    if (!res.ok) {
      toastService.showError(errMsg, res.error);
    }
    setSearchResults(res.data)
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
          return <UserSearchItem user={user} minimal={false} onClick={() => setSelectedUser(user)} />
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