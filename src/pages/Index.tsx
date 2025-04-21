
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ChatContainer from '@/components/ChatContainer';
import ItineraryContainer from '@/components/ItineraryContainer';
import { Trip, AIMessage, Expense } from '@/types';
import AddExpense from '@/components/AddExpense';
import ExpensesList from '@/components/ExpensesList';
import { useToast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { generateMockAIResponse } from '@/utils/trip-utils';

const AI_SYSTEM_PROMPT = "You are an expert travel planner. Given a user's prompt, extract destination, trip start date (use today's date unless specified), number of days (as integer), total budget (USD), then generate a detailed day-by-day itinerary with each day's activities in a structured way including: time, title, description, location (city), category (accommodation, attraction, food, transportation, other), and estimated cost (USD). Also, include an English summary. Respond only with a single valid JSON object in this exact format (do not add any extra commentary or text): {trip: Trip, summary: string}, where Trip matches this schema: { id: string, destination: string, startDate: string, endDate: string, budget: number, days: Array<{day: number, activities: Array<{id: string, time: string, title: string, description: string, location: string, cost: number, category: string}>}>, expenses: [], totalExpenses: number }.";

// This API key will be used with the updated API endpoint
const GEMINI_API_KEY = "AIzaSyDbgTNGVGgq9qF8VQYag8XgmKoaxDXLOF4";

const Index = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [useAI, setUseAI] = useState(true);

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
    setIsLoading(true);
    setErrorMessage(null);

    try {
      let assistantContent = '';
      let parsed: any;

      if (useAI) {
        // Correct Gemini API endpoint for standard Gemini accounts
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [
                  { text: AI_SYSTEM_PROMPT },
                  { text: message }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.4,
              maxOutputTokens: 1800,
            }
          })
        });

        if (!response.ok) {
          const responseData = await response.text();
          console.error("API Response error:", responseData);
          
          // If we get an error with the AI, fall back to the mock implementation
          toast({
            title: 'AI Service Error',
            description: `Falling back to demo mode. API error: ${response.status}`,
            variant: 'destructive',
          });
          
          const mockResponse = generateMockAIResponse(message);
          parsed = mockResponse;
          setUseAI(false);
        } else {
          const data = await response.json();
          assistantContent = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          
          let jsonStr = "";

          // Try to extract JSON from the response
          let match = assistantContent.match(/```json\s*([\s\S]+?)```/);
          if (match) {
            jsonStr = match[1];
          } else {
            match = assistantContent.match(/```([\s\S]+?)```/);
            if (match) {
              jsonStr = match[1];
            } else {
              match = assistantContent.match(/\{[\s\S]*\}/m);
              if (match) {
                jsonStr = match[0];
              } else {
                jsonStr = assistantContent;
              }
            }
          }

          jsonStr = jsonStr.trim();

          try {
            parsed = JSON.parse(jsonStr);
            
            if (!parsed.trip || !parsed.summary) {
              throw new Error("Response missing required trip or summary property");
            }
            
            const trip = parsed.trip;
            if (!trip.destination || !Array.isArray(trip.days)) {
              throw new Error("Trip data is incomplete");
            }
            
            if (!trip.id) {
              trip.id = uuidv4();
            }
            
            if (!Array.isArray(trip.expenses)) {
              trip.expenses = [];
            }
            
            if (typeof trip.totalExpenses !== 'number') {
              trip.totalExpenses = 0;
            }
          } catch (e) {
            try {
              jsonStr = jsonStr.replace(/\\"/g, '"').replace(/^"/, '').replace(/"$/, '');
              parsed = JSON.parse(jsonStr);
            } catch (innerError) {
              throw new Error(`Failed to parse response: ${e instanceof Error ? e.message : String(e)}`);
            }
          }
        }
      } else {
        // Use mock implementation as fallback
        const mockResponse = generateMockAIResponse(message);
        parsed = mockResponse;
        
        toast({
          title: 'Using Demo Mode',
          description: 'Using a demo response. To use AI, please check your API key or quota.',
          variant: 'default',
        });
      }

      // Set the assistant message with the summary
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: parsed.summary }
      ]);
      setCurrentTrip(parsed.trip);
      setIsLoading(false);
    } catch (error) {
      console.error('Error generating response:', error);
      
      let errorMsg = 'Sorry, I encountered an error while planning your trip.';
      
      if (error instanceof Error) {
        errorMsg += ` ${error.message}`;
      }
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: errorMsg
      }]);
      
      setErrorMessage(errorMsg);
      setIsLoading(false);

      toast({
        title: 'Error',
        description: typeof error === "object" && error ? (error as Error).message : String(error),
        variant: 'destructive',
      });
      
      // Fall back to mock implementation for future requests
      setUseAI(false);
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

      {errorMessage && (
        <div className="flex justify-center bg-yellow-50 py-2 border-b border-yellow-300">
          <div className="flex flex-col items-center gap-2">
            <Alert variant="destructive" className="py-2 w-full max-w-md">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          </div>
        </div>
      )}
      
      {!useAI && (
        <div className="flex justify-center bg-amber-50 py-2 border-b border-amber-300">
          <div className="flex items-center gap-2">
            <Alert className="py-2 w-full max-w-md bg-amber-50 border-amber-200">
              <AlertTitle>Demo Mode Active</AlertTitle>
              <AlertDescription>
                Using demo responses instead of AI. Check your Gemini API key or quota.
              </AlertDescription>
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
