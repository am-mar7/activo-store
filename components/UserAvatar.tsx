import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { User } from "next-auth";

export default function UserAvatar({
  user,
  width = 28,
  height = 28,
  isHome = false,
}: {
  user: User;
  width?: number;
  height?: number;
  isHome?: boolean;
}) {
  const { name, email, image } = user;
  const initials = name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Avatar style={{ width: `${width}px`, height: `${height}px` }}>
      {image ? (
        <AvatarImage src={image} alt={name || email || "User Avatar"} />
      ) : (
        <AvatarFallback
          className={`bg-transparent border-2 ${
            isHome
              ? "border-white text-white"
              : "border-slate-900 text-slate-900"
          }  w-full h-full flex items-center justify-center`}
        >
          {initials}
        </AvatarFallback>
      )}
    </Avatar>
  );
}
