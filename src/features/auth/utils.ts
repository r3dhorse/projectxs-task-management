import { Models } from "node-appwrite";

/**
 * Check if a user has admin privileges based on their labels
 * @param user - The user object from Appwrite
 * @returns boolean indicating if user is admin
 */
export const isAdminUser = (user: Models.User<Models.Preferences> | null): boolean => {
  if (!user || !user.labels) {
    return false;
  }
  
  return user.labels.includes("admin");
};

/**
 * Check if a user can create workspaces (admin users only)
 * @param user - The user object from Appwrite
 * @returns boolean indicating if user can create workspaces
 */
export const canCreateWorkspace = (user: Models.User<Models.Preferences> | null): boolean => {
  return isAdminUser(user);
};