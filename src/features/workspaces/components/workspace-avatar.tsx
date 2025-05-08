import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";


interface WorkspaceAvatarProps {
  name: string;
  className?: string;
};

export const WorkspaceAvatar = ({
  name,
  className
}: WorkspaceAvatarProps) => {
  return (
    <Avatar className={cn("size-10", className)}>
      <AvatarFallback className="text-white bg-blue-700 font-semibold text-lg uppercase">
        {name[0]}
      </AvatarFallback>
    </Avatar>
  )
}