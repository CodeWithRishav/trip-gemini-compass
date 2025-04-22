
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Trip, AIMessage, AIResponse } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { generateMockAIResponse } from '@/utils/trip-utils';

const AI_SYSTEM_PROMPT = "You are an expert travel planner. Given a user's prompt, extract destination, trip start date (use today's date unless specified), number of days (as integer), total budget (USD), then generate a detailed day-by-day itinerary with each day's activities in a structured way including: time, title, description, location (city), category (accommodation, attraction, food, transportation, other), and estimated cost (USD). Also, include an English summary. Respond only with a single valid JSON object in this exact format (do not add any extra commentary or text): {trip: Trip, summary: string}, where Trip matches this schema: { id: string, destination: string, startDate: string, endDate: string, budget: number, days: Array<{day: number, activities: Array<{id: string, time: string, title: string, description: string, location: string, cost: number, category: string}>}>, expenses: [], totalExpenses: number }.";

// This is the latest working Gemini API key
const GEMINI_API_KEY = "AIzaSyDWSJavzQNqSOoRooFxWKKNbeDjpz3Dtmw";

export const useGeminiAPI = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const generateTripPlan = async (message: string): Promise<{
    aiResponse: AIResponse | null;
    responseMessage: string;
    isDemoMode: boolean;
    error: string | null;
  }> => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Updated Gemini API endpoint with the correct version and format
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.0-pro:generateContent?key=${GEMINI_API_KEY}`, {
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
        console.error("Gemini API Error:", responseData);
        
        // Fallback to demo mode when API fails
        setIsDemoMode(true);
        const mockResponse = generateMockAIResponse(message);
        
        toast({
          title: 'Demo Mode Activated',
          description: 'Using mock data due to API issues. Your actual API key may be incorrect or the service may be experiencing issues.',
          variant: 'default',
        });
        
        setIsLoading(false);
        return {
          aiResponse: mockResponse,
          responseMessage: mockResponse.summary,
          isDemoMode: true,
          error: null
        };
      }

      const data = await response.json();
      const assistantContent = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      let jsonStr = "";

      // Extract JSON from the response
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
        let parsed = JSON.parse(jsonStr);
        
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

        setIsLoading(false);
        return {
          aiResponse: parsed,
          responseMessage: parsed.summary,
          isDemoMode: false,
          error: null
        };
      } catch (e) {
        throw new Error(`Failed to parse Gemini response: ${e instanceof Error ? e.message : String(e)}`);
      }
    } catch (error) {
      console.error('Error generating trip plan:', error);
      
      const errorMsg = `Sorry, I encountered an error while planning your trip. ${error instanceof Error ? error.message : String(error)}`;
      
      toast({
        title: 'Error',
        description: errorMsg,
        variant: 'destructive',
      });
      
      // Fallback to demo mode if there's an error
      setIsDemoMode(true);
      const mockResponse = generateMockAIResponse(message);
      
      toast({
        title: 'Demo Mode Activated',
        description: 'Using mock data due to API issues.',
      });
      
      setIsLoading(false);
      return {
        aiResponse: mockResponse,
        responseMessage: mockResponse.summary,
        isDemoMode: true,
        error: errorMsg
      };
    }
  };

  return {
    generateTripPlan,
    isLoading,
    errorMessage,
    isDemoMode,
    setIsDemoMode
  };
};
