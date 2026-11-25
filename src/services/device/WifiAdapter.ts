import { BelProtocol, DEFAULT_WIFI_BASE_URL } from '@/services/protocol/BelProtocol';
import { CommandResult, DeviceAdapter } from './DeviceAdapter';

const DEFAULT_WIFI_TIMEOUT_MS = 4000;

/**
 * Adapter Wi-Fi untuk perangkat Bel Hadetech (default AP http://192.168.4.1/).
 * Menggunakan AbortController agar permintaan HTTP tidak pernah menggantung.
 */
export class WifiAdapter implements DeviceAdapter {
  private baseUrl: string = DEFAULT_WIFI_BASE_URL;
  private connected = false;

  setBaseUrl(url: string) {
    this.baseUrl = url.trim() || DEFAULT_WIFI_BASE_URL;
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  async connect(targetUrl?: string): Promise<CommandResult> {
    if (targetUrl) {
      this.setBaseUrl(targetUrl);
    }
    const res = await this.sendCommand('', 'infoDevice', DEFAULT_WIFI_TIMEOUT_MS);
    this.connected = res.ok;
    return res;
  }

  async disconnect(): Promise<void> {
    this.connected = false;
  }

  async isConnected(): Promise<boolean> {
    return this.connected;
  }

  async sendCommand(
    payload: string,
    wifiEndpoint: string = 'infoDevice',
    timeoutMs: number = DEFAULT_WIFI_TIMEOUT_MS
  ): Promise<CommandResult> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const url = BelProtocol.wifiEndpoint(
        wifiEndpoint as Parameters<typeof BelProtocol.wifiEndpoint>[0],
        this.baseUrl
      );

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: payload,
        signal: controller.signal,
      });

      const text = await response.text();
      if (!response.ok) {
        return {
          ok: false,
          error: `Perangkat merespons status HTTP ${response.status}.`,
        };
      }

      this.connected = true;
      return { ok: true, data: text };
    } catch (err) {
      this.connected = false;
      if (err instanceof Error && err.name === 'AbortError') {
        return {
          ok: false,
          error:
            'Pastikan Wi-Fi HP terhubung ke Access Point Bel Sekolah (192.168.4.1).',
        };
      }
      return {
        ok: false,
        error:
          err instanceof Error
            ? err.message
            : 'Gagal terhubung ke Wi-Fi Bel Sekolah.',
      };
    } finally {
      clearTimeout(timer);
    }
  }
}
