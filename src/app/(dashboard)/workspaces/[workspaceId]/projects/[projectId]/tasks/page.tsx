import { getCurrent } from "@/features/auth/queries";
import { getProject } from "@/features/projects/queries";
import { TaskViewSwitcher } from "@/features/tasks/components/task-view-switcher";
import { redirect } from "next/navigation";

interface ProjectTasksPageProps {
  params: { 
    workspaceId: string;
    projectId: string;
  }
}

const ProjectTasksPage = async ({
  params,
}: ProjectTasksPageProps) => {
  const user = await getCurrent();
  if (!user) redirect("/sign-in");

  const project = await getProject({
    projectId: params.projectId,
  });

  if (!project) {
    throw new Error("Project not found");
  }

  return (
    <div className="flex flex-col gap-y-4">
      <div className="flex items-center gap-x-2">
        {/* Project Avatar */}
        <div className="w-9 h-9 flex items-center justify-center rounded-3xl bg-blue-900 text-neutral-200 text-xl font-bold">
          {project.name.charAt(0).toUpperCase()}
        </div>
        
        {/* Project Name */}
        <div>
          <h1 className="text-lg font-semibold">{project.name}</h1>
          <p className="text-sm text-muted-foreground">Project Tasks</p>
        </div>
      </div>
      
      {/* Task Management Interface */}
      <TaskViewSwitcher />
    </div>
  );
};

export default ProjectTasksPage;