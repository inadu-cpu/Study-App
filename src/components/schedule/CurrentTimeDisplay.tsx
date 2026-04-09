'use client'
import { useState, useEffect } from 'react'
import { getCurrentTime } from '@/lib/utils'

interface Props {
  wakeTime: string
  sleepTime: string
}

export default function CurrentTimeDisplay({ wakeTime, sleepTime }: Props) {
  const [time, setTime] = useState(getCurrentTime())

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getCurrentTime())
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-mono text-slate-400 animate-pulse-soft">{time}</span>
    </div>
  )
}
