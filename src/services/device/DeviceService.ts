import { BelProtocol } from '@/services/protocol/BelProtocol';
import { ConnectionMode, DayName, ScheduleSlot } from '@/types/bell';
import { BluetoothSppAdapter } from './BluetoothSppAdapter';
import { CommandResult, DeviceAdapter } from './DeviceAdapter';
import { WifiAdapter } from './WifiAdapter';

/**
 * Facade layanan perangkat dengan antrean perintah berurutan (Command Queue)
 * untuk mencegah tabrakan data serial dan menghindari UI freeze / ANR.
 */
export class DeviceService {
  readonly bluetooth = new BluetoothSppAdapter();
  readonly wifi = new WifiAdapter();
  private mode: ConnectionMode = 'bluetooth';
  private queue: Promise<unknown> = Promise.resolve();

  setMode(mode: ConnectionMode) {
    this.mode = mode;
  }

  getMode(): ConnectionMode {
    return this.mode;
  }

  private getAdapter(): DeviceAdapter {
    return this.mode === 'bluetooth' ? this.bluetooth : this.wifi;
  }

  private enqueue<T>(task: () => Promise<T>): Promise<T> {
    const next = this.queue.then(task, task);
    this.queue = next.catch(() => undefined);
    return next;
  }

  connect(target: string): Promise<CommandResult> {
    return this.enqueue(() => this.getAdapter().connect(target));
  }

  disconnect(): Promise<void> {
    return this.enqueue(() => this.getAdapter().disconnect());
  }

  syncTime(date: Date = new Date(), manual = false): Promise<CommandResult> {
    const payload = manual
      ? BelProtocol.encodeManualTime(date)
      : BelProtocol.encodeAutoSyncTime(date);
    return this.enqueue(() => this.getAdapter().sendCommand(payload, 'setWaktu'));
  }

  playMp3(mp3Number: number): Promise<CommandResult> {
    const payload = BelProtocol.encodePlayMp3(mp3Number);
    return this.enqueue(() => this.getAdapter().sendCommand(payload, 'playMP3'));
  }

  stopMp3(): Promise<CommandResult> {
    const payload = BelProtocol.encodeStopMp3();
    return this.enqueue(() => this.getAdapter().sendCommand(payload, 'stopMP3'));
  }

  checkSchedule(day: DayName): Promise<CommandResult> {
    const payload = BelProtocol.encodeCheckSchedule(day);
    return this.enqueue(() => this.getAdapter().sendCommand(payload, 'cekJadwal'));
  }

  sendSchedule(day: DayName, slots: ScheduleSlot[]): Promise<CommandResult> {
    const payload = BelProtocol.encodeSetSchedule(day, slots);
    return this.enqueue(() => this.getAdapter().sendCommand(payload, 'setJadwal'));
  }

  copySchedule(fromDay: DayName, toDay: DayName): Promise<CommandResult> {
    const payload = BelProtocol.encodeCopySchedule(fromDay, toDay);
    return this.enqueue(() => this.getAdapter().sendCommand(payload, 'copyJadwal'));
  }

  resetDeviceSchedule(): Promise<CommandResult> {
    const payload = BelProtocol.encodeResetSchedule();
    return this.enqueue(() =>
      this.getAdapter().sendCommand(payload, 'resetJadwal')
    );
  }
}

export const deviceService = new DeviceService();
