
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ChatContainer from '@/components/ChatContainer';
import ItineraryContainer from '@/components/ItineraryContainer';
import { Trip, AIMessage, Expense } from '@/types';
import AddExpense from '@/components/AddExpense';
import ExpensesList from '@/components/ExpensesList';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useGeminiAPI } from '@/hooks/useGeminiAPI';

const Index = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
  
  // Use our custom Gemini API hook
  const { 
    generateTripPlan, 
    isLoading, 
    errorMessage, 
    isDemoMode 
  } = useGeminiAPI();

  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        content: "Hello! I'm your AI travel planner. Tell me about the trip you want to plan, including your destination, duration, and budget."
      }
    ]);
  }, []);

  const handleSendMessage = async (message: string) => {
    setMessages(prev => [...prev, { role: 'user', content: message }]);
    
    const { aiResponse, responseMessage, isDemoMode: demoModeActivated, error } = 
      await generateTripPlan(message);
    
    if (aiResponse) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: responseMessage }
      ]);
      setCurrentTrip(aiResponse.trip);
    }
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

      {isDemoMode && (
        <div className="flex justify-center bg-amber-50 py-2 border-b border-amber-300">
          <div className="flex items-center gap-2 text-amber-800 text-sm">
            <span>⚠️</span>
            <span>Demo Mode: Using mock data. API connection unavailable.</span>
          </div>
        </div>
      )}

      {errorMessage && !isDemoMode && (
        <div className="flex justify-center bg-yellow-50 py-2 border-b border-yellow-300">
          <div className="flex flex-col items-center gap-2">
            <Alert variant="destructive" className="py-2 w-full max-w-md">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          </div>
        </div>
      )}
      
      <main className="flex-grow container mx-auto py-6 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 h-[calc(100vh-200px)]">
            <ChatContainer 
              messages={messages} 
              onSendMessage={handleSendMessage} 
              isLoading={isLoading} 
            />
          </div>

          <div className="lg:col-span-6 h-[calc(100vh-200px)]">
            <ItineraryContainer trip={currentTrip} />
          </div>

          <div className="lg:col-span-2 h-[calc(100vh-200px)] flex flex-col gap-4">
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
