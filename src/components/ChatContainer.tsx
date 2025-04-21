
import React, { useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { AIMessage } from '@/types';

type ChatContainerProps = {
  messages: AIMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
};

const ChatContainer: React.FC<ChatContainerProps> = ({ 
  messages, 
  onSendMessage, 
  isLoading 
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col rounded-lg shadow-md border h-full bg-card">
      <div className="p-4 border-b">
        <h2 className="font-semibold">Travel Assistant</h2>
        <p className="text-xs text-muted-foreground">
          Powered by Gemini AI
        </p>
      </div>
      
      <div className="flex-grow overflow-y-auto p-2">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center">
            <div className="h-16 w-16 travel-gradient rounded-full flex items-center justify-center mb-4">
              <span className="text-white text-2xl">✈</span>
            </div>
            <h3 className="text-lg font-medium mb-2">Welcome to Trip Gemini Compass</h3>
            <p className="text-sm text-muted-foreground max-w-md mb-4">
              Describe your ideal trip and I'll help you plan it. Try something like "3-day trip to London with a budget of $1000"
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full max-w-md">
              <button 
                onClick={() => onSendMessage("3-day trip to London with a budget of $1000")}
                className="text-sm bg-muted hover:bg-muted/90 px-4 py-2 rounded-md text-left"
              >
                3-day trip to London ($1000)
              </button>
              <button 
                onClick={() => onSendMessage("Weekend in Paris for a couple, focus on romance")}
                className="text-sm bg-muted hover:bg-muted/90 px-4 py-2 rounded-md text-left"
              >
                Romantic weekend in Paris
              </button>
              <button 
                onClick={() => onSendMessage("5-day family trip to Tokyo with teenagers")}
                className="text-sm bg-muted hover:bg-muted/90 px-4 py-2 rounded-md text-left"
              >
                Family trip to Tokyo (5 days)
              </button>
              <button 
                onClick={() => onSendMessage("Budget friendly 4-day trip to New York")}
                className="text-sm bg-muted hover:bg-muted/90 px-4 py-2 rounded-md text-left"
              >
                Budget trip to New York (4 days)
              </button>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <ChatMessage key={index} message={message} />
            ))}
            {isLoading && (
              <div className="flex justify-start px-4 py-3">
                <div className="bg-muted rounded-xl rounded-tl-none max-w-[80%] px-4 py-3">
                  <div className="flex space-x-2">
                    <div className="h-3 w-3 bg-travel-primary/60 rounded-full animate-pulse"></div>
                    <div className="h-3 w-3 bg-travel-primary/60 rounded-full animate-pulse delay-150"></div>
                    <div className="h-3 w-3 bg-travel-primary/60 rounded-full animate-pulse delay-300"></div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <ChatInput onSendMessage={onSendMessage} isLoading={isLoading} />
    </div>
  );
};

export default ChatContainer;
