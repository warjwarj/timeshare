import type { UserDTO } from "../../types/UserDTO"
import ProfileIcon from "../utils/ProfileIcon"


type UserSearchItemProps = {
  user: UserDTO
  minimal: boolean
}

export default function UserSearchItem({ minimal, user }: UserSearchItemProps) {

  const getUserDescription = () => {
    if (minimal) {
      return user.name || user.email
    } else {
      return user.name + " " + user.email
    }
  }

  return (
    <div className={`flex items-center w-min ${minimal ? "max-h-10" : ""} rounded-lg bg-[#bbbbbb] text-black`}>
      <div className="flex p-3 gap-3 justify-around">
        <div className="flex w-6 h-6 text-sm">
          <ProfileIcon name={user.name} onClick={() => { }} />
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