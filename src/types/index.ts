export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
}

export const TRANSACTION_CATEGORIES = [
  'Food',
  'Transport',
  'Shopping',
  'Bills',
  'Entertainment',
  'Health',
  'Other',
  'Uncategorized',
] as const

export type TransactionCategory = (typeof TRANSACTION_CATEGORIES)[number]

export const INCOME_CATEGORIES = ['Salary', 'Investment', 'Freelance', 'Gift', 'Other Income'] as const

export type IncomeCategory = (typeof INCOME_CATEGORIES)[number]

export interface Transaction {
  id: string
  user_id: string
  amount: number
  currency: string
  category: string
  merchant: string | null
  description: string | null
  transaction_date: string
  is_recurring: boolean
  ai_category_reasoning: string | null
  created_at: string
}

export const GOAL_CATEGORIES = ['Emergency Fund', 'Travel', 'Home', 'Education', 'Retirement', 'Other'] as const

export type GoalCategory = (typeof GOAL_CATEGORIES)[number]

export interface Goal {
  id: string
  user_id: string
  name: string
  target_amount: number
  current_amount: number
  target_date: string | null
  category: string | null
  created_at: string
}

export type ChatRole = 'user' | 'assistant'

export interface ChatMessage {
  id: string
  user_id: string
  role: ChatRole
  content: string
  created_at: string
}
