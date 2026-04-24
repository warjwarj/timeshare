import { SearchIcon } from "lucide-react"
import { useState } from "react"
import { createPortal } from "react-dom"
import { hoverHighlight } from "../../../PredefinedStyles"
import type { UserDTO } from "../../types/UserDTO"
import { Modal } from "../Modal"
import SearchBarModalContent from "./SearchBarModalContent"
import UserSearchItem from "./UserSearchItem"


export default function SearchBar() {

  const [showModal, setShowModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserDTO | null>(null)

  return (
    <div className="flex gap-3 items-center justify-center w-full h-15 p-2 rounded-lg border border-light-border dark:border-dark-border">
      <div
        onClick={() => setShowModal(true)}
        className={`w-14 h-12 rounded-lg flex items-center justify-center ${hoverHighlight}`}
      >
        <SearchIcon />
      </div>
      {selectedUser &&
        <UserSearchItem minimal={true} user={selectedUser} onClick={() => { }} />
      }
      {showModal && createPortal(
        <Modal
          label="Search"
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        >
          <SearchBarModalContent
            onClose={() => setShowModal(false)}
            selectedUser={selectedUser}
            setSelectedUser={setSelectedUser}
          />
        </Modal>,
        document.body
      )}
    </div>
  )
}