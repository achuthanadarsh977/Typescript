import { Transaction } from './types'

export const initialTransactions: Transaction[] = [
  { id: '1', date: '2025-01-01', description: 'Salary',        category: 'salary',        type: 'income',  amount: 5000 },
  { id: '2', date: '2025-01-02', description: 'Rent',          category: 'housing',       type: 'expense', amount: 1200 },
  { id: '3', date: '2025-01-03', description: 'Groceries',     category: 'food',          type: 'expense', amount: 150  },
  { id: '4', date: '2025-01-05', description: 'Freelance Work',category: 'salary',        type: 'expense', amount: 800  },
  { id: '5', date: '2025-01-06', description: 'Electric Bill', category: 'utilities',     type: 'expense', amount: 95   },
  { id: '6', date: '2025-01-07', description: 'Dinner Out',    category: 'food',          type: 'expense', amount: 65   },
  { id: '7', date: '2025-01-08', description: 'Gas',           category: 'transport',     type: 'expense', amount: 45   },
  { id: '8', date: '2025-01-10', description: 'Netflix',       category: 'entertainment', type: 'expense', amount: 15   },
]
