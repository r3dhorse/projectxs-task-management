"use client";

import { TaskHistoryEntry } from "../types/history";
import { formatHistoryMessage, getActionColor } from "../utils/history";
import { formatDistanceToNow } from "date-fns";
import { useGetTaskHistory } from "../api/use-get-task-history";

interface TaskHistoryProps {
  taskId: string;
}

export const TaskHistory = ({ taskId }: TaskHistoryProps) => {
  const { data: historyData, isLoading } = useGetTaskHistory({ taskId });

  const history = historyData?.documents || [];

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-start gap-x-3">
            <div className="w-2 h-2 bg-gray-300 rounded-full mt-2 animate-pulse"></div>
            <div className="flex-1 space-y-1">
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-3 bg-gray-100 rounded w-20 animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 text-sm">No activity history available</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-[400px] overflow-y-auto">
      {history.map((entry) => (
        <div key={entry.$id} className="flex items-start gap-x-3 text-sm">
          <div 
            className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${getActionColor(entry.action)}`}
          ></div>
          <div className="flex-1">
            <p className="text-gray-700">
              {formatHistoryMessage(
                entry.action,
                entry.userName,
                entry.field,
                entry.oldValue,
                entry.newValue,
                entry.details
              )}
            </p>
            <p className="text-gray-500 text-xs mt-1">
              {formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};