import { toast } from "sonner"
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";


type ResponseType = InferResponseType<typeof client.api.tasks[":taskId"]["$delete"], 200>;
type RequestType = InferRequestType<typeof client.api.tasks[":taskId"]["$delete"]>;

export const useDeleteTask = () => {
  const queryClient = useQueryClient();


  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({

    mutationFn: async ({ param }) => {
      const response = await client.api.tasks[":taskId"]["$delete"]({ param });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Failed to delete task");
      }
      return await response.json();
    },

    onError: (error) => {
      toast.error(error.message || "Failed to delete task");
    },

    onSuccess: () => {
      toast.success("Task deleted");
      queryClient.invalidateQueries();
    },

  });
  return mutation;
};