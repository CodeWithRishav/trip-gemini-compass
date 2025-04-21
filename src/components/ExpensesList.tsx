
import React from 'react';
import { Expense } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

type ExpensesListProps = {
  expenses: Expense[];
  onDeleteExpense?: (id: string) => void;
};

const ExpensesList: React.FC<ExpensesListProps> = ({ expenses, onDeleteExpense }) => {
  if (expenses.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg">Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No expenses added yet</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">Expenses</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px] pr-4">
          <div className="space-y-2">
            {expenses.map((expense) => (
              <div 
                key={expense.id} 
                className="flex justify-between items-center p-3 rounded-md bg-background border"
              >
                <div>
                  <p className="font-medium text-sm">{expense.description}</p>
                  <p className="text-xs text-muted-foreground">{expense.category} • {new Date(expense.date).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-medium">${expense.amount.toFixed(2)}</span>
                  {onDeleteExpense && (
                    <button 
                      onClick={() => onDeleteExpense(expense.id)}
                      className="ml-2 text-red-500 text-xs hover:text-red-700"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ExpensesList;
