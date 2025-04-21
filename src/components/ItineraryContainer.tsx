
import React from 'react';
import { Trip } from '@/types';
import ItineraryDay from './ItineraryDay';
import { addDaysToDate } from '@/utils/trip-utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

type ItineraryContainerProps = {
  trip: Trip | null;
};

const ItineraryContainer: React.FC<ItineraryContainerProps> = ({ trip }) => {
  if (!trip) {
    return (
      <div className="h-full flex items-center justify-center p-6 border rounded-lg bg-card">
        <p className="text-muted-foreground">No itinerary generated yet. Describe your trip to get started!</p>
      </div>
    );
  }

  // Calculate expense progress
  const expensePercentage = Math.min((trip.totalExpenses / trip.budget) * 100, 100);

  return (
    <div className="space-y-4 h-full overflow-y-auto">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-bold travel-gradient bg-clip-text text-transparent">
            {trip.destination} Trip
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">Duration</p>
              <p className="text-sm">{trip.days.length} days</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Dates</p>
              <p className="text-sm">
                {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Budget</p>
              <p className="text-sm">${trip.budget}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Expenses: ${trip.totalExpenses}</span>
              <span className={expensePercentage >= 90 ? "text-destructive" : ""}>
                ${trip.budget - trip.totalExpenses} remaining
              </span>
            </div>
            <Progress value={expensePercentage} className="h-2" />
          </div>
        </CardContent>
      </Card>
      
      {trip.days.map((day, index) => (
        <ItineraryDay 
          key={day.day} 
          day={day}
          date={addDaysToDate(trip.startDate, index)}
        />
      ))}
    </div>
  );
};

export default ItineraryContainer;
