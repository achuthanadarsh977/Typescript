import { useMemo } from 'react'
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title,
} from 'chart.js'
import { Pie, Bar } from 'react-chartjs-2'
import { Transaction } from './types'

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title)

const COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
  '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16',
]

interface Props {
  transactions: Transaction[]
}

export default function Charts({ transactions }: Props) {
  // Aggregate by category
  const categoryMap = useMemo(() => {
    const map: Record<string, number> = {}
    transactions.forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.amount
    })
    return map
  }, [transactions])

  const catLabels = Object.keys(categoryMap)
  const catValues = Object.values(categoryMap)

  // Pie chart data
  const pieData = {
    labels: catLabels,
    datasets: [{
      data: catValues,
      backgroundColor: COLORS.slice(0, catLabels.length),
      borderColor: '#fff',
      borderWidth: 2,
    }],
  }

  // Bar chart — amount by category
  const barData = {
    labels: catLabels,
    datasets: [{
      label: 'Amount ($)',
      data: catValues,
      backgroundColor: COLORS.slice(0, catLabels.length),
      borderRadius: 6,
    }],
  }

  // Timeline bar — each transaction
  const timelineData = {
    labels: transactions.map(t => t.description),
    datasets: [{
      label: 'Amount ($)',
      data: transactions.map(t => t.amount),
      backgroundColor: transactions.map(t => t.type === 'income' ? '#16a34a' : '#ef4444'),
      borderRadius: 5,
    }],
  }

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx: { parsed: { y: number } }) => ` $${ctx.parsed.y.toLocaleString()}` } },
    },
    scales: {
      x: { grid: { display: false } },
      y: {
        beginAtZero: true,
        ticks: { callback: (v: string | number) => '$' + Number(v).toLocaleString() },
      },
    },
  }

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' as const },
      tooltip: {
        callbacks: {
          label: (ctx: { label: string; parsed: number }) => {
            const total = catValues.reduce((a, b) => a + b, 0)
            return ` ${ctx.label}: $${ctx.parsed.toLocaleString()} (${((ctx.parsed / total) * 100).toFixed(1)}%)`
          },
        },
      },
    },
  }

  if (transactions.length === 0) {
    return <p style={{ color: '#aaa', textAlign: 'center', padding: 40 }}>No transactions to chart.</p>
  }

  return (
    <div>
      {/* Pie + Category Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        <div style={cardStyle}>
          <p style={cardTitle}>Expenses by Category</p>
          <Pie data={pieData} options={pieOptions} />
        </div>
        <div style={cardStyle}>
          <p style={cardTitle}>Amount by Category</p>
          <Bar data={barData} options={barOptions} />
        </div>
      </div>

      {/* Timeline */}
      <div style={cardStyle}>
        <p style={cardTitle}>Transaction Amounts — <span style={{ color: '#16a34a' }}>■</span> Income &nbsp; <span style={{ color: '#ef4444' }}>■</span> Expense</p>
        <Bar data={timelineData} options={{ ...barOptions, plugins: { ...barOptions.plugins, legend: { display: false } } }} />
      </div>
    </div>
  )
}

const cardStyle: React.CSSProperties = {
  border: '1px solid #ddd', borderRadius: 8, padding: '20px 20px 16px',
  background: '#fff',
}

const cardTitle: React.CSSProperties = {
  fontWeight: 600, fontSize: 14, marginBottom: 16, color: '#333',
}
