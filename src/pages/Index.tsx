
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ChatContainer from '@/components/ChatContainer';
import ItineraryContainer from '@/components/ItineraryContainer';
import { Trip, AIMessage, Expense } from '@/types';
// import { generateMockAIResponse } from '@/utils/trip-utils'; // No longer used
import AddExpense from '@/components/AddExpense';
import ExpensesList from '@/components/ExpensesList';
import { useToast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';

const AI_SYSTEM_PROMPT = "You are an expert travel planner. Given a user's prompt, extract destination, trip start date (use today's date unless specified), number of days (as integer), total budget (USD), then generate a detailed day-by-day itinerary with each day's activities in a structured way including: time, title, description, location (city), category (accommodation, attraction, food, transportation, other), and estimated cost (USD). Also, include an English summary. Respond only with a single valid JSON object in this exact format (do not add any extra commentary or text): {trip: Trip, summary: string}, where Trip matches this schema: { id: string, destination: string, startDate: string, endDate: string, budget: number, days: Array<{day: number, activities: Array<{id: string, time: string, title: string, description: string, location: string, cost: number, category: string}>}>, expenses: [], totalExpenses: number }.";

const Index = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
  // For API Key
  const [apiKey, setApiKey] = useState<string>(() => window.localStorage.getItem('ai_api_key') || "");

  // Initialize with welcome message from assistant
  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        content: "Hello! I'm your AI travel planner. Tell me about the trip you want to plan, including your destination, duration, and budget."
      }
    ]);
  }, []);

  // Save API key to local storage for convenience
  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey(e.target.value);
    window.localStorage.setItem('ai_api_key', e.target.value);
  };

  const handleSendMessage = async (message: string) => {
    setMessages(prev => [...prev, { role: 'user', content: message }]);
    setIsLoading(true);

    try {
      // Fallback to mock if no API key
      if (!apiKey) {
        setMessages(prev => [
          ...prev,
          { 
            role: 'assistant', 
            content: "No AI API key set. Please enter your OpenAI or Gemini (Google) API key below to generate a plan for any city." 
          }
        ]);
        setIsLoading(false);
        return;
      }

      // CALL THE AI API (OpenAI's ChatGPT as example)
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: AI_SYSTEM_PROMPT },
            { role: "user", content: message }
          ],
          temperature: 0.4,
          max_tokens: 1800,
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI error: ${response.status} ${await response.text()}`);
      }

      const data = await response.json();
      // Parse response to extract JSON object from the AI's reply
      // Try to parse first code block if present; else parse whole text as JSON
      let assistantContent = data.choices?.[0]?.message?.content || '';
      let match = assistantContent.match(/```json\s*([\s\S]+?)```/);
      let jsonStr = match ? match[1] : assistantContent;

      let parsed;
      try {
        parsed = JSON.parse(jsonStr);
      } catch (e) {
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: "Sorry, I couldn't parse the AI's response. Please try again or rephrase your query." }
        ]);
        setIsLoading(false);
        return;
      }

      // Add assistant response to chat
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: parsed.summary }
      ]);

      // Update current trip
      setCurrentTrip(parsed.trip);
      setIsLoading(false);

    } catch (error) {
      console.error('Error generating response:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error while planning your trip. Please check your API key and try again.' 
      }]);
      setIsLoading(false);

      toast({
        title: 'Error',
        description: typeof error === "object" && error ? (error as Error).message : String(error),
        variant: 'destructive',
      });
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

      {/* API Key Notice */}
      <div className="flex justify-center bg-yellow-50 py-2 border-b border-yellow-300">
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm text-yellow-900">
            To plan trips for any city, you need an OpenAI API key (get one at <a href="https://platform.openai.com/account/api-keys" className="underline" target="_blank" rel="noopener noreferrer">OpenAI</a>)
          </span>
          <span className="flex items-center gap-2 text-sm">
            <label htmlFor="openai-api-key" className="mr-2">API Key:</label>
            <input
              id="openai-api-key"
              className="border px-2 py-1 rounded w-72 text-xs"
              placeholder="sk-..."
              type="password"
              value={apiKey}
              onChange={handleApiKeyChange}
              autoComplete="off"
            />
          </span>
        </div>
      </div>

      <main className="flex-grow container mx-auto py-6 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Chat Section */}
          <div className="lg:col-span-4 h-[calc(100vh-200px)]">
            <ChatContainer 
              messages={messages} 
              onSendMessage={handleSendMessage} 
              isLoading={isLoading} 
            />
          </div>

          {/* Itinerary Section */}
          <div className="lg:col-span-6 h-[calc(100vh-200px)]">
            <ItineraryContainer trip={currentTrip} />
          </div>

          {/* Expenses Section */}
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
