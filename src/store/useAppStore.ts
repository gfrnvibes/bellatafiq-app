import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { deviceService } from '@/services/device/DeviceService';
import { DEFAULT_WIFI_BASE_URL } from '@/services/protocol/BelProtocol';
import {
  ActivityLog,
  BluetoothDeviceInfo,
  ConnectionMode,
  ConnectionStatus,
  DayName,
  PresetProfile,
  ScheduleSlot,
  WeekSchedule,
} from '@/types/bell';
import { cloneWeekSchedule, DEFAULT_PRESETS } from '@/utils/presets';

export type ThemePreference = 'system' | 'light' | 'dark';

interface AppState {
  mode: ConnectionMode;
  status: ConnectionStatus;
  connectedTargetName: string;
  wifiBaseUrl: string;
  lastError: string | null;
  busy: boolean;
  pairedDevices: BluetoothDeviceInfo[];

  themePreference: ThemePreference;
  activePresetId: string;
  presets: PresetProfile[];
  schedule: WeekSchedule;
  logs: ActivityLog[];

  setMode: (mode: ConnectionMode) => void;
  setWifiBaseUrl: (url: string) => void;
  setThemePreference: (pref: ThemePreference) => void;
  clearError: () => void;

  scanBluetoothDevices: () => Promise<void>;
  connectDevice: (target: string, displayName?: string) => Promise<boolean>;
  disconnectDevice: () => Promise<void>;

  addOrUpdateSlot: (day: DayName, slot: ScheduleSlot) => void;
  removeSlot: (day: DayName, slotNumber: number) => void;
  toggleSlot: (day: DayName, slotNumber: number) => void;
  copyDayScheduleLocal: (fromDay: DayName, toDay: DayName) => void;
  applyPreset: (presetId: string) => void;
  restoreBackup: (schedule: WeekSchedule, presets?: PresetProfile[]) => void;

  syncTimeToDevice: (date?: Date, manual?: boolean) => Promise<boolean>;
  sendDayScheduleToDevice: (day: DayName) => Promise<boolean>;
  fetchDayScheduleFromDevice: (day: DayName) => Promise<boolean>;
  copyDayScheduleOnDevice: (fromDay: DayName, toDay: DayName) => Promise<boolean>;
  resetDeviceSchedule: () => Promise<boolean>;
  playMp3OnDevice: (mp3Number: number) => Promise<boolean>;
  stopMp3OnDevice: () => Promise<boolean>;
}

