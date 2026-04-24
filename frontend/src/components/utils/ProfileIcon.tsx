import { User } from "lucide-react";
import type { UserDTO } from "../../types/UserDTO";


type ProfileIconProps = {
  user: UserDTO;
  onClick: () => void;
}

export default function ProfileIcon({ user, onClick }: ProfileIconProps) {
  return (
    <button
      onClick={() => onClick()}
      className={`flex items-center justify-center w-full h-full rounded-full text-white font-semibold leading-none`}
      style={{
        backgroundColor: user.colour
      }}
    >
      {user.name ? <p className="mb-[0.09rem]">{user.name[0]?.toLocaleUpperCase()}</p> : <User width={15} />}
    </button>
  )
}
