'use client'
import { useState, useEffect, useRef } from 'react'
import { format, addDays, subDays, parseISO } from 'date-fns'
import { ja } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Plus, Bell, BellOff } from 'lucide-react'
import { useStore } from '@/store'
import { getCurrentDate, getCurrentTime, generateHourSlots, timeToMinutes, formatDate, requestNotificationPermission } from '@/lib/utils'
import VerticalSchedule from '@/components/schedule/VerticalSchedule'
import AddTaskModal from '@/components/schedule/AddTaskModal'
import DayRatingWidget from '@/components/schedule/DayRatingWidget'
import GoalAlert from '@/components/schedule/GoalAlert'
import BottomNav from '@/components/ui/BottomNav'
import CurrentTimeDisplay from '@/components/schedule/CurrentTimeDisplay'

export default function HomePage() {
  const { settings, selectedDate, setSelectedDate, getCurrentGoals } = useStore()
  const [showAddTask, setShowAddTask] = useState(false)
  const [notifGranted, setNotifGranted] = useState(false)
  const [currentTime, setCurrentTime] = useState(getCurrentTime())
  const today = getCurrentDate()

  useEffect(() => {
    // Tick every 30s
    const interval = setInterval(() => {
      setCurrentTime(getCurrentTime())
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotifGranted(Notification.permission === 'granted')
    }
  }, [])

  const handleRequestNotif = async () => {
    const granted = await requestNotificationPermission()
    setNotifGranted(granted)
  }

  const goPrevDay = () => {
    const prev = format(subDays(parseISO(selectedDate), 1), 'yyyy-MM-dd')
    setSelectedDate(prev)
  }

  const goNextDay = () => {
    const next = format(addDays(parseISO(selectedDate), 1), 'yyyy-MM-dd')
    setSelectedDate(next)
  }

  const goToday = () => setSelectedDate(today)

  const isToday = selectedDate === today

  return (
    <div className="flex flex-col h-screen bg-slate-950 overflow-hidden">
      {/* ===== Header ===== */}
      <header className="glass border-b border-slate-800/50 px-4 pt-safe-top pb-3 flex-shrink-0 z-20">
        {/* Top row */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="font-display font-bold text-lg gradient-text leading-tight">学習スケジューラ</h1>
            <CurrentTimeDisplay wakeTime={settings.wakeTime} sleepTime={settings.sleepTime} />
          </div>
          <button
            onClick={notifGranted ? undefined : handleRequestNotif}
            className={`p-2 rounded-xl transition-colors ${notifGranted ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
            title={notifGranted ? '通知ON' : '通知を許可'}
          >
            {notifGranted ? <Bell size={18} /> : <BellOff size={18} />}
          </button>
        </div>
        {/* Date navigator */}
        <div className="flex items-center justify-between">
          <button onClick={goPrevDay} className="p-1.5 rounded-lg hover:bg-slate-800/60 text-slate-400 transition-colors">
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={goToday}
            className={`flex flex-col items-center transition-colors ${isToday ? 'text-indigo-400' : 'text-slate-200'}`}
          >
            <span className="text-sm font-semibold">{formatDate(selectedDate)}</span>
            {isToday && <span className="text-xs text-indigo-400 font-medium">今日</span>}
          </button>
          <button onClick={goNextDay} className="p-1.5 rounded-lg hover:bg-slate-800/60 text-slate-400 transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>
      </header>

      {/* ===== Rating bar ===== */}
      <DayRatingWidget date={selectedDate} />

      {/* ===== Goal Alert ===== */}
      <GoalAlert />

      {/* ===== Main schedule ===== */}
      <main className="flex-1 overflow-hidden relative">
        <VerticalSchedule
          date={selectedDate}
          currentTime={currentTime}
          isToday={isToday}
        />
      </main>

      {/* ===== FAB ===== */}
      <button
        onClick={() => setShowAddTask(true)}
        className="fixed bottom-20 right-4 z-30 w-14 h-14 bg-indigo-600 hover:bg-indigo-500 rounded-2xl shadow-lg shadow-indigo-900/50 flex items-center justify-center transition-all duration-200 active:scale-90"
        aria-label="タスク追加"
      >
        <Plus size={24} className="text-white" />
      </button>

      {/* ===== Bottom Nav ===== */}
      <BottomNav />

      {/* ===== Modals ===== */}
      {showAddTask && (
        <AddTaskModal
          date={selectedDate}
          onClose={() => setShowAddTask(false)}
        />
      )}
    </div>
  )
}
