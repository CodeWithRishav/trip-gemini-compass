
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';

type StatusBannersProps = {
  isDemoMode: boolean;
  errorMessage: string | null;
};

const StatusBanners: React.FC<StatusBannersProps> = ({ isDemoMode, errorMessage }) => {
  if (!isDemoMode && !errorMessage) return null;

  return (
    <>
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
    </>
  );
};

export default StatusBanners;
