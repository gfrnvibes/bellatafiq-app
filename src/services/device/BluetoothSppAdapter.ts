import { PermissionsAndroid, Platform } from 'react-native';
import type { BluetoothDevice } from 'react-native-bluetooth-classic';
import { BluetoothDeviceInfo } from '@/types/bell';
import { CommandResult, DeviceAdapter, withTimeout } from './DeviceAdapter';

function getBluetoothModule() {
  if (Platform.OS !== 'android') {
    throw new Error('Bluetooth Classic SPP hanya didukung di Android (Development Build).');
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mod = require('react-native-bluetooth-classic').default;
  if (!mod) {
    throw new Error('Modul Bluetooth Classic tidak tersedia di mode preview (Expo Go/Web).');
  }
  return mod;
}

const DEFAULT_BT_TIMEOUT_MS = 4500;

/**
 * Adapter Bluetooth Classic SPP (UUID 00001101-0000-1000-8000-00805F9B34FB).
 * Semua operasi berjalan asynchronous dengan timeout agar tidak memblokir UI thread.
 */
export class BluetoothSppAdapter implements DeviceAdapter {
  private activeDevice: BluetoothDevice | null = null;

  async requestPermissions(): Promise<boolean> {
    if (Platform.OS !== 'android') return false;
    if (Platform.Version >= 31) {
      const result = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);
      return (
        result[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] ===
          PermissionsAndroid.RESULTS.GRANTED &&
        result[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] ===
          PermissionsAndroid.RESULTS.GRANTED
      );
    }

    const loc = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );
    return loc === PermissionsAndroid.RESULTS.GRANTED;
  }

  async listPairedDevices(): Promise<BluetoothDeviceInfo[]> {
    const granted = await this.requestPermissions();
    if (!granted) {
      throw new Error(
        'Izin Bluetooth ditolak. Aktifkan izin Perangkat Sekitar di Pengaturan.'
      );
    }

    const bt = getBluetoothModule();
    const enabled = await bt.isBluetoothEnabled();
    if (!enabled) {
      await bt.requestBluetoothEnabled();
    }

    const bonded: BluetoothDevice[] = await withTimeout(
      bt.getBondedDevices(),
      DEFAULT_BT_TIMEOUT_MS,
      'Gagal membaca daftar perangkat Bluetooth.'
    );

    return bonded.map((d) => ({
      id: d.id,
      name: d.name || 'Perangkat Tanpa Nama',
      address: d.address,
      bonded: true,
    }));
  }

  async connect(address: string): Promise<CommandResult> {
    try {
      const granted = await this.requestPermissions();
      if (!granted) {
        return { ok: false, error: 'Izin Bluetooth belum diberikan.' };
      }

      if (this.activeDevice) {
        await this.disconnect();
      }

      const bt = getBluetoothModule();
      const device = await withTimeout(
        bt.connectToDevice(address, {
          delimiter: '\n',
        }),
        DEFAULT_BT_TIMEOUT_MS,
        'Timeout saat menghubungkan ke modul Bluetooth Bel Sekolah.'
      ) as BluetoothDevice;

      this.activeDevice = device;
      return { ok: true, data: device.name || address };
    } catch (err) {
      this.activeDevice = null;
      return {
        ok: false,
        error:
          err instanceof Error
            ? err.message
            : 'Gagal terhubung ke perangkat Bluetooth.',
      };
    }
  }

  async disconnect(): Promise<void> {
    if (!this.activeDevice) return;
    try {
      await this.activeDevice.disconnect();
    } catch {
      // Abaikan error saat menutup socket yang sudah terputus
    } finally {
      this.activeDevice = null;
    }
  }

  async isConnected(): Promise<boolean> {
    if (!this.activeDevice) return false;
    try {
      return await this.activeDevice.isConnected();
    } catch {
      return false;
    }
  }

  async sendCommand(
    payload: string,
    _wifiEndpoint?: string,
    timeoutMs: number = DEFAULT_BT_TIMEOUT_MS
  ): Promise<CommandResult> {
    if (!this.activeDevice) {
      return { ok: false, error: 'Bluetooth belum terhubung ke Bel Sekolah.' };
    }

    try {
      const connected = await this.isConnected();
      if (!connected) {
        this.activeDevice = null;
        return {
          ok: false,
          error: 'Koneksi Bluetooth terputus. Silakan hubungkan ulang.',
        };
      }

      const written = await withTimeout(
        this.activeDevice.write(payload),
        timeoutMs,
        'Timeout saat mengirim perintah melalui Bluetooth.'
      );

      if (!written) {
        return { ok: false, error: 'Gagal menulis data ke perangkat Bluetooth.' };
      }

      // Baca balasan jika tersedia secara non-blocking
      const available = await this.activeDevice.available();
      let responseText = '';
      if (available > 0) {
        const raw = await withTimeout(
          this.activeDevice.read(),
          1500,
          'Timeout membaca respons perangkat.'
        );
        responseText = typeof raw === 'string' ? raw : '';
      }

      return { ok: true, data: responseText };
    } catch (err) {
      return {
        ok: false,
        error:
          err instanceof Error
            ? err.message
            : 'Terjadi kesalahan komunikasi Bluetooth.',
      };
    }
  }
}
