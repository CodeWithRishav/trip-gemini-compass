
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';

type AddExpenseProps = {
  onAddExpense: (expense: {
    id: string;
    amount: number;
    description: string;
    category: string;
    date: string;
  }) => void;
};

const expenseCategories = [
  "Accommodation",
  "Food",
  "Transportation",
  "Activities",
  "Shopping",
  "Other"
];

const AddExpense: React.FC<AddExpenseProps> = ({ onAddExpense }) => {
  const { toast } = useToast();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(expenseCategories[0]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !description) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid positive number",
        variant: "destructive",
      });
      return;
    }
    
    onAddExpense({
      id: uuidv4(),
      amount: parsedAmount,
      description,
      category,
      date: new Date().toISOString(),
    });
    
    // Reset form
    setAmount('');
    setDescription('');
    
    toast({
      title: "Expense added",
      description: `$${parsedAmount} added to your trip`,
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Add Expense</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="e.g., Dinner at restaurant"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {expenseCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full bg-travel-primary hover:bg-travel-primary/90"
          >
            Add Expense
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default AddExpense;
