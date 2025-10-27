// FIX: Define interfaces for data structures used throughout the application.
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
}

export interface DietaryPlanRequest {
  age: string;
  gender: 'male' | 'female' | 'other' | '';
  height: string;
  weight: string;
  units: 'metric' | 'imperial';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' | '';
  goal: 'lose_weight' | 'maintain_weight' | 'gain_muscle' | '';
  dietaryRestrictions: string;
  usualFoods: string;
  eatingHabits: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    password?: string; // This is for the mock DB, won't be in app state
}
