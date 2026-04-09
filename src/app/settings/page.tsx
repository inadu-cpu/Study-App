'use client'
import { useState } from 'react'
import { Plus, Trash2, Clock, Bell, CalendarCheck, BookOpen, Target } from 'lucide-react'
import { useStore } from '@/store'
import { PCCS_COLORS } from '@/types'
import { daysUntilExam, getMonthPeriod, getWeekPeriod, requestNotificationPermission } from '@/lib/utils'
import BottomNav from '@/components/ui/BottomNav'

export default function SettingsPage() {
  const {
    settings, updateSettings, addExamDate, removeExamDate,
    subjects, addSubject, deleteSubject,
    goals, addGoal, deleteGoal,
  } = useStore()

  const [newSubjectName, setNewSubjectName] = useState('')
  const [newSubjectColor, setNewSubjectColor] = useState(PCCS_COLORS[0].id)
  const [newExamName, setNewExamName] = useState('')
  const [newExamDate, setNewExamDate] = useState('')
  const [newGoalType, setNewGoalType] = useState<'monthly' | 'weekly'>('monthly')
  const [newGoalTitle, setNewGoalTitle] = useState('')
  const [newReviewSlot, setNewReviewSlot] = useState('')

  const handleAddSubject = () => {
    if (!newSubjectName.trim()) return
    addSubject(newSubjectName.trim(), newSubjectColor)
    setNewSubjectName('')
  }

  const handleAddExam = () => {
    if (!newExamName.trim() || !newExamDate) return
    addExamDate(newExamName.trim(), newExamDate)
    setNewExamName('')
    setNewExamDate('')
  }

  const handleAddGoal = () => {
    if (!newGoalTitle.trim()) return
    const period = newGoalType === 'monthly' ? getMonthPeriod() : getWeekPeriod()
    addGoal(newGoalType, period, newGoalTitle.trim())
    setNewGoalTitle('')
  }

  const handleAddReviewSlot = () => {
    if (!newReviewSlot) return
    const existing = settings.reviewSlots.find(s => s.time === newReviewSlot)
    if (existing) return
    updateSettings({ reviewSlots: [...settings.reviewSlots, { time: newReviewSlot }] })
    setNewReviewSlot('')
  }

  const handleRemoveReviewSlot = (time: string) => {
    updateSettings({ reviewSlots: settings.reviewSlots.filter(s => s.time !== time) })
  }

  return (
    <div className="flex flex-col h-screen bg-slate-950">
      <header className="glass border-b border-slate-800/50 px-4 pt-safe-top pb-3 flex-shrink-0">
        <h1 className="font-display font-bold text-lg gradient-text">設定</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-3 py-3 space-y-5">

        {/* ===== 時間設定 ===== */}
        <Section icon={<Clock size={14} />} title="起床・就寝時間">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs text-slate-500 mb-1">起床時間</label>
              <input
                type="time"
                className="input-base"
                value={settings.wakeTime}
                onChange={e => updateSettings({ wakeTime: e.target.value })}
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-slate-500 mb-1">就寝時間</label>
              <input
                type="time"
                className="input-base"
                value={settings.sleepTime}
                onChange={e => updateSettings({ sleepTime: e.target.value })}
              />
            </div>
          </div>
        </Section>

        {/* ===== 通知 ===== */}
        <Section icon={<Bell size={14} />} title="通知設定">
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => updateSettings({ defaultNotify: !settings.defaultNotify })}
              className={`w-11 h-6 rounded-full transition-colors relative ${settings.defaultNotify ? 'bg-indigo-600' : 'bg-slate-700'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${settings.defaultNotify ? 'translate-x-6' : 'translate-x-1'}`} />
            </div>
            <span className="text-sm text-slate-300">通知をデフォルトON</span>
          </label>
          <button
            onClick={requestNotificationPermission}
            className="btn-secondary w-full mt-2 text-xs"
          >
            ブラウザの通知許可を要求
          </button>
        </Section>

        {/* ===== 復習枠 ===== */}
        <Section icon={<BookOpen size={14} />} title="自動復習の時間枠">
          <div className="space-y-2 mb-2">
            {settings.reviewSlots.map(slot => (
              <div key={slot.time} className="flex items-center justify-between glass-light rounded-xl px-3 py-2">
                <span className="font-mono text-sm text-slate-200">{slot.time}</span>
                <button
                  onClick={() => handleRemoveReviewSlot(slot.time)}
                  className="text-rose-400 hover:text-rose-300 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="time"
              className="input-base flex-1"
              value={newReviewSlot}
              onChange={e => setNewReviewSlot(e.target.value)}
            />
            <button onClick={handleAddReviewSlot} className="btn-primary px-3">
              <Plus size={16} />
            </button>
          </div>
        </Section>

        {/* ===== 試験日 ===== */}
        <Section icon={<CalendarCheck size={14} />} title="試験日登録">
          <div className="space-y-2 mb-2">
            {settings.examDates.map(exam => {
              const days = daysUntilExam(exam.date)
              return (
                <div key={exam.id} className="flex items-center justify-between glass-light rounded-xl px-3 py-2">
                  <div>
                    <div className="text-sm font-medium text-slate-200">{exam.name}</div>
                    <div className="text-xs text-slate-500 font-mono">{exam.date}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-bold font-mono ${days < 7 ? 'text-rose-400' : days < 30 ? 'text-amber-400' : 'text-indigo-400'}`}>
                      {days >= 0 ? `${days}日後` : '終了'}
                    </span>
                    <button onClick={() => removeExamDate(exam.id)} className="text-rose-400 hover:text-rose-300">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="flex gap-2 mb-2">
            <input
              className="input-base flex-1"
              placeholder="試験名"
              value={newExamName}
              onChange={e => setNewExamName(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <input
              type="date"
              className="input-base flex-1"
              value={newExamDate}
              onChange={e => setNewExamDate(e.target.value)}
            />
            <button onClick={handleAddExam} className="btn-primary px-3">
              <Plus size={16} />
            </button>
          </div>
        </Section>

        {/* ===== 科目 ===== */}
        <Section icon={<BookOpen size={14} />} title="科目登録">
          <div className="space-y-2 mb-3">
            {subjects.map(subject => {
              const color = PCCS_COLORS.find(c => c.id === subject.colorId)
              return (
                <div key={subject.id} className="flex items-center gap-2 glass-light rounded-xl px-3 py-2">
                  <div
                    className="w-5 h-5 rounded-md flex-shrink-0"
                    style={{ backgroundColor: color?.hex ?? '#334155' }}
                  />
                  <span className="text-sm text-slate-200 flex-1">{subject.name}</span>
                  <span className="text-xs text-slate-600">{color?.label}</span>
                  <button onClick={() => deleteSubject(subject.id)} className="text-rose-400 hover:text-rose-300">
                    <Trash2 size={14} />
                  </button>
                </div>
              )
            })}
          </div>

          {/* PCCS color picker */}
          <div className="mb-2">
            <label className="block text-xs text-slate-500 mb-2">PCCS 24色から選択</label>
            <div className="flex flex-wrap gap-2">
              {PCCS_COLORS.map(color => (
                <button
                  key={color.id}
                  onClick={() => setNewSubjectColor(color.id)}
                  className={`pccs-swatch ${newSubjectColor === color.id ? 'selected' : ''}`}
                  style={{ backgroundColor: color.hex }}
                  title={`${color.label} ${color.name}`}
                />
              ))}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              選択中: {PCCS_COLORS.find(c => c.id === newSubjectColor)?.name}
            </div>
          </div>
          <div className="flex gap-2">
            <input
              className="input-base flex-1"
              placeholder="科目名"
              value={newSubjectName}
              onChange={e => setNewSubjectName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddSubject()}
            />
            <button onClick={handleAddSubject} className="btn-primary px-3">
              <Plus size={16} />
            </button>
          </div>
        </Section>

        {/* ===== 目標 ===== */}
        <Section icon={<Target size={14} />} title="目標管理">
          <div className="space-y-2 mb-3">
            {goals.map(g => (
              <div key={g.id} className="flex items-start gap-2 glass-light rounded-xl px-3 py-2">
                <span className={`text-xs px-1.5 py-0.5 rounded mt-0.5 flex-shrink-0 ${g.type === 'monthly' ? 'bg-indigo-900/50 text-indigo-400' : 'bg-emerald-900/50 text-emerald-400'}`}>
                  {g.type === 'monthly' ? '月' : '週'}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-slate-200 leading-tight">{g.title}</div>
                  <div className="text-xs text-slate-600 font-mono">{g.period}</div>
                </div>
                <button onClick={() => deleteGoal(g.id)} className="text-rose-400 hover:text-rose-300 flex-shrink-0">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mb-2">
            <button
              onClick={() => setNewGoalType('monthly')}
              className={`flex-1 py-2 rounded-xl text-xs font-medium transition-colors ${newGoalType === 'monthly' ? 'bg-indigo-600 text-white' : 'bg-slate-800/60 text-slate-400'}`}
            >
              月次目標
            </button>
            <button
              onClick={() => setNewGoalType('weekly')}
              className={`flex-1 py-2 rounded-xl text-xs font-medium transition-colors ${newGoalType === 'weekly' ? 'bg-emerald-600 text-white' : 'bg-slate-800/60 text-slate-400'}`}
            >
              週次目標
            </button>
          </div>
          <div className="flex gap-2">
            <input
              className="input-base flex-1"
              placeholder="目標を入力"
              value={newGoalTitle}
              onChange={e => setNewGoalTitle(e.target.value)}
            />
            <button onClick={handleAddGoal} className="btn-primary px-3">
              <Plus size={16} />
            </button>
          </div>
        </Section>

        <div className="h-4" />
      </main>

      <BottomNav />
    </div>
  )
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="glass-light rounded-2xl p-4">
      <div className="flex items-center gap-1.5 mb-3">
        <span className="text-slate-400">{icon}</span>
        <h2 className="text-sm font-semibold text-slate-300">{title}</h2>
      </div>
      {children}
    </div>
  )
}
