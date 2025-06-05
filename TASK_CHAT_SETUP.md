# Task Chat Setup Instructions

The WhatsApp-like chat feature has been successfully implemented for task details pages. To complete the setup, you need to:

## 1. Create Appwrite Collection

Create a new collection in your Appwrite database with the following configuration:

**Collection Name:** `task-messages`

**Attributes:**
- `taskId` (string, required) - References the task this message belongs to
- `senderId` (string, required) - ID of the user who sent the message
- `senderName` (string, required) - Name of the user who sent the message
- `content` (string, required, max length: 1000) - The message content
- `timestamp` (string, required) - ISO timestamp when message was sent
- `workspaceId` (string, required) - References the workspace for permissions

**Indexes:**
- `taskId` (key) - For efficient querying of messages by task
- `timestamp` (key) - For chronological ordering

**Permissions:**
- Read: Users who are members of the workspace
- Write: Users who are members of the workspace

## 2. Environment Variable

Add the following environment variable to your `.env.local` file:

```
NEXT_PUBLIC_APPWRITE_TASK_MESSAGES_COLLECTION_ID=your_collection_id_here
```

Replace `your_collection_id_here` with the actual collection ID from Appwrite.

## 3. Features Implemented

✅ **WhatsApp-like UI**: Message bubbles, timestamps, date separators
✅ **Real-time messaging**: Send and receive messages with immediate updates
✅ **User identification**: Messages show sender names and avatars
✅ **Loading states**: Smooth loading animations throughout
✅ **Character limits**: 1000 character limit with counter
✅ **Responsive design**: Works on mobile and desktop
✅ **Empty state**: Friendly message when no conversations exist
✅ **Typing indicators**: Visual feedback when sending messages

## 4. Usage

The chat component is automatically included in all task details pages at:
`/workspaces/[workspaceId]/tasks/[taskId]`

Users can:
- View all messages in chronological order
- Send new messages up to 1000 characters
- See who sent each message with timestamps
- Navigate the conversation history

## 5. Technical Details

- **API Endpoints**: `/api/tasks/messages/[taskId]` (GET) and `/api/tasks/messages` (POST)
- **Real-time**: Uses React Query for automatic refetching
- **Permissions**: Workspace-based access control
- **Storage**: Messages persist in Appwrite database
- **Validation**: Zod schemas for type safety

The implementation follows the existing codebase patterns and integrates seamlessly with the current authentication and workspace systems.