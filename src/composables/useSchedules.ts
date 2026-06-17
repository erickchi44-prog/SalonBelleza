import { shallowRef } from 'vue'
import { supabase } from '../lib/supabase'
import type { Schedule } from '../types'
import { toDisplayTime } from '../utils/time'

export const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado']

export interface ScheduleRow {
  id: number | null
  day: string
  active: boolean
  start: string
  end: string
  break: string
}

const BREAK_MAP: Record<string, [string, string]> = {
  '12-1': ['12:00', '13:00'],
  '1-2': ['13:00', '14:00'],
  '2-3': ['14:00', '15:00']
}

const BREAK_REVERSE: Record<string, string> = {
  '12:00 PM - 01:00 PM': '12-1',
  '01:00 PM - 02:00 PM': '1-2',
  '02:00 PM - 03:00 PM': '2-3'
}

export function useSchedules() {
  const schedule = shallowRef<ScheduleRow[]>([])
  const loading = shallowRef(false)

  function buildDefaultSchedule(): ScheduleRow[] {
    return DAY_NAMES.map((day, i) => ({
      id: null,
      day,
      active: i !== 0 && i !== 6,
      start: i === 0 || i === 6 ? '10:00 AM' : '09:00 AM',
      end: i === 0 ? '04:00 PM' : i === 6 ? '06:00 PM' : '07:00 PM',
      break: i === 0 || i === 6 ? 'none' : '1-2'
    }))
  }

  function breakToRange(breakStart: string | null, breakEnd: string | null): string {
    if (!breakStart || !breakEnd) return 'none'
    const start = toDisplayTime(breakStart)
    const end = toDisplayTime(breakEnd)
    return BREAK_REVERSE[`${start} - ${end}`] || 'none'
  }

  function rangeToBreak(range: string): [string | null, string | null] {
    return BREAK_MAP[range] || [null, null]
  }

  async function fetchSchedules(specialistId: number | null) {
    if (!specialistId) { schedule.value = buildDefaultSchedule(); return }
    loading.value = true
    const { data, error } = await supabase
      .from('schedules')
      .select('*')
      .eq('specialist_id', specialistId)
      .order('day_of_week')
    if (!error && data && data.length > 0) {
      schedule.value = data.map((s: any) => ({
        id: s.id,
        day: DAY_NAMES[s.day_of_week],
        active: s.active,
        start: toDisplayTime(s.start_time),
        end: toDisplayTime(s.end_time),
        break: breakToRange(s.break_start, s.break_end)
      }))
    } else {
      schedule.value = buildDefaultSchedule()
    }
    loading.value = false
  }

  async function saveSchedules(specialistId: number | null) {
    if (!specialistId) return
    for (const day of schedule.value) {
      const dayIdx = DAY_NAMES.indexOf(day.day)
      const [breakStart, breakEnd] = rangeToBreak(day.break)
      const payload = {
        specialist_id: specialistId,
        day_of_week: dayIdx,
        active: day.active,
        start_time: day.start,
        end_time: day.end,
        break_start: breakStart,
        break_end: breakEnd
      }
      if (day.id) {
        await supabase.from('schedules').update(payload).eq('id', day.id)
      } else {
        await supabase.from('schedules').insert(payload)
      }
    }
    await fetchSchedules(specialistId)
  }

  return { schedule, loading, fetchSchedules, saveSchedules }
}
