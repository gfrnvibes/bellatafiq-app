import { DAYS_OF_WEEK, DayName, PresetProfile, ScheduleSlot, WeekSchedule } from '@/types/bell';

export function createEmptyDaySlots(): ScheduleSlot[] {
  return [];
}

export function createEmptyWeekSchedule(): WeekSchedule {
  return {
    Minggu: [],
    Senin: [],
    Selasa: [],
    Rabu: [],
    Kamis: [],
    "Jum'at": [],
    Sabtu: [],
  };
}

function makeWeekdaySlots(entries: Array<[string, number, string]>): ScheduleSlot[] {
  return entries.map(([time, mp3, label], idx) => ({
    slot: idx + 1,
    time,
    mp3,
    enabled: true,
    label,
  }));
}

const normalWeekday = makeWeekdaySlots([
  ['07:00', 1, 'Masuk Sekolah'],
  ['07:45', 2, 'Jam Pelajaran 2'],
  ['08:30', 3, 'Jam Pelajaran 3'],
  ['09:15', 4, 'Istirahat 1'],
  ['09:30', 5, 'Masuk Setelah Istirahat'],
  ['10:15', 6, 'Jam Pelajaran 5'],
  ['11:00', 7, 'Jam Pelajaran 6'],
  ['11:45', 8, 'Istirahat 2 / Dzuhur'],
  ['12:30', 9, 'Masuk Siang'],
  ['13:15', 10, 'Pulang Sekolah'],
]);

const fridayNormal = makeWeekdaySlots([
  ['07:00', 1, 'Masuk / Senam Pagi'],
  ['07:45', 2, 'Jam Pelajaran 2'],
  ['08:30', 3, 'Jam Pelajaran 3'],
  ['09:15', 4, 'Istirahat'],
  ['09:30', 5, 'Masuk Setelah Istirahat'],
  ['10:15', 6, 'Jam Pelajaran 5'],
  ['11:00', 10, 'Pulang (Persiapan Jum\'at)'],
]);

const examWeekday = makeWeekdaySlots([
  ['07:30', 1, 'Masuk Ruang Ujian'],
  ['07:35', 2, 'Mulai Ujian Sesi 1'],
  ['09:05', 4, 'Selesai Sesi 1 / Istirahat'],
  ['09:30', 5, 'Masuk Ruang Sesi 2'],
  ['11:00', 10, 'Selesai Ujian'],
]);

const ramadhanWeekday = makeWeekdaySlots([
  ['07:30', 1, 'Masuk Sekolah (Ramadhan)'],
  ['08:05', 2, 'Jam Pelajaran 2'],
  ['08:40', 3, 'Jam Pelajaran 3'],
  ['09:15', 4, 'Istirahat'],
  ['09:30', 5, 'Masuk Setelah Istirahat'],
  ['10:05', 6, 'Jam Pelajaran 5'],
  ['10:40', 7, 'Jam Pelajaran 6'],
  ['11:15', 10, 'Pulang Lebih Awal'],
]);

function fillWeek(
  monThu: ScheduleSlot[],
  fri: ScheduleSlot[],
  sat: ScheduleSlot[] = []
): WeekSchedule {
  const week = createEmptyWeekSchedule();
  (['Senin', 'Selasa', 'Rabu', 'Kamis'] as DayName[]).forEach((d) => {
    week[d] = monThu.map((s) => ({ ...s }));
  });
  week["Jum'at"] = fri.map((s) => ({ ...s }));
  week.Sabtu = sat.map((s) => ({ ...s }));
  return week;
}

export const DEFAULT_PRESETS: PresetProfile[] = [
  {
    id: 'normal',
    name: 'Jadwal Normal',
    description: 'Jadwal KBM reguler Senin–Sabtu (45 menit/jam pelajaran).',
    schedule: fillWeek(normalWeekday, fridayNormal, normalWeekday),
  },
  {
    id: 'ujian',
    name: 'Jadwal Ujian (PTS/PAS)',
    description: 'Jadwal ringkas 2 sesi ujian per hari.',
    schedule: fillWeek(examWeekday, examWeekday, examWeekday),
  },
  {
    id: 'ramadhan',
    name: 'Jadwal Ramadhan',
    description: 'Durasi jam pelajaran dipersingkat 35 menit & pulang lebih awal.',
    schedule: fillWeek(ramadhanWeekday, ramadhanWeekday, ramadhanWeekday),
  },
];

export function cloneWeekSchedule(schedule: WeekSchedule): WeekSchedule {
  const copy = createEmptyWeekSchedule();
  for (const day of DAYS_OF_WEEK) {
    copy[day] = (schedule[day] || []).map((slot, idx) => ({
      ...slot,
      slot: idx + 1,
    }));
  }
  return copy;
}
