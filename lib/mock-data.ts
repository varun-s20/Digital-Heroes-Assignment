import { User, ScoreEntry, Charity, Draw, WinnerVerification } from "./types";

export const mockUsers: User[] = [
  {
    id: "user_1",
    name: "Alex Thompson",
    email: "alex@example.com",
    role: "subscriber",
    subscriptionStatus: "active",
    plan: "monthly",
    joinDate: "2023-11-15T00:00:00Z",
    charityId: "charity_1",
    charityContributionPercent: 20,
    avatarUrl: "https://i.pravatar.cc/150?u=user_1",
  },
  {
    id: "user_2",
    name: "Sarah Jenkins",
    email: "sarah@example.com",
    role: "subscriber",
    subscriptionStatus: "lapsed",
    plan: "monthly",
    joinDate: "2023-06-10T00:00:00Z",
    charityId: "charity_3",
    charityContributionPercent: 10,
    avatarUrl: "https://i.pravatar.cc/150?u=user_2",
  },
  {
    id: "user_3",
    name: "Admin User",
    email: "admin@charitygolf.com",
    role: "admin",
    subscriptionStatus: "none",
    joinDate: "2023-01-01T00:00:00Z",
  },
];

export const mockScores: ScoreEntry[] = [
  { id: "score_5", userId: "user_1", score: 38, date: "2024-03-10T14:30:00Z" },
  { id: "score_4", userId: "user_1", score: 41, date: "2024-03-02T10:15:00Z" },
  { id: "score_3", userId: "user_1", score: 35, date: "2024-02-18T09:00:00Z" },
  { id: "score_2", userId: "user_1", score: 42, date: "2024-02-05T11:45:00Z" },
  { id: "score_1", userId: "user_1", score: 36, date: "2024-01-20T13:20:00Z" },
];

export const mockCharities: Charity[] = [
  {
    id: "charity_1",
    name: "Ocean Cleanup Initiative",
    slug: "ocean-cleanup",
    description: "Removing plastic waste from our oceans to protect marine life and restore ecosystems. Every contribution funds direct action and long-term conservation strategies.",
    imageUrl: "https://picsum.photos/seed/ocean/800/600",
    category: "Environment",
    totalRaised: 45200,
    subscriberCount: 215,
    status: "active",
    upcomingEvents: [
      { title: "Coastal Beach Clean", date: "2024-04-15T00:00:00Z" },
      { title: "Marine Biology Webinar", date: "2024-05-02T00:00:00Z" },
    ],
  },
  {
    id: "charity_2",
    name: "Youth Mental Health Trust",
    slug: "youth-mental-health",
    description: "Providing free counseling and support services for young people experiencing mental health crises. We believe no young person should face their struggles alone.",
    imageUrl: "https://picsum.photos/seed/youth/800/600",
    category: "Health",
    totalRaised: 89500,
    subscriberCount: 430,
    status: "active",
    upcomingEvents: [
      { title: "Mindfulness Workshop", date: "2024-04-20T00:00:00Z" },
    ],
  },
  {
    id: "charity_3",
    name: "Local Food Bank Network",
    slug: "local-food-bank",
    description: "Fighting food poverty by redistributing surplus food to those in need. Your support helps us keep the shelves stocked and families fed.",
    imageUrl: "https://picsum.photos/seed/food/800/600",
    category: "Community",
    totalRaised: 112400,
    subscriberCount: 512,
    status: "active",
    upcomingEvents: [
      { title: "Spring Food Drive", date: "2024-04-10T00:00:00Z" },
      { title: "Volunteer Open Day", date: "2024-05-15T00:00:00Z" },
    ],
  },
  {
    id: "charity_4",
    name: "Junior Golf Foundation",
    slug: "junior-golf",
    description: "Making golf accessible to children from disadvantaged backgrounds. We provide equipment, coaching, and a safe environment to learn life skills.",
    imageUrl: "https://picsum.photos/seed/golf/800/600",
    category: "Sport",
    totalRaised: 32100,
    subscriberCount: 145,
    status: "active",
    upcomingEvents: [],
  },
  {
    id: "charity_5",
    name: "Wildlife Rescue Center",
    slug: "wildlife-rescue",
    description: "Rehabilitating injured wildlife and returning them to their natural habitats. We operate a 24/7 emergency clinic for native species.",
    imageUrl: "https://picsum.photos/seed/wildlife/800/600",
    category: "Environment",
    totalRaised: 67800,
    subscriberCount: 320,
    status: "active",
    upcomingEvents: [
      { title: "Open Day & Tours", date: "2024-06-01T00:00:00Z" },
    ],
  },
  {
    id: "charity_6",
    name: "Cancer Research Partners",
    slug: "cancer-research",
    description: "Funding breakthrough research to find new treatments and ultimately a cure for all types of cancer. Fast-tracking discoveries from the lab to the clinic.",
    imageUrl: "https://picsum.photos/seed/cancer/800/600",
    category: "Health",
    totalRaised: 254000,
    subscriberCount: 890,
    status: "active",
    upcomingEvents: [
      { title: "Charity Run 5K", date: "2024-05-10T00:00:00Z" },
    ],
  },
];

