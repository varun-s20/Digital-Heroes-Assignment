export type Role = 'visitor' | 'subscriber' | 'admin';
export type SubscriptionStatus = 'active' | 'lapsed' | 'none';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  subscriptionStatus: SubscriptionStatus;
  plan?: 'monthly' | 'yearly';
  joinDate: string;
  charityId?: string;
  charityContributionPercent?: number;
  avatarUrl?: string;
}

export interface ScoreEntry {
  id: string;
  userId: string;
  score: number; // 1-45
  date: string;
}

export interface CharityEvent {
  title: string;
  date: string;
}

export interface Charity {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  category: string;
  totalRaised: number;
  subscriberCount: number;
  upcomingEvents: CharityEvent[];
  status: 'active' | 'inactive';
}

export interface DrawTierResult {
  matchCount: number; // e.g. 5, 4, 3
  winners: number;
  prizePerWinner: number;
}

export interface Draw {
  id: string;
  date: string;
  numbersDrawn?: number[]; // Array of 5 numbers for completed draws
  status: 'upcoming' | 'completed' | 'simulated';
  tiers?: DrawTierResult[];
  estimatedPrizePool?: number; // For upcoming
  activeSubscriberCount?: number;
}

export interface WinnerVerification {
  id: string;
  userId: string;
  userName?: string; // Denormalized for easy display
  drawId: string;
  drawDate?: string; // Denormalized
  tierMatched: number;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  submissionDate: string;
  proofUrl?: string;
}
