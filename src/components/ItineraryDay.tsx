
import React from 'react';
import { TripDay } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/utils/trip-utils';
import { Activity } from '@/types';
import { cn } from '@/lib/utils';

type ItineraryDayProps = {
  day: TripDay;
  date: string;
  onUpdateActivity?: (updatedActivity: Activity) => void;
};

const ItineraryDay: React.FC<ItineraryDayProps> = ({ day, date, onUpdateActivity }) => {
  // Group activities by category
  const getActivityIcon = (category: string) => {
    switch (category) {
      case 'accommodation':
        return '🏨';
      case 'attraction':
        return '🏛️';
      case 'food':
        return '🍽️';
      case 'transportation':
        return '🚕';
      default:
        return '📌';
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">
          Day {day.day} - {formatDate(date)}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {day.activities.map((activity) => (
            <div 
              key={activity.id}
              className="flex p-3 rounded-md bg-background border"
            >
              <div className="flex-shrink-0 w-12 flex flex-col items-center">
                <span className="text-lg">{getActivityIcon(activity.category)}</span>
                <span className="text-xs text-muted-foreground mt-1">{activity.time}</span>
              </div>
              
              <div className="ml-3 flex-grow">
                <h4 className="font-medium text-sm">{activity.title}</h4>
                <p className="text-xs text-muted-foreground">{activity.description}</p>
                {activity.cost !== undefined && activity.cost > 0 && (
                  <p className="text-xs font-medium mt-1 text-travel-primary">${activity.cost}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ItineraryDay;