export const mockDraws: Draw[] = [
  {
    id: "draw_upcoming",
    date: "2024-04-01T20:00:00Z",
    status: "upcoming",
    activeSubscriberCount: 500,
    estimatedPrizePool: 4995, // 500 * ₹9.99
    tiers: [
      { matchCount: 5, winners: 0, prizePerWinner: 1998 }, // 40%
      { matchCount: 4, winners: 0, prizePerWinner: 1748 }, // 35%
      { matchCount: 3, winners: 0, prizePerWinner: 1248 }, // 25%
    ]
  },
  {
    id: "draw_3",
    date: "2024-03-01T20:00:00Z",
    status: "completed",
    numbersDrawn: [41, 35, 12, 28, 9],
    tiers: [
      { matchCount: 5, winners: 0, prizePerWinner: 0 }, // Rollover
      { matchCount: 4, winners: 2, prizePerWinner: 850 },
      { matchCount: 3, winners: 45, prizePerWinner: 25 },
    ]
  },
  {
    id: "draw_2",
    date: "2024-02-01T20:00:00Z",
    status: "completed",
    numbersDrawn: [38, 22, 14, 5, 42],
    tiers: [
      { matchCount: 5, winners: 1, prizePerWinner: 3800 }, // Won!
      { matchCount: 4, winners: 4, prizePerWinner: 410 },
      { matchCount: 3, winners: 38, prizePerWinner: 28 },
    ]
  },
  {
    id: "draw_1",
    date: "2024-01-01T20:00:00Z",
    status: "completed",
    numbersDrawn: [36, 18, 7, 31, 25],
    tiers: [
      { matchCount: 5, winners: 0, prizePerWinner: 0 },
      { matchCount: 4, winners: 1, prizePerWinner: 1550 },
      { matchCount: 3, winners: 52, prizePerWinner: 20 },
    ]
  },
];

export const mockVerifications: WinnerVerification[] = [
  {
    id: "verif_1",
    userId: "user_12",
    userName: "David Smith",
    drawId: "draw_3",
    drawDate: "2024-03-01T20:00:00Z",
    tierMatched: 4,
    amount: 850,
    status: "pending",
    submissionDate: "2024-03-02T10:15:00Z",
    proofUrl: "https://example.com/proof1.jpg"
  },
  {
    id: "verif_2",
    userId: "user_45",
    userName: "Emma Jones",
    drawId: "draw_3",
    drawDate: "2024-03-01T20:00:00Z",
    tierMatched: 4,
    amount: 850,
    status: "approved",
    submissionDate: "2024-03-02T11:20:00Z",
    proofUrl: "https://example.com/proof2.jpg"
  },
  {
    id: "verif_3",
    userId: "user_8",
    userName: "Michael Brown",
    drawId: "draw_2",
    drawDate: "2024-02-01T20:00:00Z",
    tierMatched: 5,
    amount: 3800,
    status: "paid",
    submissionDate: "2024-02-02T09:00:00Z",
    proofUrl: "https://example.com/proof3.jpg"
  },
];
