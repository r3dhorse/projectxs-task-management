"use client"

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { updateProjectSchema } from "../schemas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { DottedSeparator } from "@/components/dotted-separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Project } from "../types";
import { ArrowLeftIcon, CopyIcon } from "lucide-react";
import { useUpdateProject } from "../api/use-update-project";
import { useConfirm } from "@/hooks/use-confirm";
import { toast } from 'sonner';




interface EditProjectFormProps {
  onCancel?: () => void;
  initialValues: Project;
}

export const EditProjectForm = ({ onCancel, initialValues }: EditProjectFormProps) => {
  const router = useRouter();
  const { mutate, isPending } = useUpdateProject();

  const [DeleteDialog, confirmDelete] = useConfirm(
    "Delete Workspace",
    "This action cannot be undone.",
    "secondary",
  );

  const form = useForm<z.infer<typeof updateProjectSchema>>({
    resolver: zodResolver(updateProjectSchema),
    defaultValues: {
      ...initialValues,
    },
  });

  const handleDelete = async () => {
    const ok = await confirmDelete();
    if (!ok) return
  };

  const onSubmit = (values: z.infer<typeof updateProjectSchema>) => {
    const finalValues = {
      ...values,
    };

    mutate({
      form: finalValues,
      param: { projectId: initialValues.$id }
    }, {
      onSuccess: () => {
        form.reset();
      }
    });

  };


  return (
    <div className="flex flex-col gap-y-4">
      <DeleteDialog />
      <Card className="w-full h-full border-none shadow-none">
        <CardHeader className="flex flex-row items-center gap-x-4 p-6 sm:p-7 space-y-0 border-b">
          <Button
            size="sm"
            variant="secondary"
            onClick={onCancel ? onCancel : () => router.push(`/workspaces/${initialValues.workspaceId}/projects/${initialValues.$id}`)}
            className="flex items-center gap-2"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back
          </Button>
          <CardTitle className="text-xl font-semibold truncate">
            {initialValues.name}
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6 sm:p-7">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-muted-foreground">
                        Workspace Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter workspace name"
                          className="focus-visible:ring-2 focus-visible:ring-primary"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <DottedSeparator />

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <Button
                  type="button"
                  size="lg"
                  variant="secondary"
                  onClick={onCancel}
                  disabled={isPending}
                  className={cn(!onCancel && "invisible", "w-full sm:w-auto")}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  size="lg"
                  disabled={isPending}
                  className="w-full sm:w-auto"
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="w-full h-full border-none shadow-none">
        <CardContent className="p-7">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h3 className="font-bold text-red-600">Danger Zone</h3>
              <p className="text-sm text-muted-foreground">
                Deleting a project is a permanent action and will result in the loss of all associated data.
              </p>
            </div>
            <Button
              className="mt-4 sm:mt-0 sm:ml-4 w-fit"
              size="sm"
              variant="secondary"
              disabled={isPending}
              onClick={handleDelete}
            >
              Delete Project
            </Button>
          </div>
        </CardContent>
      </Card>

    </div>
  );

};
