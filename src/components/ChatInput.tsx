
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AIMessage } from '@/types';
import { SendIcon } from 'lucide-react';

type ChatInputProps = {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
};

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() === '') return;
    
    onSendMessage(message);
    setMessage('');
  };

  return (
    <div className="border-t bg-card p-4">
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <Textarea
          className="min-h-24 resize-none bg-background"
          placeholder="Describe your trip (e.g., '3-day trip to London with a budget of $1000')"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={isLoading}
        />
        <Button 
          type="submit" 
          className="bg-travel-primary hover:bg-travel-primary/90" 
          disabled={isLoading || message.trim() === ''}
          size="icon"
        >
          <SendIcon className="h-5 w-5" />
        </Button>
      </form>
    </div>
  );
};

export default ChatInput;
