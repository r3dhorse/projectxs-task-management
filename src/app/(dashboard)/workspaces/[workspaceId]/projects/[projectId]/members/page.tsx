import { getCurrent } from "@/features/auth/queries";
import { getProject } from "@/features/projects/queries";
import { MembersList } from "@/features/workspaces/components/members-list";
import { redirect } from "next/navigation";

interface ProjectMembersPageProps {
  params: { 
    workspaceId: string;
    projectId: string;
  }
}

const ProjectMembersPage = async ({
  params,
}: ProjectMembersPageProps) => {
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
          <p className="text-sm text-muted-foreground">Project Members</p>
        </div>
      </div>
      
      {/* Members List - Shows workspace members who can access this project */}
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          All workspace members have access to this project. Manage workspace members to control project access.
        </p>
        <MembersList />
      </div>
    </div>
  );
};

export default ProjectMembersPage;