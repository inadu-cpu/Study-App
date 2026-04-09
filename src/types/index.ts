// ===== PCCS 24色定義 =====
export const PCCS_COLORS: PccsColor[] = [
  { id: 'pccs-1',  name: 'ヴィヴィッドレッド',  hex: '#E8341C', label: '1:Re' },
  { id: 'pccs-2',  name: 'ヴィヴィッドオレンジレッド', hex: '#E8521C', label: '2:YR' },
  { id: 'pccs-3',  name: 'ヴィヴィッドオレンジ', hex: '#F08300', label: '3:O' },
  { id: 'pccs-4',  name: 'ヴィヴィッドイエローオレンジ', hex: '#F5A800', label: '4:YO' },
  { id: 'pccs-5',  name: 'ヴィヴィッドイエロー', hex: '#F5D800', label: '5:Y' },
  { id: 'pccs-6',  name: 'ヴィヴィッドグリーンイエロー', hex: '#A8C800', label: '6:GY' },
  { id: 'pccs-7',  name: 'ヴィヴィッドイエローグリーン', hex: '#55B33A', label: '7:G' },
  { id: 'pccs-8',  name: 'ヴィヴィッドグリーン', hex: '#00A550', label: '8:G' },
  { id: 'pccs-9',  name: 'ヴィヴィッドブルーグリーン', hex: '#00A070', label: '9:BG' },
  { id: 'pccs-10', name: 'ヴィヴィッドグリーンブルー', hex: '#007B8A', label: '10:GB' },
  { id: 'pccs-11', name: 'ヴィヴィッドシアン',  hex: '#008DC0', label: '11:B' },
  { id: 'pccs-12', name: 'ヴィヴィッドブルー',  hex: '#005BAC', label: '12:B' },
  { id: 'pccs-13', name: 'ヴィヴィッドバイオレットブルー', hex: '#1B3F8C', label: '13:V' },
  { id: 'pccs-14', name: 'ヴィヴィッドバイオレット', hex: '#3B2F8C', label: '14:V' },
  { id: 'pccs-15', name: 'ヴィヴィッドパープル',  hex: '#5D2D8C', label: '15:P' },
  { id: 'pccs-16', name: 'ヴィヴィッドレッドパープル', hex: '#A0237C', label: '16:RP' },
  { id: 'pccs-17', name: 'ヴィヴィッドレッド（深）', hex: '#C8003E', label: '17:R' },
  { id: 'pccs-18', name: 'ライトグレイッシュ',  hex: '#E8D0C0', label: '18:lg' },
  { id: 'pccs-19', name: 'ペールイエロー',      hex: '#F0E8A0', label: '19:p' },
  { id: 'pccs-20', name: 'ペールグリーン',      hex: '#B8E0B8', label: '20:p' },
  { id: 'pccs-21', name: 'ペールブルー',        hex: '#B0D0E8', label: '21:p' },
  { id: 'pccs-22', name: 'ペールパープル',      hex: '#D0B8E0', label: '22:p' },
  { id: 'pccs-23', name: 'ライトグレー',        hex: '#C8C8C8', label: '23:Gy' },
  { id: 'pccs-24', name: 'ウォームグレー',      hex: '#B8A898', label: '24:W' },
]

export interface PccsColor {
  id: string
  name: string
  hex: string
  label: string
}

// ===== 科目 =====
export interface Subject {
  id: string
  name: string
  colorId: string  // PCCS color id
  createdAt: string
}

// ===== タスク =====
export type TaskType = 'routine' | 'study' | 'review' | 'other'
export type ReviewStage = '1day' | '1week' | '1month' | 'done'

export interface Task {
  id: string
  title: string
  subjectId?: string
  type: TaskType
  date: string         // YYYY-MM-DD
  startTime?: string   // HH:MM
  endTime?: string     // HH:MM
  completed: boolean
  completedAt?: string
  notify: boolean
  notifyMinutesBefore: number
  isRoutine: boolean
  routineDays?: number[]  // 0=Sun ... 6=Sat
  memo?: string
  // 復習ロジック
  studyMemo?: string   // 新規学習完了時のメモ
  sourceTaskId?: string // 復習の元タスクID
  reviewStage?: ReviewStage
  createdAt: string
}

// ===== 復習スケジュール =====
export interface ReviewSlot {
  time: string   // HH:MM (設定された復習枠)
}

// ===== 試験日 =====
export interface ExamDate {
  id: string
  name: string
  date: string  // YYYY-MM-DD
}

// ===== 1日の評価 =====
export type DayRating = 1 | 2 | 3 | 4 | 5
export const DAY_RATING_EMOJIS: Record<DayRating, string> = {
  1: '😭',
  2: '😅',
  3: '😃',
  4: '😝',
  5: '🥳',
}

export interface DayRecord {
  date: string  // YYYY-MM-DD
  rating: DayRating
  comment?: string
  recordedAt: string
}

// ===== 目標 =====
export interface Goal {
  id: string
  type: 'monthly' | 'weekly'
  period: string   // YYYY-MM or YYYY-WW
  title: string
  description?: string
  createdAt: string
}

// ===== アプリ設定 =====
export interface AppSettings {
  wakeTime: string       // HH:MM
  sleepTime: string      // HH:MM
  defaultNotify: boolean
  reviewSlots: ReviewSlot[]  // 既定の復習枠
  examDates: ExamDate[]
}

export const DEFAULT_SETTINGS: AppSettings = {
  wakeTime: '07:00',
  sleepTime: '23:00',
  defaultNotify: true,
  reviewSlots: [
    { time: '12:00' },
    { time: '19:00' },
  ],
  examDates: [],
}