function makeLog(mode: ConnectionMode, message: string, ok: boolean): ActivityLog {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toLocaleTimeString('id-ID', { hour12: false }),
    mode,
    message,
    ok,
  };
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      mode: 'bluetooth',
      status: 'disconnected',
      connectedTargetName: '',
      wifiBaseUrl: DEFAULT_WIFI_BASE_URL,
      lastError: null,
      busy: false,
      pairedDevices: [],

      themePreference: 'system',
      activePresetId: DEFAULT_PRESETS[0].id,
      presets: DEFAULT_PRESETS,
      schedule: cloneWeekSchedule(DEFAULT_PRESETS[0].schedule),
      logs: [],

      setMode: (mode) => {
        deviceService.setMode(mode);
        set({ mode, status: 'disconnected', connectedTargetName: '', lastError: null });
      },

      setWifiBaseUrl: (wifiBaseUrl) => {
        deviceService.wifi.setBaseUrl(wifiBaseUrl);
        set({ wifiBaseUrl });
      },

      setThemePreference: (themePreference) => set({ themePreference }),
      clearError: () => set({ lastError: null }),

      scanBluetoothDevices: async () => {
        set({ busy: true, lastError: null });
        try {
          const devices = await deviceService.bluetooth.listPairedDevices();
          set({ pairedDevices: devices, busy: false });
        } catch (err) {
          const msg =
            err instanceof Error ? err.message : 'Gagal memindai Bluetooth.';
          set((s) => ({
            busy: false,
            lastError: msg,
            logs: [makeLog('bluetooth', msg, false), ...s.logs].slice(0, 30),
          }));
        }
      },

      connectDevice: async (target, displayName) => {
        const { mode } = get();
        deviceService.setMode(mode);
        set({ status: 'connecting', busy: true, lastError: null });
        const res = await deviceService.connect(target);
        if (res.ok) {
          const name = displayName || res.data || target;
          set((s) => ({
            status: 'connected',
            connectedTargetName: name,
            busy: false,
            logs: [makeLog(mode, `Terhubung ke ${name}`, true), ...s.logs].slice(0, 30),
          }));
          return true;
        }
        const errMsg = res.error || 'Gagal terhubung ke perangkat.';
        set((s) => ({
          status: 'error',
          busy: false,
          lastError: errMsg,
          logs: [makeLog(mode, errMsg, false), ...s.logs].slice(0, 30),
        }));
        return false;
      },

      disconnectDevice: async () => {
        const { mode } = get();
        await deviceService.disconnect();
        set((s) => ({
          status: 'disconnected',
          connectedTargetName: '',
          logs: [makeLog(mode, 'Koneksi diputus', true), ...s.logs].slice(0, 30),
        }));
      },

      addOrUpdateSlot: (day, slot) =>
        set((s) => {
          const existing = [...s.schedule[day]];
          const idx = existing.findIndex((item) => item.slot === slot.slot);
          if (idx >= 0) {
            existing[idx] = slot;
          } else {
            existing.push(slot);
          }
          existing.sort((a, b) => a.time.localeCompare(b.time));
          const reindexed = existing.map((item, i) => ({ ...item, slot: i + 1 }));
          return {
            schedule: { ...s.schedule, [day]: reindexed },
          };
        }),

      removeSlot: (day, slotNumber) =>
        set((s) => {
          const filtered = s.schedule[day]
            .filter((item) => item.slot !== slotNumber)
            .map((item, i) => ({ ...item, slot: i + 1 }));
          return { schedule: { ...s.schedule, [day]: filtered } };
        }),

      toggleSlot: (day, slotNumber) =>
        set((s) => ({
          schedule: {
            ...s.schedule,
            [day]: s.schedule[day].map((item) =>
              item.slot === slotNumber ? { ...item, enabled: !item.enabled } : item
            ),
          },
        })),

      copyDayScheduleLocal: (fromDay, toDay) =>
        set((s) => ({
          schedule: {
            ...s.schedule,
            [toDay]: s.schedule[fromDay].map((slot, i) => ({ ...slot, slot: i + 1 })),
          },
        })),

      applyPreset: (presetId) =>
        set((s) => {
          const found = s.presets.find((p) => p.id === presetId);
          if (!found) return s;
          return {
            activePresetId: presetId,
            schedule: cloneWeekSchedule(found.schedule),
          };
        }),

      restoreBackup: (schedule, presets) =>
        set((s) => ({
          schedule: cloneWeekSchedule(schedule),
          presets: presets && presets.length > 0 ? presets : s.presets,
        })),

      syncTimeToDevice: async (date = new Date(), manual = false) => {
        const { mode } = get();
        set({ busy: true, lastError: null });
        const res = await deviceService.syncTime(date, manual);
        set((s) => ({
          busy: false,
          lastError: res.ok ? null : res.error || 'Gagal sinkronisasi waktu.',
          logs: [
            makeLog(
              mode,
              res.ok
                ? `Waktu disinkronkan (${date.toLocaleTimeString('id-ID')})`
                : res.error || 'Gagal sinkronisasi waktu',
              res.ok
            ),
            ...s.logs,
          ].slice(0, 30),
        }));
        return res.ok;
      },

      sendDayScheduleToDevice: async (day) => {
        const { mode, schedule } = get();
        set({ busy: true, lastError: null });
        const res = await deviceService.sendSchedule(day, schedule[day]);
        set((s) => ({
          busy: false,
          lastError: res.ok ? null : res.error || 'Gagal mengirim jadwal.',
          logs: [
            makeLog(
              mode,
              res.ok ? `Jadwal ${day} terkirim ke perangkat` : res.error || 'Gagal',
              res.ok
            ),
            ...s.logs,
          ].slice(0, 30),
        }));
        return res.ok;
      },

      fetchDayScheduleFromDevice: async (day) => {
        const { mode } = get();
        set({ busy: true, lastError: null });
        const res = await deviceService.checkSchedule(day);
        set((s) => ({
          busy: false,
          lastError: res.ok ? null : res.error || 'Gagal mengecek jadwal.',
          logs: [
            makeLog(
              mode,
              res.ok ? `Cek jadwal ${day} berhasil` : res.error || 'Gagal',
              res.ok
            ),
            ...s.logs,
          ].slice(0, 30),
        }));
        return res.ok;
      },

      copyDayScheduleOnDevice: async (fromDay, toDay) => {
        const { mode } = get();
        set({ busy: true, lastError: null });
        const res = await deviceService.copySchedule(fromDay, toDay);
        if (res.ok) {
          get().copyDayScheduleLocal(fromDay, toDay);
        }
        set((s) => ({
          busy: false,
          lastError: res.ok ? null : res.error || 'Gagal menyalin jadwal.',
          logs: [
            makeLog(
              mode,
              res.ok
                ? `Jadwal ${fromDay} disalin ke ${toDay}`
                : res.error || 'Gagal',
              res.ok
            ),
            ...s.logs,
          ].slice(0, 30),
        }));
        return res.ok;
      },

      resetDeviceSchedule: async () => {
        const { mode } = get();
        set({ busy: true, lastError: null });
        const res = await deviceService.resetDeviceSchedule();
        set((s) => ({
          busy: false,
          lastError: res.ok ? null : res.error || 'Gagal mereset jadwal.',
          logs: [
            makeLog(
              mode,
              res.ok ? 'Jadwal perangkat berhasil direset' : res.error || 'Gagal',
              res.ok
            ),
            ...s.logs,
          ].slice(0, 30),
        }));
        return res.ok;
      },

      playMp3OnDevice: async (mp3Number) => {
        const { mode } = get();
        set({ busy: true, lastError: null });
        const res = await deviceService.playMp3(mp3Number);
        set((s) => ({
          busy: false,
          lastError: res.ok ? null : res.error || 'Gagal memutar MP3.',
          logs: [
            makeLog(
              mode,
              res.ok ? `Memutar Nada MP3 #${mp3Number}` : res.error || 'Gagal',
              res.ok
            ),
            ...s.logs,
          ].slice(0, 30),
        }));
        return res.ok;
      },

      stopMp3OnDevice: async () => {
        const { mode } = get();
        set({ busy: true, lastError: null });
        const res = await deviceService.stopMp3();
        set((s) => ({
          busy: false,
          lastError: res.ok ? null : res.error || 'Gagal menghentikan MP3.',
          logs: [
            makeLog(
              mode,
              res.ok ? 'Pemutaran MP3 dihentikan' : res.error || 'Gagal',
              res.ok
            ),
            ...s.logs,
          ].slice(0, 30),
        }));
        return res.ok;
      },
    }),
    {
      name: 'bel-sekolah-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        mode: state.mode,
        wifiBaseUrl: state.wifiBaseUrl,
        themePreference: state.themePreference,
        activePresetId: state.activePresetId,
        presets: state.presets,
        schedule: state.schedule,
      }),
    }
  )
);
