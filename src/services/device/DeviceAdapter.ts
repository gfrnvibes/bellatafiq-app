export interface CommandResult {
  ok: boolean;
  data?: string;
  error?: string;
}

export interface DeviceAdapter {
  connect(target: string): Promise<CommandResult>;
  disconnect(): Promise<void>;
  isConnected(): Promise<boolean>;
  sendCommand(
    payload: string,
    wifiEndpoint?: string,
    timeoutMs?: number
  ): Promise<CommandResult>;
}

/**
 * Membungkus Promise dengan batas waktu agar UI tidak pernah menunggu tanpa batas (anti-ANR).
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage = 'Koneksi ke perangkat habis waktu (timeout).'
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}
