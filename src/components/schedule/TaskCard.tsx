'use client'
import { useState } from 'react'
import { Pin, Check, BookOpen, RefreshCw } from 'lucide-react'
import { Task } from '@/types'
import { useStore } from '@/store'
import { getColorById, PCCS_COLORS } from '@/lib/utils'
import { PCCS_COLORS as COLORS } from '@/types'
import CompleteTaskModal from './CompleteTaskModal'

interface Props {
  task: Task
  compact?: boolean
}

export default function TaskCard({ task, compact = false }: Props) {
  const { subjects, completeTask, updateTask } = useStore()
  const [showComplete, setShowComplete] = useState(false)

  const subject = task.subjectId ? subjects.find(s => s.id === task.subjectId) : undefined
  const color = subject ? COLORS.find(c => c.id === subject.colorId) : undefined
  const bgColor = color?.hex ?? '#334155'

  const reviewStageBadge: Record<string, string> = {
    '1day': '1日後',
    '1week': '1週間後',
    '1month': '1ヶ月後',
  }

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!task.completed) {
      if (task.type === 'study') {
        setShowComplete(true)
      } else {
        completeTask(task.id)
      }
    } else {
      updateTask(task.id, { completed: false, completedAt: undefined })
    }
  }

  if (compact) {
    return (
      <>
        <div
          className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium cursor-pointer transition-all select-none ${task.completed ? 'opacity-40 line-through' : ''}`}
          style={{ backgroundColor: bgColor + '30', borderLeft: `2px solid ${bgColor}`, color: '#1e293b' }}
          onClick={handleToggle}
        >
          <span className="text-slate-100">{task.title}</span>
          {task.isRoutine && <Pin size={10} className="text-slate-400 flex-shrink-0" />}
        </div>
        {showComplete && (
          <CompleteTaskModal task={task} onClose={() => setShowComplete(false)} />
        )}
      </>
    )
  }

  return (
    <>
      <div
        className={`relative flex items-start gap-2 rounded-lg px-2.5 py-2 mb-1 cursor-pointer transition-all duration-200 select-none ${task.completed ? 'opacity-40' : 'hover:brightness-110'}`}
        style={{
          backgroundColor: bgColor + '22',
          borderLeft: `3px solid ${bgColor}`,
        }}
        onClick={handleToggle}
      >
        {/* Checkbox */}
        <div
          className={`w-4 h-4 flex-shrink-0 rounded border mt-0.5 flex items-center justify-center transition-colors ${
            task.completed
              ? 'bg-indigo-500 border-indigo-500'
              : 'border-slate-600'
          }`}
        >
          {task.completed && <Check size={10} className="text-white" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 flex-wrap">
            <span className={`text-xs font-medium text-slate-100 ${task.completed ? 'line-through' : ''}`}>
              {task.title}
            </span>
            {task.isRoutine && <Pin size={10} className="text-amber-400 flex-shrink-0" />}
            {task.type === 'review' && task.reviewStage && (
              <span className="review-badge bg-emerald-900/40 text-emerald-400 ml-auto">
                🔄 {reviewStageBadge[task.reviewStage]}
              </span>
            )}
            {task.type === 'study' && (
              <BookOpen size={10} className="text-blue-400 flex-shrink-0" />
            )}
          </div>
          {task.startTime && (
            <div className="text-xs text-slate-500 font-mono mt-0.5">
              {task.startTime}{task.endTime ? ` – ${task.endTime}` : ''}
            </div>
          )}
          {subject && (
            <div
              className="inline-block text-xs px-1.5 py-0.5 rounded mt-0.5 font-medium"
              style={{ backgroundColor: bgColor + '40', color: '#000' }}
            >
              {subject.name}
            </div>
          )}
          {task.studyMemo && task.type === 'review' && (
            <div className="text-xs text-slate-500 mt-0.5 truncate">📝 {task.studyMemo}</div>
          )}
        </div>
      </div>

      {showComplete && (
        <CompleteTaskModal task={task} onClose={() => setShowComplete(false)} />
      )}
    </>
  )
}
