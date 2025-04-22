
import React from 'react';
import Header from '@/components/Header';

type MainLayoutProps = {
  children: React.ReactNode;
};

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-background hero-pattern">
      <Header />
      {children}
      <footer className="mt-auto py-4 text-center text-sm text-muted-foreground">
        <p>Trip Gemini Compass • AI-powered travel planner</p>
      </footer>
    </div>
  );
};

export default MainLayout;
