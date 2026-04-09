'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useStore } from '@/store'
import { generateHourSlots, timeToMinutes, getColorById } from '@/lib/utils'
import { Task } from '@/types'
import TaskCard from './TaskCard'
import TaskDetailPopup from './TaskDetailPopup'

interface Props {
  date: string
  currentTime: string
  isToday: boolean
}

export default function VerticalSchedule({ date, currentTime, isToday }: Props) {
  const { settings, getTasksForDate, subjects } = useStore()
  const containerRef = useRef<HTMLDivElement>(null)
  const [selectedHourTasks, setSelectedHourTasks] = useState<Task[] | null>(null)
  const [popupHour, setPopupHour] = useState<number | null>(null)
  const HOUR_HEIGHT = 72 // px

  const hours = generateHourSlots(settings.wakeTime, settings.sleepTime)
  const tasks = getTasksForDate(date)

  // 時間 → Y座標
  const timeToY = useCallback((time: string): number => {
    const [h, m] = time.split(':').map(Number)
    const startH = hours[0]
    return ((h - startH) * 60 + m) / 60 * HOUR_HEIGHT
  }, [hours])

  // 現在時刻のY座標
  const currentY = isToday ? timeToY(currentTime) : -1

  // オートスクロール
  useEffect(() => {
    if (!isToday || !containerRef.current) return
    const [h, m] = currentTime.split(':').map(Number)
    const startH = hours[0]
    const scrollTarget = ((h - startH) * 60 + m) / 60 * HOUR_HEIGHT - 100
    containerRef.current.scrollTo({ top: Math.max(0, scrollTarget), behavior: 'smooth' })
  }, [isToday, currentTime, hours])

  // タスクを時間枠でグループ化
  const tasksByHour = new Map<number, Task[]>()
  tasks.forEach(task => {
    if (!task.startTime) return
    const h = parseInt(task.startTime.split(':')[0])
    if (!tasksByHour.has(h)) tasksByHour.set(h, [])
    tasksByHour.get(h)!.push(task)
  })

  // 時刻なしタスク（終日）
  const allDayTasks = tasks.filter(t => !t.startTime)

  const handleHourClick = (h: number) => {
    const hourTasks = tasksByHour.get(h)
    if (hourTasks && hourTasks.length > 1) {
      setSelectedHourTasks(hourTasks)
      setPopupHour(h)
    }
  }

  return (
    <div className="h-full overflow-y-auto" ref={containerRef}>
      {/* 終日タスク */}
      {allDayTasks.length > 0 && (
        <div className="px-3 py-2 border-b border-slate-800/50 bg-slate-900/30 flex flex-wrap gap-1.5">
          {allDayTasks.map(task => (
            <TaskCard key={task.id} task={task} compact />
          ))}
        </div>
      )}

      {/* タイムライン */}
      <div className="relative" style={{ minHeight: `${hours.length * HOUR_HEIGHT}px` }}>
        {/* 時間枠 */}
        {hours.map((h, idx) => {
          const hourTasks = tasksByHour.get(h) || []
          return (
            <div
              key={h}
              className="schedule-hour-row flex border-b border-slate-800/30"
              style={{ height: `${HOUR_HEIGHT}px` }}
            >
              {/* 時刻ラベル */}
              <div className="flex-shrink-0 w-14 pt-1 pr-2 text-right">
                <span className="text-xs font-mono text-slate-600">
                  {String(h).padStart(2, '0')}:00
                </span>
              </div>
              {/* タスクエリア */}
              <div
                className="flex-1 relative border-l border-slate-800/40 px-1 py-0.5 cursor-pointer"
                onClick={() => handleHourClick(h)}
              >
                {hourTasks.length === 0 && null}
                {hourTasks.length === 1 && (
                  <TaskCard task={hourTasks[0]} />
                )}
                {hourTasks.length > 1 && (
                  <div className="flex gap-1 items-start flex-wrap">
                    {hourTasks.slice(0, 2).map(task => (
                      <TaskCard key={task.id} task={task} compact />
                    ))}
                    {hourTasks.length > 2 && (
                      <span className="text-xs text-slate-500 self-center">
                        +{hourTasks.length - 2}件 →
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {/* 現在時刻インジケーター */}
        {isToday && currentY >= 0 && (
          <div
            className="time-indicator"
            style={{ top: `${currentY}px`, '--timeline-left': '56px' } as React.CSSProperties}
          />
        )}
      </div>

      {/* タスク詳細ポップアップ */}
      {selectedHourTasks && popupHour !== null && (
        <TaskDetailPopup
          tasks={selectedHourTasks}
          hour={popupHour}
          onClose={() => { setSelectedHourTasks(null); setPopupHour(null) }}
        />
      )}
    </div>
  )
}
