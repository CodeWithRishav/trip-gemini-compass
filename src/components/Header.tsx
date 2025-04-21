
import React from 'react';
import { cn } from '@/lib/utils';

type HeaderProps = {
  className?: string;
};

const Header: React.FC<HeaderProps> = ({ className }) => {
  return (
    <header className={cn("w-full py-4 px-6 border-b", className)}>
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="h-10 w-10 rounded-full travel-gradient flex items-center justify-center">
            <span className="text-white font-bold text-xl">✈</span>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Trip Gemini Compass</h1>
            <p className="text-xs text-muted-foreground">AI-powered travel planning</p>
          </div>
        </div>
        
        <nav className="hidden md:flex items-center space-x-6">
          <a href="#" className="text-sm font-medium hover:text-travel-primary transition-colors">Home</a>
          <a href="#" className="text-sm font-medium hover:text-travel-primary transition-colors">My Trips</a>
          <a href="#" className="text-sm font-medium hover:text-travel-primary transition-colors">About</a>
        </nav>
        
        <div className="flex items-center space-x-4">
          <button className="bg-travel-primary hover:bg-travel-primary/90 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
            Sign Up
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
