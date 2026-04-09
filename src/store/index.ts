import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import { format, addDays, addWeeks, addMonths, isSameDay, parseISO } from 'date-fns'
import {
  Task, Subject, AppSettings, DEFAULT_SETTINGS,
  DayRecord, Goal, ExamDate, DayRating, ReviewStage, PCCS_COLORS
} from '@/types'

interface AppStore {
  // Data
  tasks: Task[]
  subjects: Subject[]
  dayRecords: DayRecord[]
  goals: Goal[]
  settings: AppSettings
  
  // UI state (not persisted)
  selectedDate: string
  
  // Actions: Tasks
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => string
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  completeTask: (id: string, studyMemo?: string) => void
  getTasksForDate: (date: string) => Task[]
  
  // Actions: Review
  generateReviews: (sourceTask: Task, memo: string) => void
  
  // Actions: Subjects
  addSubject: (name: string, colorId: string) => void
  updateSubject: (id: string, updates: Partial<Subject>) => void
  deleteSubject: (id: string) => void
  
  // Actions: Day Records
  addOrUpdateDayRecord: (date: string, rating: DayRating, comment?: string) => void
  getDayRecord: (date: string) => DayRecord | undefined
  
  // Actions: Goals
  addGoal: (type: 'monthly' | 'weekly', period: string, title: string, description?: string) => void
  updateGoal: (id: string, updates: Partial<Goal>) => void
  deleteGoal: (id: string) => void
  getCurrentGoals: () => Goal[]
  
  // Actions: Settings
  updateSettings: (updates: Partial<AppSettings>) => void
  addExamDate: (name: string, date: string) => void
  removeExamDate: (id: string) => void
  
  // Actions: UI
  setSelectedDate: (date: string) => void
  
  // Notifications
  scheduleNotification: (task: Task) => void
}

