
import { v4 as uuidv4 } from 'uuid';
import { Activity, AIResponse, Trip, TripDay } from '@/types';

export const calculateDurationInDays = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include the start day
};

export const formatDate = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

export const addDaysToDate = (dateString: string, days: number): string => {
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

export const generateMockAIResponse = (prompt: string): AIResponse => {
  // In a real application, this would call the Gemini API
  // For now, we'll generate mock data based on the prompt
  
  const destinations = {
    london: {
      activities: [
        { title: "British Museum", category: "attraction", cost: 0 },
        { title: "Tower of London", category: "attraction", cost: 30 },
        { title: "London Eye", category: "attraction", cost: 25 },
        { title: "Buckingham Palace", category: "attraction", cost: 30 },
        { title: "St. Paul's Cathedral", category: "attraction", cost: 20 },
        { title: "Covent Garden", category: "attraction", cost: 0 },
        { title: "Camden Market", category: "attraction", cost: 0 },
        { title: "The Shard", category: "attraction", cost: 30 },
        { title: "Dishoom", category: "food", cost: 25 },
        { title: "Flat Iron", category: "food", cost: 20 },
        { title: "Afternoon Tea at Fortnum & Mason", category: "food", cost: 50 },
        { title: "Borough Market", category: "food", cost: 15 },
        { title: "The Ritz", category: "accommodation", cost: 300 },
        { title: "Premier Inn", category: "accommodation", cost: 100 },
        { title: "Tube Day Pass", category: "transportation", cost: 15 },
      ]
    },
    paris: {
      activities: [
        { title: "Eiffel Tower", category: "attraction", cost: 25 },
        { title: "Louvre Museum", category: "attraction", cost: 20 },
        { title: "Notre-Dame Cathedral", category: "attraction", cost: 0 },
        { title: "Arc de Triomphe", category: "attraction", cost: 12 },
        { title: "Montmartre", category: "attraction", cost: 0 },
        { title: "Seine River Cruise", category: "attraction", cost: 15 },
        { title: "Café de Flore", category: "food", cost: 20 },
        { title: "Le Jules Verne", category: "food", cost: 150 },
        { title: "Croissant at Local Bakery", category: "food", cost: 3 },
        { title: "Hotel Plaza Athénée", category: "accommodation", cost: 500 },
        { title: "Ibis Budget Hotel", category: "accommodation", cost: 80 },
        { title: "Metro Day Pass", category: "transportation", cost: 12 },
      ]
    },
    tokyo: {
      activities: [
        { title: "Tokyo Skytree", category: "attraction", cost: 20 },
        { title: "Senso-ji Temple", category: "attraction", cost: 0 },
        { title: "Meiji Shrine", category: "attraction", cost: 0 },
        { title: "Shibuya Crossing", category: "attraction", cost: 0 },
        { title: "Shinjuku Gyoen", category: "attraction", cost: 5 },
        { title: "Tokyo Disneyland", category: "attraction", cost: 75 },
        { title: "Sushi at Tsukiji Market", category: "food", cost: 30 },
        { title: "Ramen at Ichiran", category: "food", cost: 15 },
        { title: "Robot Restaurant Show", category: "food", cost: 80 },
        { title: "Park Hyatt Tokyo", category: "accommodation", cost: 350 },
        { title: "APA Hotel", category: "accommodation", cost: 70 },
        { title: "Tokyo Metro Day Pass", category: "transportation", cost: 10 },
      ]
    },
    "new york": {
      activities: [
        { title: "Statue of Liberty", category: "attraction", cost: 20 },
        { title: "Empire State Building", category: "attraction", cost: 45 },
        { title: "Central Park", category: "attraction", cost: 0 },
        { title: "Metropolitan Museum of Art", category: "attraction", cost: 25 },
        { title: "Broadway Show", category: "attraction", cost: 100 },
        { title: "Times Square", category: "attraction", cost: 0 },
        { title: "Katz's Delicatessen", category: "food", cost: 20 },
        { title: "Shake Shack", category: "food", cost: 15 },
        { title: "The Plaza Hotel", category: "accommodation", cost: 400 },
        { title: "Pod 51 Hotel", category: "accommodation", cost: 120 },
        { title: "Subway Day Pass", category: "transportation", cost: 10 },
      ]
    }
  };

  // Parse the prompt to extract destination and duration
  let destination = "london"; // Default
  let days = 3; // Default
  let budget = 1000; // Default
  
  const lowerPrompt = prompt.toLowerCase();
  
  // Check for destinations
  Object.keys(destinations).forEach(dest => {
    if (lowerPrompt.includes(dest.toLowerCase())) {
      destination = dest;
    }
  });
  
  // Check for duration
  const durationMatch = lowerPrompt.match(/(\d+)\s*(day|days)/);
  if (durationMatch) {
    days = parseInt(durationMatch[1]);
  }
  
  // Check for budget
  const budgetMatch = lowerPrompt.match(/\$(\d+)/);
  if (budgetMatch) {
    budget = parseInt(budgetMatch[1]);
  }
  
  // Generate trip days
  const startDate = new Date().toISOString().split('T')[0];
  const endDate = addDaysToDate(startDate, days - 1);
  
  // Select destination activities
  const destinationActivities = destinations[destination as keyof typeof destinations]?.activities || destinations.london.activities;
  
  // Create trip days
  const tripDays: TripDay[] = [];
  
  // Pick a hotel for the entire stay
  const hotels = destinationActivities.filter(a => a.category === "accommodation")
    .sort(() => 0.5 - Math.random());
  
  const hotel = hotels[0];
  
  for (let i = 0; i < days; i++) {
    const dayActivities: Activity[] = [];
    
    // Add hotel as first activity
    dayActivities.push({
      id: uuidv4(),
      time: "08:00 AM",
      title: hotel.title,
      description: `Your accommodation for day ${i + 1}`,
      location: destination,
      cost: hotel.cost,
      category: "accommodation"
    });
    
    // Add 2-3 attractions
    const attractions = destinationActivities
      .filter(a => a.category === "attraction")
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
    
    // Add 2-3 meals
    const meals = destinationActivities
      .filter(a => a.category === "food")
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
    
    // Add transportation
    const transportation = destinationActivities
      .filter(a => a.category === "transportation")
      .sort(() => 0.5 - Math.random())[0];
    
    // Schedule morning activity
    dayActivities.push({
      id: uuidv4(),
      time: "10:00 AM",
      title: attractions[0].title,
      description: `Visit ${attractions[0].title}`,
      location: destination,
      cost: attractions[0].cost,
      category: "attraction"
    });
    
    // Schedule lunch
    dayActivities.push({
      id: uuidv4(),
      time: "12:30 PM",
      title: meals[0].title,
      description: `Lunch at ${meals[0].title}`,
      location: destination,
      cost: meals[0].cost,
      category: "food"
    });
    
    // Schedule afternoon activity
    dayActivities.push({
      id: uuidv4(),
      time: "02:00 PM",
      title: attractions[1].title,
      description: `Visit ${attractions[1].title}`,
      location: destination,
      cost: attractions[1].cost,
      category: "attraction"
    });
    
    // Schedule evening activity
    if (attractions[2]) {
      dayActivities.push({
        id: uuidv4(),
        time: "04:30 PM",
        title: attractions[2].title,
        description: `Visit ${attractions[2].title}`,
        location: destination,
        cost: attractions[2].cost,
        category: "attraction"
      });
    }
    
    // Schedule dinner
    dayActivities.push({
      id: uuidv4(),
      time: "07:00 PM",
      title: meals[1].title,
      description: `Dinner at ${meals[1].title}`,
      location: destination,
      cost: meals[1].cost,
      category: "food"
    });
    
    // Add transportation for the day
    dayActivities.push({
      id: uuidv4(),
      time: "All day",
      title: transportation.title,
      description: `Transportation for day ${i + 1}`,
      location: destination,
      cost: transportation.cost,
      category: "transportation"
    });
    
    tripDays.push({
      day: i + 1,
      activities: dayActivities
    });
  }
  
  // Calculate total trip cost
  let totalCost = 0;
  tripDays.forEach(day => {
    day.activities.forEach(activity => {
      totalCost += activity.cost || 0;
    });
  });
  
  // Create trip object
  const trip: Trip = {
    id: uuidv4(),
    destination: destination.charAt(0).toUpperCase() + destination.slice(1),
    startDate,
    endDate,
    budget,
    days: tripDays,
    expenses: [],
    totalExpenses: 0
  };
  
  // Create summary based on destination and duration
  const summary = `Here's your ${days}-day trip to ${trip.destination} with a budget of $${budget}. I've included various attractions, restaurants, and transportation options. The estimated total cost is $${totalCost}. You can view and edit the detailed itinerary below.`;
  
  return {
    trip,
    summary
  };
};
