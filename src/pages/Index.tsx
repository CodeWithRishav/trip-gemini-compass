
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ChatContainer from '@/components/ChatContainer';
import ItineraryContainer from '@/components/ItineraryContainer';
import { Trip, AIMessage, Expense } from '@/types';
import { generateMockAIResponse } from '@/utils/trip-utils';
import AddExpense from '@/components/AddExpense';
import ExpensesList from '@/components/ExpensesList';
import { useToast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';

const Index = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);

  // Initialize with welcome message from assistant
  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        content: 'Hello! I\'m your AI travel planner. Tell me about the trip you want to plan, including your destination, duration, and budget.'
      }
    ]);
  }, []);

  const handleSendMessage = async (message: string) => {
    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: message }]);
    
    // Show loading state
    setIsLoading(true);
    
    // In a real application, this would call the Gemini API
    // For demo purposes, we'll simulate a delay and use mock data
    setTimeout(() => {
      try {
        const response = generateMockAIResponse(message);
        
        // Add assistant response to chat
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: response.summary 
        }]);
        
        // Update current trip
        setCurrentTrip(response.trip);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error generating response:', error);
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: 'Sorry, I encountered an error while planning your trip. Please try again.' 
        }]);
        setIsLoading(false);
        
        toast({
          title: 'Error',
          description: 'Failed to generate trip plan',
          variant: 'destructive',
        });
      }
    }, 2000);
  };

  const handleAddExpense = (expense: Expense) => {
    if (!currentTrip) return;
    
    const updatedTrip = {
      ...currentTrip,
      expenses: [...currentTrip.expenses, expense],
      totalExpenses: currentTrip.totalExpenses + expense.amount
    };
    
    setCurrentTrip(updatedTrip);
  };

  const handleDeleteExpense = (id: string) => {
    if (!currentTrip) return;
    
    const expense = currentTrip.expenses.find(e => e.id === id);
    if (!expense) return;
    
    const updatedTrip = {
      ...currentTrip,
      expenses: currentTrip.expenses.filter(e => e.id !== id),
      totalExpenses: currentTrip.totalExpenses - expense.amount
    };
    
    setCurrentTrip(updatedTrip);
    
    toast({
      title: 'Expense deleted',
      description: `${expense.description} has been removed`,
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background hero-pattern">
      <Header />
      
      <main className="flex-grow container mx-auto py-6 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Chat Section */}
          <div className="lg:col-span-4 h-[calc(100vh-140px)]">
            <ChatContainer 
              messages={messages} 
              onSendMessage={handleSendMessage} 
              isLoading={isLoading} 
            />
          </div>
          
          {/* Itinerary Section */}
          <div className="lg:col-span-6 h-[calc(100vh-140px)]">
            <ItineraryContainer trip={currentTrip} />
          </div>
          
          {/* Expenses Section */}
          <div className="lg:col-span-2 h-[calc(100vh-140px)] flex flex-col gap-4">
            <AddExpense onAddExpense={handleAddExpense} />
            <div className="flex-grow overflow-hidden">
              <ExpensesList 
                expenses={currentTrip?.expenses || []} 
                onDeleteExpense={handleDeleteExpense}
              />
            </div>
          </div>
        </div>
      </main>
      
      <footer className="mt-auto py-4 text-center text-sm text-muted-foreground">
        <p>Trip Gemini Compass • AI-powered travel planner</p>
      </footer>
    </div>
  );
};

export default Index;
