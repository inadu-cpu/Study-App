import { format, parseISO, differenceInDays } from 'date-fns'
import { ja } from 'date-fns/locale'
import { PCCS_COLORS, PccsColor, AppSettings, DayRating, DAY_RATING_EMOJIS } from '@/types'

// ===== 時刻ユーティリティ =====
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function getCurrentTime(): string {
  return format(new Date(), 'HH:mm')
}

export function getCurrentDate(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

export function formatDate(dateStr: string): string {
  return format(parseISO(dateStr), 'M月d日(EEE)', { locale: ja })
}

export function formatDateFull(dateStr: string): string {
  return format(parseISO(dateStr), 'yyyy年M月d日(EEE)', { locale: ja })
}

// ===== 24時間スケジュールの時間枠生成 =====
export function generateHourSlots(wakeTime: string, sleepTime: string) {
  const wakeH = parseInt(wakeTime.split(':')[0]) - 1
  const sleepH = parseInt(sleepTime.split(':')[0]) + 1
  const slots: number[] = []
  for (let h = Math.max(0, wakeH); h <= Math.min(23, sleepH); h++) {
    slots.push(h)
  }
  return slots
}

// ===== PCCS色ユーティリティ =====
export function getColorById(colorId: string): PccsColor | undefined {
  return PCCS_COLORS.find(c => c.id === colorId)
}

// ===== 振り返り入力可能時間チェック =====
export function getReflectionWindow(date: string, wakeTime: string, sleepTime: string): {
  start: string
  end: string
  canRecord: boolean
} {
  // 前日の就寝3時間前 = 前日sleepTime - 3h
  const sleepH = parseInt(sleepTime.split(':')[0])
  const sleepM = parseInt(sleepTime.split(':')[1])
  const prevDaySleepMins = (sleepH - 3) * 60 + sleepM
  const startH = Math.floor(prevDaySleepMins / 60)
  const startM = prevDaySleepMins % 60
  const windowStart = `${String(startH).padStart(2, '0')}:${String(startM).padStart(2, '0')}`

  // 当日の起床4時間後 = wakeTime + 4h
  const wakeH = parseInt(wakeTime.split(':')[0])
  const wakeM = parseInt(wakeTime.split(':')[1])
  const endMins = (wakeH + 4) * 60 + wakeM
  const endH = Math.floor(endMins / 60) % 24
  const endM = endMins % 60
  const windowEnd = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`

  const now = new Date()
  const currentMins = now.getHours() * 60 + now.getMinutes()
  const today = format(now, 'yyyy-MM-dd')
  const yesterday = format(new Date(now.getTime() - 86400000), 'yyyy-MM-dd')

  let canRecord = false
  if (date === today) {
    // 前日就寝3時間前 (昨日の時刻) or 当日起床4時間後まで
    canRecord = currentMins <= endMins
  } else if (date === yesterday) {
    canRecord = currentMins >= prevDaySleepMins
  }

  return { start: windowStart, end: windowEnd, canRecord }
}

// ===== 試験日までの残り日数 =====
export function daysUntilExam(examDate: string): number {
  return differenceInDays(parseISO(examDate), new Date())
}

// ===== 今週の期間文字列 (ISO Week) =====
export function getWeekPeriod(date: Date = new Date()): string {
  const week = getISOWeek(date)
  return `${format(date, 'yyyy')}-W${String(week).padStart(2, '0')}`
}

export function getMonthPeriod(date: Date = new Date()): string {
  return format(date, 'yyyy-MM')
}

function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

// ===== 通知パーミッション要求 =====
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  const result = await Notification.requestPermission()
  return result === 'granted'
}
