'use client'
import { useState } from 'react'
import { X, Clock, Tag, Bell, Repeat } from 'lucide-react'
import { useStore } from '@/store'
import { PCCS_COLORS, TaskType } from '@/types'

const DAY_LABELS = ['日', '月', '火', '水', '木', '金', '土']

interface Props {
  date: string
  onClose: () => void
}

export default function AddTaskModal({ date, onClose }: Props) {
  const { subjects, settings, addTask } = useStore()
  const [title, setTitle] = useState('')
  const [type, setType] = useState<TaskType>('study')
  const [subjectId, setSubjectId] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [notify, setNotify] = useState(settings.defaultNotify)
  const [notifyMins, setNotifyMins] = useState(10)
  const [isRoutine, setIsRoutine] = useState(false)
  const [routineDays, setRoutineDays] = useState<number[]>([])
  const [memo, setMemo] = useState('')

  const toggleDay = (d: number) => {
    setRoutineDays(prev =>
      prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]
    )
  }

  const handleSubmit = () => {
    if (!title.trim()) return
    addTask({
      title: title.trim(),
      type,
      subjectId: subjectId || undefined,
      date,
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      completed: false,
      notify,
      notifyMinutesBefore: notifyMins,
      isRoutine,
      routineDays: isRoutine ? routineDays : undefined,
      memo: memo || undefined,
    })
    onClose()
  }

  const typeOptions: { value: TaskType; label: string; emoji: string }[] = [
    { value: 'study', label: '新規学習', emoji: '📗' },
    { value: 'routine', label: 'ルーティン', emoji: '🔁' },
    { value: 'other', label: 'その他', emoji: '📌' },
  ]

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/40">
          <h3 className="font-semibold text-slate-100">タスクを追加</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">タスク名 *</label>
            <input
              className="input-base"
              placeholder="タスク名を入力"
              value={title}
              onChange={e => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">種類</label>
            <div className="flex gap-2">
              {typeOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setType(opt.value)}
                  className={`flex-1 py-2 rounded-xl text-xs font-medium transition-colors ${
                    type === opt.value
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {opt.emoji} {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Subject */}
          {subjects.length > 0 && (
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">
                <Tag size={12} className="inline mr-1" />科目
              </label>
              <select
                className="input-base"
                value={subjectId}
                onChange={e => setSubjectId(e.target.value)}
              >
                <option value="">科目なし</option>
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Time */}
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">
              <Clock size={12} className="inline mr-1" />時間
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="time"
                className="input-base flex-1"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
              />
              <span className="text-slate-600 text-sm">〜</span>
              <input
                type="time"
                className="input-base flex-1"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
              />
            </div>
          </div>

          {/* Routine */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isRoutine}
                onChange={e => setIsRoutine(e.target.checked)}
                className="w-4 h-4 rounded accent-indigo-500"
              />
              <span className="text-sm text-slate-300">
                <Repeat size={12} className="inline mr-1 text-amber-400" />
                ルーティンタスク
              </span>
            </label>
            {isRoutine && (
              <div className="flex gap-2 mt-2 ml-6">
                {DAY_LABELS.map((label, d) => (
                  <button
                    key={d}
                    onClick={() => toggleDay(d)}
                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                      routineDays.includes(d)
                        ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50'
                        : 'bg-slate-800/60 text-slate-500'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notify */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={notify}
                onChange={e => setNotify(e.target.checked)}
                className="w-4 h-4 rounded accent-indigo-500"
              />
              <span className="text-sm text-slate-300">
                <Bell size={12} className="inline mr-1 text-indigo-400" />
                通知を送る
              </span>
            </label>
            {notify && (
              <div className="flex items-center gap-2 mt-2 ml-6">
                <input
                  type="number"
                  className="input-base w-20"
                  value={notifyMins}
                  onChange={e => setNotifyMins(Number(e.target.value))}
                  min={1}
                  max={120}
                />
                <span className="text-sm text-slate-400">分前に通知</span>
              </div>
            )}
          </div>

          {/* Memo */}
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">メモ</label>
            <textarea
              className="input-base resize-none"
              rows={2}
              placeholder="メモ（任意）"
              value={memo}
              onChange={e => setMemo(e.target.value)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 flex gap-2">
          <button onClick={onClose} className="btn-secondary flex-1">キャンセル</button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim()}
            className="btn-primary flex-1 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            追加する
          </button>
        </div>
      </div>
    </div>
  )
}
