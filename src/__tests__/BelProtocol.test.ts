/// <reference types="jest" />
import { BelProtocol, MAX_SLOTS_PER_DAY } from '@/services/protocol/BelProtocol';
import { withTimeout } from '@/services/device/DeviceAdapter';
import { DEFAULT_PRESETS } from '@/utils/presets';

describe('BelProtocol', () => {
  it('encodes play and stop MP3 commands', () => {
    expect(BelProtocol.encodePlayMp3(5)).toBe('1/5\n');
    expect(BelProtocol.encodeStopMp3()).toBe('2/\n');
  });

  it('encodes auto sync time and manual time', () => {
    const date = new Date(2026, 10, 24, 7, 5, 9); // 24 Nov 2026 07:05:09 (Selasa = day 2 -> weekday 3)
    expect(BelProtocol.encodeAutoSyncTime(date)).toBe('3/07:05:09:3:24:11:26\n');
    expect(BelProtocol.encodeManualTime(date)).toBe('4/07:05:00-24-11-26\n');
  });

  it('encodes check, copy, and reset schedule commands', () => {
    expect(BelProtocol.encodeCheckSchedule('Senin')).toBe('5/Senin\n');
    expect(BelProtocol.encodeResetSchedule()).toBe('6/\n');
    expect(BelProtocol.encodeCopySchedule('Senin', 'Selasa')).toBe(
      '8/Senin,Selasa\n'
    );
  });

  it('encodes 30 slots for setSchedule', () => {
    const cmd = BelProtocol.encodeSetSchedule('Senin', [
      { slot: 1, time: '07:00', mp3: 1, enabled: true },
      { slot: 2, time: '09:15', mp3: 4, enabled: false },
    ]);
    expect(cmd.startsWith('7/Senin#07:00,1;00:00,0;')).toBe(true);
    expect(cmd.endsWith('\n')).toBe(true);
    const body = cmd.slice('7/Senin#'.length, -1);
    expect(body.split(';')).toHaveLength(MAX_SLOTS_PER_DAY);
  });

  it('parses schedule response text', () => {
    const parsed = BelProtocol.parseScheduleResponse(
      'Senin#07:00,1;09:15,4;00:00,0'
    );
    expect(parsed).toHaveLength(3);
    expect(parsed[0]).toEqual({ slot: 1, time: '07:00', mp3: 1, enabled: true });
    expect(parsed[2]).toEqual({ slot: 3, time: '00:00', mp3: 0, enabled: false });
  });

  it('builds Wi-Fi endpoints cleanly', () => {
    expect(BelProtocol.wifiEndpoint('setJadwal', 'http://192.168.4.1/')).toBe(
      'http://192.168.4.1/setJadwal'
    );
  });
});

describe('Anti-ANR Timeout & Presets', () => {
  it('rejects hanging promises within timeoutMs', async () => {
    const never = new Promise<string>(() => {});
    await expect(
      withTimeout(never, 50, 'Timeout test')
    ).rejects.toThrow('Timeout test');
  });

  it('provides 3 default presets (Normal, Ujian, Ramadhan)', () => {
    expect(DEFAULT_PRESETS.map((p) => p.id)).toEqual([
      'normal',
      'ujian',
      'ramadhan',
    ]);
  });
});
