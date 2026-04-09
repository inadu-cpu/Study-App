'use client'
import { useState } from 'react'
import { X, CheckCircle2 } from 'lucide-react'
import { Task } from '@/types'
import { useStore } from '@/store'

interface Props {
  task: Task
  onClose: () => void
}

export default function CompleteTaskModal({ task, onClose }: Props) {
  const { completeTask } = useStore()
  const [memo, setMemo] = useState(task.studyMemo || '')

  const handleComplete = () => {
    completeTask(task.id, memo || undefined)
    onClose()
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content p-5 max-w-sm" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-slate-100 text-base">学習完了</h3>
            <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{task.title}</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-xs text-slate-400 mb-1.5">
            📝 復習メモ <span className="text-slate-600">（学習内容を記録、自動復習に使用）</span>
          </label>
          <textarea
            className="input-base resize-none"
            rows={3}
            placeholder="例：ターゲット1900 1-100番"
            value={memo}
            onChange={e => setMemo(e.target.value)}
            autoFocus
          />
          <p className="text-xs text-slate-600 mt-1">
            入力すると「1日後・1週間後・1ヶ月後」の復習タスクが自動生成されます
          </p>
        </div>

        <div className="flex gap-2">
          <button onClick={onClose} className="btn-secondary flex-1">キャンセル</button>
          <button onClick={handleComplete} className="btn-primary flex-1 flex items-center justify-center gap-2">
            <CheckCircle2 size={16} />
            完了にする
          </button>
        </div>
      </div>
    </div>
  )
}
