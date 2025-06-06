import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.tasks[":taskId"]["follow"]["$post"], 200>;
type RequestType = InferRequestType<typeof client.api.tasks[":taskId"]["follow"]["$post"]>;

export const useFollowTask = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ param }) => {
      const response = await client.api.tasks[":taskId"]["follow"]["$post"]({
        param,
      });

      if (!response.ok) {
        throw new Error("Failed to follow task");
      }

      return await response.json();
    },
    onSuccess: () => {
      toast.success("Task followed successfully");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["followed-tasks"] });
    },
    onError: () => {
      toast.error("Failed to follow task");
    },
  });

  return mutation;
};