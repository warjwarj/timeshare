import type { UserDTO } from "../../types/UserDTO"
import ProfileIcon from "../utils/ProfileIcon"


type UserSearchItemProps = {
  user: UserDTO
  minimal: boolean
  onClick: () => void;
}

export default function UserSearchItem({ user, minimal, onClick }: UserSearchItemProps) {

  const getUserDescription = () => {
    if (minimal) {
      return user.name || user.email
    } else {
      return user.name + " " + user.email
    }
  }

  return (
    <div className={`flex items-center w-min ${minimal ? "max-h-10" : ""} rounded-lg bg-[#bbbbbb] text-black`}
      onClick={() => onClick()}
    >
      <div className="flex p-3 gap-3 justify-around">
        <div className="flex w-6 h-6 text-sm">
          <ProfileIcon user={user} onClick={() => { }} />
        </div>
        <div className="flex flex-col">
          <span className="text-nowrap">
            {getUserDescription()}
          </span>
        </div>
      </div>
    </div>
  )
}