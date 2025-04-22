
import React from 'react';
import ChatContainer from '@/components/ChatContainer';
import ItineraryContainer from '@/components/ItineraryContainer';
import ExpensesList from '@/components/ExpensesList';
import AddExpense from '@/components/AddExpense';
import { Trip, AIMessage, Expense } from '@/types';

type MainContentProps = {
  messages: AIMessage[];
  currentTrip: Trip | null;
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  onAddExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
};

const MainContent: React.FC<MainContentProps> = ({
  messages,
  currentTrip,
  isLoading,
  onSendMessage,
  onAddExpense,
  onDeleteExpense
}) => {
  return (
    <main className="flex-grow container mx-auto py-6 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 h-[calc(100vh-200px)]">
          <ChatContainer 
            messages={messages} 
            onSendMessage={onSendMessage} 
            isLoading={isLoading} 
          />
        </div>

        <div className="lg:col-span-6 h-[calc(100vh-200px)]">
          <ItineraryContainer trip={currentTrip} />
        </div>

        <div className="lg:col-span-2 h-[calc(100vh-200px)] flex flex-col gap-4">
          <AddExpense onAddExpense={onAddExpense} />
          <div className="flex-grow overflow-hidden">
            <ExpensesList 
              expenses={currentTrip?.expenses || []} 
              onDeleteExpense={onDeleteExpense}
            />
          </div>
        </div>
      </div>
    </main>
  );
};

export default MainContent;
