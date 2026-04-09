'use client'
import { X } from 'lucide-react'
import { Task } from '@/types'
import TaskCard from './TaskCard'

interface Props {
  tasks: Task[]
  hour: number
  onClose: () => void
}

export default function TaskDetailPopup({ tasks, hour, onClose }: Props) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content p-4 max-w-sm" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-100">
            {String(hour).padStart(2, '0')}:00 のタスク
          </h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="space-y-1">
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      </div>
    </div>
  )
}
