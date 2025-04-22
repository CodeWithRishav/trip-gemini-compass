
import React, { useState, useEffect } from 'react';
import { Trip, AIMessage, Expense } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { useGeminiAPI } from '@/hooks/useGeminiAPI';
import MainLayout from '@/components/layout/MainLayout';
import StatusBanners from '@/components/status/StatusBanners';
import MainContent from '@/components/layout/MainContent';

const Index = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
  
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
    
    const { aiResponse, responseMessage } = await generateTripPlan(message);
    
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
    <MainLayout>
      <StatusBanners isDemoMode={isDemoMode} errorMessage={errorMessage} />
      <MainContent
        messages={messages}
        currentTrip={currentTrip}
        isLoading={isLoading}
        onSendMessage={handleSendMessage}
        onAddExpense={handleAddExpense}
        onDeleteExpense={handleDeleteExpense}
      />
    </MainLayout>
  );
};

export default Index;
