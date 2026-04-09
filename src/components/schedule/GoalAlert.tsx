'use client'
import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Target, X } from 'lucide-react'
import { useStore } from '@/store'
import { getMonthPeriod, getWeekPeriod } from '@/lib/utils'

export default function GoalAlert() {
  const { goals, addGoal } = useStore()
  const [show, setShow] = useState(false)
  const [type, setType] = useState<'monthly' | 'weekly'>('monthly')
  const [newTitle, setNewTitle] = useState('')
  const [dismissed, setDismissed] = useState(false)

  const monthPeriod = getMonthPeriod()
  const weekPeriod = getWeekPeriod()

  const hasMonthGoal = goals.some(g => g.type === 'monthly' && g.period === monthPeriod)
  const hasWeekGoal = goals.some(g => g.type === 'weekly' && g.period === weekPeriod)

  const needsAlert = (!hasMonthGoal || !hasWeekGoal) && !dismissed

  useEffect(() => {
    if (needsAlert) {
      // Delay slightly to not be jarring on mount
      const t = setTimeout(() => setShow(true), 1000)
      return () => clearTimeout(t)
    }
  }, [needsAlert])

  if (!show || !needsAlert) return null

  const missing = !hasMonthGoal ? 'monthly' : 'weekly'
  const label = missing === 'monthly' ? '月次' : '週次'

  const handleAdd = () => {
    if (!newTitle.trim()) return
    const period = missing === 'monthly' ? monthPeriod : weekPeriod
    addGoal(missing, period, newTitle.trim())
    setShow(false)
    setDismissed(true)
  }

  return (
    <div className="mx-3 my-1.5 rounded-xl bg-amber-950/40 border border-amber-800/40 px-3 py-2.5 animate-slide-down flex items-start gap-3">
      <Target size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-amber-300 mb-1.5">
          {label}目標を設定しましょう 🎯
        </p>
        <div className="flex gap-2">
          <input
            className="input-base text-xs py-1.5 flex-1"
            placeholder={`${label}目標を入力`}
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
          />
          <button
            onClick={handleAdd}
            disabled={!newTitle.trim()}
            className="btn-primary text-xs py-1.5 px-3 disabled:opacity-40"
          >
            設定
          </button>
        </div>
      </div>
      <button
        onClick={() => { setShow(false); setDismissed(true) }}
        className="text-slate-600 hover:text-slate-400 transition-colors flex-shrink-0"
      >
        <X size={14} />
      </button>
    </div>
  )
}
