import { DAYS_OF_WEEK, DayName, ScheduleSlot } from '@/types/bell';

export const MAX_SLOTS_PER_DAY = 30;
export const DEFAULT_WIFI_BASE_URL = 'http://192.168.4.1';

const pad2 = (n: number): string => String(n).padStart(2, '0');

/**
 * Menghasilkan payload protokol perangkat Bel Hadetech (Bluetooth Classic SPP & Wi-Fi).
 * Format diselaraskan dengan hasil analisis Bel_Hadetech.apk:
 * - Bluetooth SPP: prefix numerik 1/ .. 8/ diakhiri '\n'
 * - Wi-Fi: HTTP POST ke http://192.168.4.1/<endpoint>
 */
export const BelProtocol = {
  /** 1/<mp3>\n — Putar nada MP3 */
  encodePlayMp3(mp3Number: number): string {
    const id = Math.max(1, Math.min(999, Math.floor(mp3Number)));
    return `1/${id}\n`;
  },

  /** 2/\n — Hentikan pemutaran MP3 */
  encodeStopMp3(): string {
    return '2/\n';
  },

  /** 3/<HH:mm:ss>:<weekday>:<dd:MM:yy>\n — Auto sinkronisasi waktu */
  encodeAutoSyncTime(date: Date): string {
    const hh = pad2(date.getHours());
    const mm = pad2(date.getMinutes());
    const ss = pad2(date.getSeconds());
    const weekday = date.getDay() + 1; // 1 = Minggu .. 7 = Sabtu
    const dd = pad2(date.getDate());
    const mo = pad2(date.getMonth() + 1);
    const yy = pad2(date.getFullYear() % 100);
    return `3/${hh}:${mm}:${ss}:${weekday}:${dd}:${mo}:${yy}\n`;
  },

  /** 4/<HH:mm:00>-<dd-MM-yy>\n — Atur waktu manual */
  encodeManualTime(date: Date): string {
    const hh = pad2(date.getHours());
    const mm = pad2(date.getMinutes());
    const dd = pad2(date.getDate());
    const mo = pad2(date.getMonth() + 1);
    const yy = pad2(date.getFullYear() % 100);
    return `4/${hh}:${mm}:00-${dd}-${mo}-${yy}\n`;
  },

  /** 5/<hari>\n — Cek jadwal hari tertentu */
  encodeCheckSchedule(day: DayName): string {
    return `5/${day}\n`;
  },

  /** 6/\n — Reset seluruh jadwal di perangkat */
  encodeResetSchedule(): string {
    return '6/\n';
  },

  /**
   * 7/<hari>#<HH:MM>,<mp3>;...\n — Simpan jadwal satu hari (maks 30 slot).
   * Slot yang tidak aktif dikirim sebagai 00:00,0.
   */
  encodeSetSchedule(day: DayName, slots: ScheduleSlot[]): string {
    const normalized = Array.from({ length: MAX_SLOTS_PER_DAY }, (_, idx) => {
      const slot = slots.find((s) => s.slot === idx + 1);
      if (!slot || !slot.enabled || slot.mp3 <= 0) {
        return '00:00,0';
      }
      return `${slot.time},${slot.mp3}`;
    });
    return `7/${day}#${normalized.join(';')}\n`;
  },

  /** 8/<dariHari>,<keHari>\n — Salin jadwal antar hari */
  encodeCopySchedule(fromDay: DayName, toDay: DayName): string {
    return `8/${fromDay},${toDay}\n`;
  },

  /** Daftar endpoint Wi-Fi untuk mode Access Point (192.168.4.1) */
  wifiEndpoint(
    action:
      | 'infoDevice'
      | 'setWaktu'
      | 'cekJadwal'
      | 'setJadwal'
      | 'copyJadwal'
      | 'resetJadwal'
      | 'playMP3'
      | 'stopMP3',
    baseUrl: string = DEFAULT_WIFI_BASE_URL
  ): string {
    const cleanBase = baseUrl.replace(/\/+$/, '');
    return `${cleanBase}/${action}`;
  },

  /** Parse respons teks jadwal dari perangkat menjadi array ScheduleSlot */
  parseScheduleResponse(raw: string): ScheduleSlot[] {
    const cleaned = raw.trim();
    if (!cleaned) return [];
    const payload = cleaned.includes('#') ? cleaned.split('#')[1] : cleaned;
    const parts = payload.split(';').filter(Boolean);
    return parts.slice(0, MAX_SLOTS_PER_DAY).map((entry, idx) => {
      const [timeRaw = '00:00', mp3Raw = '0'] = entry.split(',');
      const mp3 = Number.parseInt(mp3Raw, 10) || 0;
      const time = /^\d{2}:\d{2}$/.test(timeRaw.trim()) ? timeRaw.trim() : '00:00';
      return {
        slot: idx + 1,
        time,
        mp3,
        enabled: mp3 > 0 && time !== '00:00',
      };
    });
  },

  isValidDay(day: string): day is DayName {
    return (DAYS_OF_WEEK as readonly string[]).includes(day);
  },
};
