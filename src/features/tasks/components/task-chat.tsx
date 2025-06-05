"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SendIcon, SmileIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrent } from "@/features/auth/api/use-current";
import { useGetTaskMessages } from "../api/use-get-task-messages";
import { useCreateTaskMessage } from "../api/use-create-task-message";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { TaskMessage } from "../types/messages";

interface TaskChatProps {
  taskId: string;
  className?: string;
}

type ChatMessage = Omit<TaskMessage, 'timestamp'> & {
  id: string;
  timestamp: Date;
  isOwn: boolean;
};

export const TaskChat = ({ taskId, className }: TaskChatProps) => {
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const workspaceId = useWorkspaceId();
  
  const { data: currentUser } = useCurrent();
  const { data: messagesData, isLoading: isLoadingMessages } = useGetTaskMessages({ 
    taskId, 
    workspaceId 
  });
  const { mutate: createMessage, isPending: isCreatingMessage } = useCreateTaskMessage();

  // Transform API messages to include isOwn property
  const messages = useMemo(() => {
    if (!messagesData?.documents) return [];
    
    return messagesData.documents.map((doc): ChatMessage => {
      const msg = doc as TaskMessage;
      return {
        ...msg,
        id: msg.$id,
        timestamp: new Date(msg.timestamp),
        isOwn: msg.senderId === currentUser?.$id,
      };
    });
  }, [messagesData?.documents, currentUser?.$id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Only auto-scroll if user is near the bottom or if it's their own message
    const shouldScroll = () => {
      if (!messagesEndRef.current) return false;
      
      const container = messagesEndRef.current.parentElement;
      if (!container) return true;
      
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      
      return isNearBottom;
    };

    if (shouldScroll()) {
      scrollToBottom();
    }
  }, [messages]);

  // Scroll to bottom when component first loads
  useEffect(() => {
    scrollToBottom();
  }, []);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !currentUser || isCreatingMessage) return;

    createMessage({
      json: {
        taskId,
        content: newMessage.trim(),
        workspaceId,
      }
    });
    
    setNewMessage("");
    
    // Simulate typing indicator for demo
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
    }, 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const dateKey = message.timestamp.toDateString();
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(message);
    return groups;
  }, {} as Record<string, ChatMessage[]>);

  if (isLoadingMessages) {
    return (
      <Card className={cn("h-[500px] flex flex-col", className)}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Team Chat</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <LoadingSpinner variant="minimal" size="md" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("h-[500px] flex flex-col", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center justify-between">
          Team Chat
          {/* Live indicator */}
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-500">Live</span>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0 min-h-0">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 pb-2">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500 text-sm">
              No messages yet. Start the conversation!
            </div>
          ) : (
            Object.entries(groupedMessages).map(([dateKey, dateMessages]) => (
            <div key={dateKey}>
              {/* Date Separator */}
              <div className="flex items-center justify-center my-4">
                <div className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                  {formatDate(new Date(dateKey))}
                </div>
              </div>
              
              {/* Messages for this date */}
              {dateMessages.map((message, index) => {
                const showAvatar = index === 0 || 
                  dateMessages[index - 1]?.senderId !== message.senderId;
                const isLast = index === dateMessages.length - 1 ||
                  dateMessages[index + 1]?.senderId !== message.senderId;
                
                return (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-2 mb-1 w-full",
                      message.isOwn ? "justify-end" : "justify-start"
                    )}
                  >
                    {!message.isOwn && (
                      <div className="flex-shrink-0 w-8">
                        {showAvatar ? (
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="text-xs bg-blue-100 text-blue-600">
                              {getInitials(message.senderName)}
                            </AvatarFallback>
                          </Avatar>
                        ) : null}
                      </div>
                    )}
                    
                    <div className={cn(
                      "max-w-[70%] flex flex-col min-w-0",
                      message.isOwn ? "items-end" : "items-start"
                    )}>
                      {/* Sender name (only for others' messages and first in group) */}
                      {!message.isOwn && showAvatar && (
                        <span className="text-xs text-gray-500 mb-1 px-2">
                          {message.senderName}
                        </span>
                      )}
                      
                      {/* Message bubble */}
                      <div
                        className={cn(
                          "px-3 py-2 rounded-lg text-sm relative max-w-full min-w-0 border",
                          message.isOwn
                            ? "bg-blue-500 text-white rounded-br-sm border-blue-600/30 shadow-sm"
                            : "bg-gray-100 text-gray-900 rounded-bl-sm border-gray-200/80 shadow-sm",
                          !isLast && "mb-1",
                          // Add opacity for optimistic messages
                          message.$id.startsWith('temp-') && "opacity-70"
                        )}
                      >
                        <p className="whitespace-pre-wrap break-words overflow-wrap-anywhere">
                          {message.content}
                        </p>
                        
                        {/* Timestamp (only on last message in group) */}
                        {isLast && (
                          <div className={cn(
                            "text-xs mt-1 flex",
                            message.isOwn 
                              ? "text-blue-100 justify-end" 
                              : "text-gray-500 justify-start"
                          )}>
                            {formatTime(message.timestamp)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
          )}
          
          {/* Typing indicator */}
          {isTyping && (
            <div className="flex gap-2 mb-2">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="text-xs bg-green-100 text-green-600">
                  SW
                </AvatarFallback>
              </Avatar>
              <div className="bg-gray-100 px-3 py-2 rounded-lg rounded-bl-sm">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input Area */}
        <div className="border-t-2 border-neutral-200/80 p-4 bg-gray-50/50 backdrop-blur-sm">
          <div className="flex gap-2 items-end">
            <div className="flex-1 relative">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className="pr-10 resize-none min-h-[40px] rounded-full border-2 border-gray-300/80 focus:border-blue-400/80 transition-colors shadow-sm"
                maxLength={1000}
              />
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 text-gray-400 hover:text-gray-600"
              >
                <SmileIcon className="h-4 w-4" />
              </Button>
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || isCreatingMessage}
              size="icon"
              className="h-10 w-10 rounded-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-200"
            >
              {isCreatingMessage ? (
                <LoadingSpinner size="sm" className="text-white" />
              ) : (
                <SendIcon className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          {/* Character count */}
          <div className="text-xs text-gray-400 mt-1 text-right">
            {newMessage.length}/1000
          </div>
        </div>
      </CardContent>
    </Card>
  );
};