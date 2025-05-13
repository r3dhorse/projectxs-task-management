import { Button } from "@/components/ui/button";
import { getCurrent } from "@/features/auth/queries";
import { getProject } from "@/features/projects/queries";
import { TaskViewSwitcher } from "@/features/tasks/components/task-view-switcher";
import { PencilIcon } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

interface ProjectIdPageProps {
  params: { projectId: string }
}

const ProjectIdPage = async ({
  params,
}: ProjectIdPageProps) => {
  const user = await getCurrent();
  if (!user) redirect("/sign-in")

  const initialValues = await getProject({
    projectId: params.projectId,
  });

  if (!initialValues) {
    throw new Error("Project not found");
  }

  return (
    <div className="flex flex-col gap-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-2">
          {/* Avatar */}
          <div className="w-9 h-9 flex items-center justify-center rounded-3xl bg-blue-900 text-neutral-200 text-xl font-bold">
            {initialValues.name.charAt(0).toUpperCase()}
          </div>

          {/* Project Name */}
          <p className="text-lg font-semibold">{initialValues.name}</p>
        </div>
        <div>
          <Button variant="secondary" size="sm" asChild>
            <Link href={`/workspaces/${initialValues.workspaceId}/projects/${initialValues.$id}/settings`}>
              <PencilIcon className="size-4 mr-2" />
              Edit Project
            </Link>
          </Button>
        </div>
      </div>
      <TaskViewSwitcher />
    </div>
  );

};

export default ProjectIdPage;