# Followed Tasks Debugging Guide

## Issue
The followed tasks page is not showing any tasks for users, even when they create tasks that should automatically follow.

## Root Cause Analysis

After investigating the code, I've identified the most likely issue:

### **PRIMARY ISSUE: Missing Database Field**
The `followedIds` field may not exist in the Appwrite Tasks collection schema.

**Evidence:**
1. There's a script `/scripts/add-attachment-field.ts` to add the `attachmentId` field
2. No corresponding script exists for `followedIds`
3. This suggests the field was added later but never migrated to the database

## Code Analysis

### ✅ What's Working Correctly

1. **Task Creation Logic** (`/src/features/tasks/components/create-task-form.tsx`):
   - Lines 61-64: Creator is automatically added to followers
   - Line 72: followedIds is properly JSON stringified
   - ✅ No issues here

2. **Server-side Task Creation** (`/src/features/tasks/server/route.ts`):
   - Lines 249-265: Proper handling of followedIds with fallbacks
   - Line 277: Correct JSON stringification
   - ✅ Logic is sound

3. **Followed Tasks API Endpoint** (`/src/features/tasks/server/route.ts` lines 680-817):
   - Proper filtering by user ID in followedIds
   - Error handling for JSON parsing
   - Comprehensive logging
   - ✅ Implementation is correct

4. **Client-side Implementation**:
   - `useGetFollowedTasks` hook calls correct endpoint
   - Component properly handles loading/error states
   - ✅ No issues found

## Solutions

### 1. **IMMEDIATE FIX: Add Database Field**

Run the following script to add the missing field:

```bash
npx tsx scripts/add-followed-ids-field.ts
```

This will:
- Add `followedIds` as a string field (2048 chars)
- Set default value to `"[]"` (empty JSON array)
- Handle cases where field already exists

### 2. **Verify Database Schema**

Check your Appwrite console:
1. Go to Database → Tasks Collection
2. Verify `followedIds` field exists
3. Ensure it's configured as:
   - Type: String
   - Size: 2048+ characters
   - Required: No
   - Default: `"[]"`

### 3. **Test Task Creation**

After adding the field:
1. Create a new task
2. Check browser console for debug logs
3. Verify task appears in followed tasks page
4. Check database to confirm `followedIds` field contains creator's ID

## Debugging Tools Added

### Client-side Debugging
Added comprehensive logging to `FollowedTasksClient` component:
- Logs API call parameters
- Shows error messages
- Displays task count and data

### Server-side Debugging
Enhanced logging in task creation and followed tasks endpoints:
- User ID verification
- followedIds parsing and processing
- Database field verification

### Enhanced Error Handling
- Better error messages in UI
- Graceful handling of missing data
- Clear indication when no tasks are found

## Testing Steps

1. **Check Network Requests**:
   - Open browser dev tools → Network tab
   - Navigate to followed tasks page
   - Look for `/api/tasks/followed` request
   - Check response data

2. **Check Console Logs**:
   - Browser console for client-side logs
   - Server logs for task creation/filtering

3. **Database Verification**:
   - Create a test task
   - Check Appwrite console to see if `followedIds` field exists and contains data

## Additional Potential Issues

If adding the database field doesn't fix the issue, check:

1. **Permissions**: Ensure user has read access to Tasks collection
2. **Workspace Access**: Verify user is a member of the workspace
3. **User ID Consistency**: Confirm user ID is the same during creation and retrieval
4. **JSON Format**: Ensure followedIds is stored as valid JSON string

## Files Modified for Debugging

1. `/scripts/add-followed-ids-field.ts` - Database migration script
2. `/src/app/(dashboard)/workspaces/[workspaceId]/followed-tasks/client.tsx` - Enhanced client debugging
3. `/src/features/tasks/server/route.ts` - Enhanced server logging

## Next Steps

1. Run the database migration script
2. Test task creation and followed tasks functionality
3. Monitor console logs for any remaining issues
4. Remove debug logging once confirmed working