export const useStore = create<AppStore>()(
  persist(
    (set, get) => ({
      tasks: [],
      subjects: [],
      dayRecords: [],
      goals: [],
      settings: DEFAULT_SETTINGS,
      selectedDate: format(new Date(), 'yyyy-MM-dd'),

      // ========== Task Actions ==========
      addTask: (task) => {
        const id = uuidv4()
        const newTask: Task = {
          ...task,
          id,
          createdAt: new Date().toISOString(),
        }
        set(state => ({ tasks: [...state.tasks, newTask] }))
        if (newTask.notify) get().scheduleNotification(newTask)
        return id
      },

      updateTask: (id, updates) => {
        set(state => ({
          tasks: state.tasks.map(t => t.id === id ? { ...t, ...updates } : t)
        }))
      },

      deleteTask: (id) => {
        set(state => ({ tasks: state.tasks.filter(t => t.id !== id) }))
      },

      completeTask: (id, studyMemo) => {
        const task = get().tasks.find(t => t.id === id)
        if (!task) return
        const completedAt = new Date().toISOString()
        get().updateTask(id, {
          completed: true,
          completedAt,
          studyMemo,
        })
        // 新規学習タスクなら復習を自動生成
        if (task.type === 'study' && studyMemo) {
          get().generateReviews({ ...task, studyMemo, completedAt }, studyMemo)
        }
      },

      getTasksForDate: (date) => {
        const { tasks } = get()
        return tasks.filter(t => {
          if (t.date === date) return true
          // ルーティンタスクの日付展開
          if (t.isRoutine && t.routineDays) {
            const dow = parseISO(date).getDay()
            return t.routineDays.includes(dow)
          }
          return false
        })
      },

      // ========== Review Logic ==========
      generateReviews: (sourceTask, memo) => {
        const { tasks, settings } = get()
        const baseDate = sourceTask.completedAt
          ? parseISO(sourceTask.completedAt)
          : new Date()

        const stages: { stage: ReviewStage; date: Date }[] = [
          { stage: '1day',   date: addDays(baseDate, 1) },
          { stage: '1week',  date: addWeeks(baseDate, 1) },
          { stage: '1month', date: addMonths(baseDate, 1) },
        ]

        stages.forEach(({ stage, date }) => {
          const dateStr = format(date, 'yyyy-MM-dd')
          // 重複チェック
          const existing = tasks.find(t =>
            t.sourceTaskId === sourceTask.id &&
            t.reviewStage === stage &&
            t.type === 'review'
          )
          if (existing) {
            // 最新の進捗を優先（未完了に戻してメモ更新）
            get().updateTask(existing.id, {
              date: dateStr,
              studyMemo: memo,
              completed: false,
              completedAt: undefined,
            })
            return
          }
          // 復習枠の時刻を使用
          const slot = settings.reviewSlots[0]
          const reviewTask: Omit<Task, 'id' | 'createdAt'> = {
            title: `【復習】${sourceTask.title}`,
            subjectId: sourceTask.subjectId,
            type: 'review',
            date: dateStr,
            startTime: slot?.time,
            endTime: slot ? addMinutesToTime(slot.time, 30) : undefined,
            completed: false,
            notify: get().settings.defaultNotify,
            notifyMinutesBefore: 10,
            isRoutine: false,
            studyMemo: memo,
            sourceTaskId: sourceTask.id,
            reviewStage: stage,
            memo: `元タスク: ${sourceTask.title}\n内容: ${memo}`,
          }
          get().addTask(reviewTask)
        })
      },

      // ========== Subject Actions ==========
      addSubject: (name, colorId) => {
        const newSubject: Subject = {
          id: uuidv4(),
          name,
          colorId,
          createdAt: new Date().toISOString(),
        }
        set(state => ({ subjects: [...state.subjects, newSubject] }))
      },

      updateSubject: (id, updates) => {
        set(state => ({
          subjects: state.subjects.map(s => s.id === id ? { ...s, ...updates } : s)
        }))
      },

      deleteSubject: (id) => {
        set(state => ({ subjects: state.subjects.filter(s => s.id !== id) }))
      },

      // ========== Day Record Actions ==========
      addOrUpdateDayRecord: (date, rating, comment) => {
        const existing = get().dayRecords.find(r => r.date === date)
        if (existing) {
          set(state => ({
            dayRecords: state.dayRecords.map(r =>
              r.date === date ? { ...r, rating, comment, recordedAt: new Date().toISOString() } : r
            )
          }))
        } else {
          set(state => ({
            dayRecords: [...state.dayRecords, {
              date,
              rating,
              comment,
              recordedAt: new Date().toISOString()
            }]
          }))
        }
      },

      getDayRecord: (date) => {
        return get().dayRecords.find(r => r.date === date)
      },

      // ========== Goal Actions ==========
      addGoal: (type, period, title, description) => {
        const newGoal: Goal = {
          id: uuidv4(),
          type,
          period,
          title,
          description,
          createdAt: new Date().toISOString(),
        }
        set(state => ({ goals: [...state.goals, newGoal] }))
      },

      updateGoal: (id, updates) => {
        set(state => ({
          goals: state.goals.map(g => g.id === id ? { ...g, ...updates } : g)
        }))
      },

      deleteGoal: (id) => {
        set(state => ({ goals: state.goals.filter(g => g.id !== id) }))
      },

      getCurrentGoals: () => {
        const now = new Date()
        const monthStr = format(now, 'yyyy-MM')
        // ISO week
        const weekStr = `${format(now, 'yyyy')}-W${format(now, 'ww')}`
        return get().goals.filter(g =>
          g.period === monthStr || g.period === weekStr
        )
      },

      // ========== Settings Actions ==========
      updateSettings: (updates) => {
        set(state => ({ settings: { ...state.settings, ...updates } }))
      },

      addExamDate: (name, date) => {
        const newExam: ExamDate = { id: uuidv4(), name, date }
        set(state => ({
          settings: {
            ...state.settings,
            examDates: [...state.settings.examDates, newExam]
          }
        }))
      },

      removeExamDate: (id) => {
        set(state => ({
          settings: {
            ...state.settings,
            examDates: state.settings.examDates.filter(e => e.id !== id)
          }
        }))
      },

      setSelectedDate: (date) => set({ selectedDate: date }),

      // ========== Notifications ==========
      scheduleNotification: (task) => {
        if (typeof window === 'undefined') return
        if (!task.notify || !task.startTime || !task.date) return
        if (Notification.permission !== 'granted') return

        const taskDateTime = new Date(`${task.date}T${task.startTime}:00`)
        const notifyAt = new Date(taskDateTime.getTime() - task.notifyMinutesBefore * 60 * 1000)
        const now = new Date()
        const delay = notifyAt.getTime() - now.getTime()
        if (delay <= 0) return

        setTimeout(() => {
          new Notification(`📚 ${task.title}`, {
            body: `${task.notifyMinutesBefore}分後に開始します`,
            icon: '/icon-192.png',
          })
        }, delay)
      },
    }),
    {
      name: 'study-app-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        tasks: state.tasks,
        subjects: state.subjects,
        dayRecords: state.dayRecords,
        goals: state.goals,
        settings: state.settings,
      }),
    }
  )
)

// ===== Helpers =====
function addMinutesToTime(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number)
  const total = h * 60 + m + minutes
  const nh = Math.floor(total / 60) % 24
  const nm = total % 60
  return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`
}
