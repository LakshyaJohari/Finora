export interface Transaction {
  id: string
  merchant: string
  category: string
  date: string
  amount: number
}

export const demoTransactions: Transaction[] = [
  { id: 't1', merchant: 'Blue Bottle Coffee', category: 'Food & Drink', date: '2026-07-05', amount: -6.5 },
  { id: 't2', merchant: 'Whole Foods Market', category: 'Groceries', date: '2026-07-04', amount: -84.12 },
  { id: 't3', merchant: 'Salary Deposit', category: 'Income', date: '2026-07-01', amount: 4200 },
  { id: 't4', merchant: 'Con Edison', category: 'Utilities', date: '2026-06-29', amount: -112.4 },
  { id: 't5', merchant: 'Spotify', category: 'Subscriptions', date: '2026-06-28', amount: -11.99 },
  { id: 't6', merchant: 'MTA Metrocard', category: 'Transport', date: '2026-06-27', amount: -33 },
  { id: 't7', merchant: 'Freelance Payment', category: 'Income', date: '2026-06-25', amount: 650 },
  { id: 't8', merchant: 'Trader Joe\'s', category: 'Groceries', date: '2026-06-24', amount: -58.3 },
]

export interface Goal {
  id: string
  name: string
  target: number
  saved: number
  targetDate: string
}

export const demoGoals: Goal[] = [
  { id: 'g1', name: 'Emergency fund', target: 15000, saved: 9750, targetDate: '2026-12-31' },
  { id: 'g2', name: 'Japan trip', target: 4000, saved: 1400, targetDate: '2027-03-01' },
  { id: 'g3', name: 'New laptop', target: 2200, saved: 2200, targetDate: '2026-08-15' },
]

export interface AdvisorMessage {
  id: string
  role: 'assistant' | 'user'
  content: string
}

export const demoAdvisorMessages: AdvisorMessage[] = [
  {
    id: 'a1',
    role: 'assistant',
    content:
      "Hi, I'm your Finora advisor. Based on your last 30 days, you're spending 18% less on dining out than last month — nice work. Want a suggestion for where to put those savings?",
  },
  {
    id: 'a2',
    role: 'user',
    content: 'Yeah, what would you suggest?',
  },
  {
    id: 'a3',
    role: 'assistant',
    content:
      "You're $5,250 away from your Emergency fund goal. Redirecting an extra $150/month from dining would get you there about 2 months sooner.",
  },
]

export const demoNetWorth = 42_380
export const demoSavingsRate = 0.27
export const demoMonthlySpend = 2140
