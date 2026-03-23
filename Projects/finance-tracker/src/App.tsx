import { useState } from 'react'
import { Transaction, TransactionType, Category } from './types'
import { initialTransactions } from './data'
import Charts from './Charts'

const CATEGORIES: Category[] = ['salary', 'housing', 'food', 'utilities', 'transport', 'entertainment', 'healthcare', 'other']

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions)

  // Form state
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState<TransactionType>('expense')
  const [category, setCategory] = useState<Category>('food')

  // Tab state
  const [activeTab, setActiveTab] = useState<'transactions' | 'charts'>('transactions')

  // Filter state
  const [filterType, setFilterType] = useState<'all' | TransactionType>('all')
  const [filterCategory, setFilterCategory] = useState<'all' | Category>('all')

  // Summary calculations
  const income   = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const expenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const balance  = income - expenses

  // Filtered list
  const filtered = transactions.filter(t => {
    if (filterType !== 'all' && t.type !== filterType) return false
    if (filterCategory !== 'all' && t.category !== filterCategory) return false
    return true
  })

  const handleDelete = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id))
  }

  const handleAdd = () => {
    const num = parseFloat(amount)
    if (!description.trim() || isNaN(num) || num <= 0) return
    const newTx: Transaction = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      description: description.trim(),
      category,
      type,
      amount: num,
    }
    setTransactions(prev => [newTx, ...prev])
    setDescription('')
    setAmount('')
  }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '40px 20px' }}>

      {/* Header */}
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 6 }}>Finance Tracker</h1>
      <p style={{ color: '#666', marginBottom: 28 }}>Track your income and expenses</p>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
        <SummaryCard label="Income"   amount={income}   color="#16a34a" />
        <SummaryCard label="Expenses" amount={expenses} color="#dc2626" />
        <SummaryCard label="Balance"  amount={balance}  color="#111"    />
      </div>

      {/* Add Transaction */}
      <div style={{ border: '1px solid #ddd', borderRadius: 6, padding: '18px 20px', marginBottom: 28 }}>
        <p style={{ fontWeight: 600, marginBottom: 14 }}>Add Transaction</p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input
            style={inputStyle}
            placeholder="Description"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
          <input
            style={{ ...inputStyle, width: 120 }}
            placeholder="Amount"
            type="number"
            min={0}
            value={amount}
            onChange={e => setAmount(e.target.value)}
          />
          <select style={selectStyle} value={type} onChange={e => setType(e.target.value as TransactionType)}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
          <select style={selectStyle} value={category} onChange={e => setCategory(e.target.value as Category)}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button
            onClick={handleAdd}
            style={{
              background: '#111', color: '#fff', border: 'none', borderRadius: 4,
              padding: '8px 18px', cursor: 'pointer', fontWeight: 600, fontSize: 14,
            }}
          >
            Add
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid #e5e5e5' }}>
        {(['transactions', 'charts'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '8px 16px', fontSize: 14, fontWeight: 600,
              color: activeTab === tab ? '#111' : '#888',
              borderBottom: activeTab === tab ? '2px solid #111' : '2px solid transparent',
              marginBottom: -1, textTransform: 'capitalize',
            }}
          >
            {tab === 'transactions' ? 'Transactions' : 'Charts'}
          </button>
        ))}
      </div>

      {/* Charts View */}
      {activeTab === 'charts' && <Charts transactions={transactions} />}

      {/* Transactions View */}
      {activeTab === 'transactions' && <>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <select style={filterSelectStyle} value={filterType} onChange={e => setFilterType(e.target.value as typeof filterType)}>
          <option value="all">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <select style={filterSelectStyle} value={filterCategory} onChange={e => setFilterCategory(e.target.value as typeof filterCategory)}>
          <option value="all">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #e5e5e5' }}>
            {['DATE', 'DESCRIPTION', 'CATEGORY', 'AMOUNT', ''].map(h => (
              <th key={h} style={{ textAlign: h === 'AMOUNT' ? 'right' : 'left', padding: '10px 12px', fontSize: 12, color: '#888', fontWeight: 600, letterSpacing: '0.05em' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={4} style={{ textAlign: 'center', padding: 32, color: '#aaa' }}>No transactions found</td>
            </tr>
          ) : filtered.map(tx => (
            <tr key={tx.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
              <td style={cellStyle}>{tx.date}</td>
              <td style={cellStyle}>{tx.description}</td>
              <td style={cellStyle}>{tx.category}</td>
              <td style={{ ...cellStyle, textAlign: 'right', fontWeight: 600, color: tx.type === 'income' ? '#16a34a' : '#dc2626' }}>
                {tx.type === 'income' ? '+' : '-'}${tx.amount.toLocaleString()}
              </td>
              <td style={{ ...cellStyle, textAlign: 'center', width: 40 }}>
                <button
                  onClick={() => handleDelete(tx.id)}
                  title="Delete"
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#bbb', fontSize: 16, lineHeight: 1, padding: '2px 4px',
                    borderRadius: 3,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#dc2626')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#bbb')}
                >
                  ×
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </>}
    </div>
  )
}

function SummaryCard({ label, amount, color }: { label: string; amount: number; color: string }) {
  return (
    <div style={{ border: '1px solid #ddd', borderRadius: 6, padding: '16px 20px' }}>
      <p style={{ color: '#666', fontSize: 13, marginBottom: 6 }}>{label}</p>
      <p style={{ fontSize: 26, fontWeight: 700, color }}>${amount.toLocaleString()}</p>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  flex: 1, minWidth: 140, border: '1px solid #ddd', borderRadius: 4,
  padding: '8px 10px', fontSize: 14, outline: 'none',
}

const selectStyle: React.CSSProperties = {
  border: '1px solid #ddd', borderRadius: 4, padding: '8px 10px',
  fontSize: 14, background: '#fff', cursor: 'pointer', outline: 'none',
}

const filterSelectStyle: React.CSSProperties = {
  border: '1px solid #ddd', borderRadius: 4, padding: '6px 10px',
  fontSize: 13, background: '#fff', cursor: 'pointer', outline: 'none',
}

const cellStyle: React.CSSProperties = {
  padding: '12px 12px', color: '#333', fontSize: 14,
}
