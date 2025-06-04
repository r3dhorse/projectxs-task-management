import { differenceInDays, format } from "date-fns";

import { cn } from "@/lib/utils";

interface TaskDateProps {
  value: string;
  className?: string;
}

export const TaskDate = ({ value, className }: TaskDateProps) => {
  const today = new Date();
  const endDate = new Date(value);
  const diffInDays = differenceInDays(endDate, today);

  let textColor = "text-green-500"; // Default green for more than 7 days

  if (diffInDays < 3) {
    textColor = "text-red-500";
  } else if (diffInDays < 7) {
    textColor = "text-yellow-500";
  }

  return (
    <div className={textColor}>
      <span className={cn("truncate", className)}>
        {format(value, "PPP")}
      </span>
    </div>
  );
};