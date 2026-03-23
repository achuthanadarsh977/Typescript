export type TransactionType = 'income' | 'expense'

export type Category =
  | 'salary'
  | 'housing'
  | 'food'
  | 'utilities'
  | 'transport'
  | 'entertainment'
  | 'healthcare'
  | 'other'

export interface Transaction {
  id: string
  date: string
  description: string
  category: Category
  type: TransactionType
  amount: number
}
