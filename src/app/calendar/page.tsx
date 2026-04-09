'use client'
import { useState } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, parseISO, isSameMonth, isToday } from 'date-fns'
import { ja } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Trophy } from 'lucide-react'
import { useStore } from '@/store'
import { DAY_RATING_EMOJIS, DayRating } from '@/types'
import { daysUntilExam, getMonthPeriod, getWeekPeriod } from '@/lib/utils'
import BottomNav from '@/components/ui/BottomNav'

export default function CalendarPage() {
  const { dayRecords, settings, goals } = useStore()
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // 先頭の空白（日曜始まり）
  const startDow = monthStart.getDay()

  const getRecord = (dateStr: string) => dayRecords.find(r => r.date === dateStr)

  const monthGoals = goals.filter(g => g.type === 'monthly' && g.period === getMonthPeriod(currentMonth))
  const weekGoals = goals.filter(g => g.type === 'weekly' && g.period === getWeekPeriod(currentMonth))

  const prevMonth = () => setCurrentMonth(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))
  const nextMonth = () => setCurrentMonth(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))

  const upcomingExams = settings.examDates
    .map(e => ({ ...e, daysLeft: daysUntilExam(e.date) }))
    .filter(e => e.daysLeft >= 0)
    .sort((a, b) => a.daysLeft - b.daysLeft)

  return (
    <div className="flex flex-col h-screen bg-slate-950">
      {/* Header */}
      <header className="glass border-b border-slate-800/50 px-4 pt-safe-top pb-3 flex-shrink-0">
        <h1 className="font-display font-bold text-lg gradient-text mb-3">カレンダー</h1>
        {/* Month nav */}
        <div className="flex items-center justify-between">
          <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-slate-800/60 text-slate-400">
            <ChevronLeft size={18} />
          </button>
          <span className="font-semibold text-slate-100">
            {format(currentMonth, 'yyyy年M月', { locale: ja })}
          </span>
          <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-slate-800/60 text-slate-400">
            <ChevronRight size={18} />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {/* Exam countdowns */}
        {upcomingExams.length > 0 && (
          <div className="space-y-2">
            {upcomingExams.map(exam => (
              <div key={exam.id} className="glass-light rounded-xl px-3 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">🎓</span>
                  <span className="text-sm font-medium text-slate-200">{exam.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold font-mono text-indigo-400">
                    {exam.daysLeft === 0 ? '本日！' : `${exam.daysLeft}日`}
                  </div>
                  <div className="text-xs text-slate-500">{exam.date}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Monthly goals */}
        {monthGoals.length > 0 && (
          <div className="glass-light rounded-xl p-3">
            <div className="section-label mb-2 flex items-center gap-1">
              <Trophy size={12} />月次目標
            </div>
            {monthGoals.map(g => (
              <div key={g.id} className="text-sm text-slate-300">・{g.title}</div>
            ))}
          </div>
        )}

        {/* Weekly goals */}
        {weekGoals.length > 0 && (
          <div className="glass-light rounded-xl p-3">
            <div className="section-label mb-2 flex items-center gap-1">
              <Trophy size={12} />週次目標
            </div>
            {weekGoals.map(g => (
              <div key={g.id} className="text-sm text-slate-300">・{g.title}</div>
            ))}
          </div>
        )}

        {/* Calendar grid */}
        <div className="glass-light rounded-xl p-3">
          {/* DOW headers */}
          <div className="grid grid-cols-7 mb-1">
            {['日','月','火','水','木','金','土'].map((d, i) => (
              <div key={d} className={`text-center text-xs font-medium py-1 ${i === 0 ? 'text-rose-400' : i === 6 ? 'text-blue-400' : 'text-slate-500'}`}>
                {d}
              </div>
            ))}
          </div>
          {/* Day cells */}
          <div className="grid grid-cols-7 gap-y-1">
            {/* Leading blanks */}
            {Array.from({ length: startDow }).map((_, i) => (
              <div key={`blank-${i}`} />
            ))}
            {days.map(day => {
              const dateStr = format(day, 'yyyy-MM-dd')
              const record = getRecord(dateStr)
              const today = isToday(day)
              const dow = day.getDay()
              return (
                <div
                  key={dateStr}
                  className={`flex flex-col items-center py-1 rounded-xl transition-colors ${today ? 'bg-indigo-900/40' : ''}`}
                >
                  <span className={`text-xs ${today ? 'text-indigo-300 font-bold' : dow === 0 ? 'text-rose-400' : dow === 6 ? 'text-blue-400' : 'text-slate-400'}`}>
                    {format(day, 'd')}
                  </span>
                  <span className="text-base leading-tight">
                    {record ? DAY_RATING_EMOJIS[record.rating] : '\u00A0'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Rating legend */}
        <div className="glass-light rounded-xl p-3">
          <div className="section-label mb-2">評価の凡例</div>
          <div className="grid grid-cols-5 gap-1">
            {([1,2,3,4,5] as DayRating[]).map(r => (
              <div key={r} className="flex flex-col items-center gap-1">
                <span className="text-xl">{DAY_RATING_EMOJIS[r]}</span>
                <span className="text-xs text-slate-500">{r}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="h-4" />
      </main>

      <BottomNav />
    </div>
  )
}
