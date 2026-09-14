import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { avatarUrl, initials } from "@/lib/drive/format";
import { cn } from "@/lib/utils";
import type { User } from "@/lib/drive/types";

export function UserAvatar({
  user,
  className,
  seed,
  name,
  color,
}: {
  user?: Pick<User, "name" | "seed" | "color">;
  seed?: string;
  name?: string;
  color?: string;
  className?: string;
}) {
  const s = user?.seed ?? seed ?? "Lumen";
  const n = user?.name ?? name ?? "User";
  const c = user?.color ?? color ?? "#1f4f4a";
  return (
    <Avatar className={cn("size-8", className)}>
      <AvatarImage src={avatarUrl(s)} alt="" />
      <AvatarFallback style={{ background: c, color: "#f4f2ec" }}>{initials(n)}</AvatarFallback>
    </Avatar>
  );
}
