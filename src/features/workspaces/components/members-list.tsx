"use client";
import { useState, Fragment } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWorkspaceId } from "../hooks/use-workspace-id";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeftIcon, MoreVerticalIcon, UserPlusIcon, ShieldIcon, UserIcon, SearchIcon, UsersIcon } from "lucide-react";
import Link from "next/link";
import { DottedSeparator } from "@/components/dotted-separator";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useDeleteMember } from "@/features/members/api/use-delete-member";
import { useUpdateMember } from "@/features/members/api/use-update-member";
import { MemberRole } from "@/features/members/types";
import { useConfirm } from "@/hooks/use-confirm";
import { AddMemberModal } from "@/features/members/components/add-member-modal";
import { useAddMemberModal } from "@/features/members/hooks/use-add-member-modal";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useCurrent } from "@/features/auth/api/use-current";

interface PopulatedMember {
  $id: string;
  userId: string;
  workspaceId: string;
  role: MemberRole;
  name: string;
  email: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
  $collectionId: string;
  $databaseId: string;
}

export const MembersList = () => {
  const workspaceId = useWorkspaceId();
  const { data: currentUser } = useCurrent();
  const addMemberModal = useAddMemberModal();
  
  const [ConfirmDialog, confirm] = useConfirm(
    "Remove Member",
    "This member will be removed from the workspace",
    "destructive"
  );
  
  const { data, isLoading } = useGetMembers({ workspaceId });
  const {
    mutate: deleteMember,
    isPending: isDeletingMember,
  } = useDeleteMember();
  const {
    mutate: updateMember,
    isPending: isUpdatingMember,
  } = useUpdateMember();

  // Find current user's member record to check if they're admin
  const currentMember = data?.documents?.find(member => (member as PopulatedMember).userId === currentUser?.$id) as PopulatedMember | undefined;
  const isCurrentUserAdmin = currentMember?.role === MemberRole.ADMIN;

  const handleUpdateMember = (memberId: string, role: MemberRole) => {
    updateMember({
      json: { role },
      param: { memberId },
    });
  }

  const handleDeleteMember = async (memberId: string) => {
    const ok = await confirm();
    if (!ok) return;

    deleteMember({ param: { memberId } }, {
      onSuccess: () => {
        window.location.reload();
      },
    });
  }


  const [search, setSearch] = useState("");

  const filteredMembers =
    data?.documents?.filter((member) =>
      (member as PopulatedMember).name.toLowerCase().includes(search.toLowerCase())
    ) ?? [];

  return (
    <>
      <ConfirmDialog />
      <AddMemberModal 
        isOpen={addMemberModal.isOpen}
        onClose={addMemberModal.close}
        workspaceId={workspaceId}
      />
      
      <Card className="w-full h-full border-none shadow-none">
        <CardHeader className="flex flex-row items-center gap-x-4 p-7 space-y-0">
          <Button asChild variant="secondary" size="sm">
            <Link href={`/workspaces/${workspaceId}`}>
              <ArrowLeftIcon className="size-4 mr-2" />
              Back
            </Link>
          </Button>
          <div className="flex items-center gap-3 flex-1">
            <UsersIcon className="h-6 w-6 text-blue-600" />
            <div>
              <CardTitle className="text-xl font-bold">Workspace Members</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Manage members and their roles in this workspace
              </p>
            </div>
          </div>
          {isCurrentUserAdmin && (
            <Button 
              onClick={addMemberModal.open}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <UserPlusIcon className="size-4 mr-2" />
              Add Member
            </Button>
          )}
        </CardHeader>

        <div className="px-7">
          <DottedSeparator />
        </div>

        <CardContent className="p-7 space-y-6">
          {/* Search Bar */}
          <div className="relative max-w-md">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search members by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Members Count */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-sm">
                {filteredMembers.length} {filteredMembers.length === 1 ? 'member' : 'members'}
              </Badge>
              {search && (
                <span className="text-sm text-muted-foreground">
                  {filteredMembers.length === data?.total ? 'showing all' : `filtered from ${data?.total || 0}`}
                </span>
              )}
            </div>
          </div>

          {/* Members List */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-sm text-muted-foreground">Loading members...</p>
                </div>
              </div>
            ) : filteredMembers.length > 0 ? (
              filteredMembers.map((member) => {
                const populatedMember = member as PopulatedMember;
                return (
                <Fragment key={member.$id}>
                  <div className="flex items-center gap-4 p-4 rounded-lg border bg-white hover:bg-gray-50 transition-colors">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-semibold">
                        {populatedMember.name?.[0]?.toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {populatedMember.name}
                        </p>
                        {populatedMember.role === MemberRole.ADMIN ? (
                          <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                            <ShieldIcon className="h-3 w-3 mr-1" />
                            Admin
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <UserIcon className="h-3 w-3 mr-1" />
                            Member
                          </Badge>
                        )}
                        {populatedMember.userId === currentUser?.$id && (
                          <Badge variant="outline" className="text-blue-600 border-blue-200">
                            You
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate mt-1">
                        {populatedMember.email}
                      </p>
                    </div>
                    
                    {isCurrentUserAdmin && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVerticalIcon className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="bottom" align="end">
                          {populatedMember.role !== MemberRole.ADMIN && (
                            <DropdownMenuItem
                              onClick={() => handleUpdateMember(populatedMember.$id, MemberRole.ADMIN)}
                              disabled={isUpdatingMember}
                              className="flex items-center gap-2"
                            >
                              <ShieldIcon className="h-4 w-4" />
                              Make Administrator
                            </DropdownMenuItem>
                          )}
                          {populatedMember.role !== MemberRole.MEMBER && (
                            <DropdownMenuItem
                              onClick={() => handleUpdateMember(populatedMember.$id, MemberRole.MEMBER)}
                              disabled={isUpdatingMember}
                              className="flex items-center gap-2"
                            >
                              <UserIcon className="h-4 w-4" />
                              Make Member
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleDeleteMember(populatedMember.$id)}
                            disabled={isDeletingMember}
                            className="flex items-center gap-2 text-red-600 focus:text-red-600"
                          >
                            Remove {populatedMember.name}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </Fragment>
                );
              })
            ) : (
              <div className="text-center py-12">
                <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">No members found</p>
                <p className="text-sm text-muted-foreground mb-4">
                  {search ? 'Try adjusting your search terms' : 'This workspace has no members yet'}
                </p>
                {isCurrentUserAdmin && !search && (
                  <Button onClick={addMemberModal.open} className="bg-blue-600 hover:bg-blue-700">
                    <UserPlusIcon className="h-4 w-4 mr-2" />
                    Add First Member
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Admin Help Text */}
          {isCurrentUserAdmin && filteredMembers.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 rounded-full p-1">
                  <ShieldIcon className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-900 mb-1">
                    Administrator Privileges
                  </p>
                  <p className="text-xs text-blue-700">
                    As an admin, you can add new members, change roles, and remove members from this workspace.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};
