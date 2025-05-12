import { Value } from "@radix-ui/react-select";
import { z } from "zod";

export const creatProjectSchema = z.object({
  name: z.string().trim().min(1, "Required"),
  image: z.union([
    z.instanceof(File),
    z.string().transform((value) => value === "" ? undefined : value),
  ])
  .optional(),
  workspaceId: z.string(),
});