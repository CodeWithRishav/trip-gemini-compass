
export type TripDay = {
  day: number;
  activities: Activity[];
};

export type Activity = {
  id: string;
  time: string;
  title: string;
  description: string;
  location: string;
  cost?: number;
  category: "accommodation" | "attraction" | "food" | "transportation" | "other";
};

export type Expense = {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
};

export type Trip = {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  days: TripDay[];
  expenses: Expense[];
  totalExpenses: number;
};

export type AIResponse = {
  trip: Trip;
  summary: string;
};

export type AIMessage = {
  role: "user" | "assistant";
  content: string;
};
