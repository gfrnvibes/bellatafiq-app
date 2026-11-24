export const DAYS_OF_WEEK = [
  'Minggu',
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  "Jum'at",
  'Sabtu',
] as const;

export type DayName = (typeof DAYS_OF_WEEK)[number];

export interface ScheduleSlot {
  slot: number; // 1..30
  time: string; // "HH:MM"
  mp3: number; // 0 = off / no mp3, 1..99 = nomor file mp3
  enabled: boolean;
  label?: string;
}

export type WeekSchedule = Record<DayName, ScheduleSlot[]>;

export type ConnectionMode = 'bluetooth' | 'wifi';

export type ConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'error';

export interface BluetoothDeviceInfo {
  id: string;
  name: string;
  address: string;
  bonded: boolean;
}

export interface PresetProfile {
  id: string;
  name: string;
  description: string;
  schedule: WeekSchedule;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  mode: ConnectionMode;
  message: string;
  ok: boolean;
}

export interface BackupPayload {
  version: 1;
  exportedAt: string;
  appName: 'Bel Sekolah Modern';
  schedule: WeekSchedule;
  presets: PresetProfile[];
}
