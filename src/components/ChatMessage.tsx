
import React from 'react';
import { cn } from '@/lib/utils';
import { AIMessage } from '@/types';

type ChatMessageProps = {
  message: AIMessage;
};

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  
  return (
    <div className={cn(
      "flex w-full px-4 py-3",
      isUser ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "max-w-[80%] rounded-xl px-4 py-3",
        isUser 
          ? "bg-travel-primary text-white rounded-tr-none" 
          : "bg-muted rounded-tl-none"
      )}>
        <p className="text-sm">{message.content}</p>
      </div>
    </div>
  );
};

export default ChatMessage;
