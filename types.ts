
export interface UserProfile {
  id: string;
  name: string;
}

export interface TripSettings {
  startDate: string;
  endDate: string;
  currency: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: 'food' | 'shopping' | 'transport' | 'other';
  dayId: number;
  date?: string;
  timestamp: number;
  paidBy: string;
  involvedUsers: string[];
  individualAmounts?: Record<string, number>;
  splitType: 'split' | 'self' | 'individual';
  isSettled: boolean;
}

export type ActivityCategory = 'food' | 'shopping' | 'transport' | 'sightseeing' | 'relax' | 'other';

export interface SmartTag {
  label: string;
  type: 'tip' | 'nav' | 'must-eat' | 'must-buy' | 'reservation';
}

export interface Activity {
  time: string;
  title: string;
  description: string;
  location?: string;
  category: ActivityCategory;
  tags?: SmartTag[];
}

export interface DayPlan {
  id: number;
  dateLabel: string;
  title: string;
  subtitle: string;
  image: string;
  imgPos?: string;
  activities: Activity[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  sources?: { uri: string; title: string }[];
  isError?: boolean;
}