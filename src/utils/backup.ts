import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { BackupPayload, DAYS_OF_WEEK, PresetProfile, WeekSchedule } from '@/types/bell';

export function buildBackupPayload(
  schedule: WeekSchedule,
  presets: PresetProfile[]
): BackupPayload {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    appName: 'Bel Sekolah Modern',
    schedule,
    presets,
  };
}

export function validateBackupJson(rawJson: string): BackupPayload {
  const parsed = JSON.parse(rawJson) as Partial<BackupPayload>;
  if (!parsed || parsed.version !== 1 || !parsed.schedule) {
    throw new Error('Format file backup tidak valid atau bukan versi 1.');
  }

  for (const day of DAYS_OF_WEEK) {
    if (!Array.isArray(parsed.schedule[day])) {
      throw new Error(`Data jadwal hari ${day} tidak ditemukan di file backup.`);
    }
  }

  return {
    version: 1,
    exportedAt: parsed.exportedAt || new Date().toISOString(),
    appName: 'Bel Sekolah Modern',
    schedule: parsed.schedule,
    presets: Array.isArray(parsed.presets) ? parsed.presets : [],
  };
}

export async function exportScheduleBackup(
  schedule: WeekSchedule,
  presets: PresetProfile[]
): Promise<string> {
  const payload = buildBackupPayload(schedule, presets);
  const fileName = `backup-bel-sekolah-${new Date()
    .toISOString()
    .slice(0, 10)}.json`;
  const fileUri = `${FileSystem.cacheDirectory}${fileName}`;
  await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(payload, null, 2), {
    encoding: FileSystem.EncodingType.UTF8,
  });

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(fileUri, {
      mimeType: 'application/json',
      dialogTitle: 'Simpan / Bagikan Backup Jadwal Bel',
    });
  }
  return fileUri;
}

export async function importScheduleBackup(): Promise<BackupPayload | null> {
  const picked = await DocumentPicker.getDocumentAsync({
    type: ['application/json', 'text/plain'],
    copyToCacheDirectory: true,
  });

  if (picked.canceled || !picked.assets?.length) {
    return null;
  }

  const content = await FileSystem.readAsStringAsync(picked.assets[0].uri, {
    encoding: FileSystem.EncodingType.UTF8,
  });
  return validateBackupJson(content);
}
