'use client'
import { useState } from 'react'
import { useStore } from '@/store'
import { DAY_RATING_EMOJIS, DayRating } from '@/types'
import { getReflectionWindow, getCurrentDate } from '@/lib/utils'

interface Props {
  date: string
}

const RATINGS: DayRating[] = [1, 2, 3, 4, 5]

export default function DayRatingWidget({ date }: Props) {
  const { settings, getDayRecord, addOrUpdateDayRecord } = useStore()
  const record = getDayRecord(date)
  const today = getCurrentDate()

  const { start, end, canRecord } = getReflectionWindow(date, settings.wakeTime, settings.sleepTime)

  // 記録可能かどうか
  const isRecordable = date === today || date === getPrevDate(today)

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/30 border-b border-slate-800/40">
      {/* Emoji buttons */}
      <div className="flex gap-1">
        {RATINGS.map(r => (
          <button
            key={r}
            onClick={() => isRecordable && addOrUpdateDayRecord(date, r)}
            disabled={!isRecordable}
            className={`text-xl px-1 py-0.5 rounded-lg transition-all duration-200 ${
              record?.rating === r
                ? 'scale-125 bg-slate-700/60'
                : 'opacity-40 hover:opacity-70'
            } disabled:cursor-not-allowed`}
            title={`${r}段階評価`}
          >
            {DAY_RATING_EMOJIS[r]}
          </button>
        ))}
      </div>
      {/* Time window label */}
      <div className="ml-auto text-right">
        <div className="text-xs text-slate-600 leading-tight">
          記録可能時間
        </div>
        <div className="text-xs font-mono text-slate-500">
          {start} 〜 {end}
        </div>
      </div>
    </div>
  )
}

function getPrevDate(dateStr: string): string {
  const d = new Date(dateStr)
  d.setDate(d.getDate() - 1)
  return d.toISOString().split('T')[0]
}
