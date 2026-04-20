import { User } from "lucide-react";


type ProfileIconProps = {
  name: string | null;
  onClick: () => void;
}

export default function ProfileIcon({ name, onClick }: ProfileIconProps) {
  return (
    <button
      onClick={() => onClick()}
      className="flex items-center justify-center w-full h-full rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 leading-none"
    >
      {name ? <p className="mb-[0.09rem]">{name[0]?.toLocaleUpperCase()}</p> : <User width={15} />}
    </button>
  )
}
