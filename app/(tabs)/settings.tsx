import { Ionicons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ThemePreference, useAppStore } from '@/store/useAppStore';
import { useTheme } from '@/theme/useTheme';
import { exportScheduleBackup, importScheduleBackup } from '@/utils/backup';

export default function SettingsScreen() {
  const { colors } = useTheme();
  const {
    mode,
    status,
    wifiBaseUrl,
    pairedDevices,
    busy,
    themePreference,
    schedule,
    presets,
    setMode,
    setWifiBaseUrl,
    setThemePreference,
    scanBluetoothDevices,
    connectDevice,
    disconnectDevice,
    restoreBackup,
    resetDeviceSchedule,
  } = useAppStore();

  const handleBackup = async () => {
    try {
      await exportScheduleBackup(schedule, presets);
    } catch (err) {
      Alert.alert(
        'Gagal Backup',
        err instanceof Error ? err.message : 'Tidak dapat mengekspor jadwal.'
      );
    }
  };

  const handleRestore = async () => {
    try {
      const payload = await importScheduleBackup();
      if (!payload) return;
      restoreBackup(payload.schedule, payload.presets);
      Alert.alert('Berhasil', 'Jadwal berhasil dipulihkan dari file backup JSON.');
    } catch (err) {
      Alert.alert(
        'Gagal Restore',
        err instanceof Error ? err.message : 'File backup tidak valid.'
      );
    }
  };

  const handleResetDevice = () => {
    Alert.alert(
      'Reset Jadwal Perangkat?',
      'Semua jadwal yang tersimpan di memori Bel Sekolah akan dihapus. Lanjutkan?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Reset Sekarang',
          style: 'destructive',
          onPress: async () => {
            const ok = await resetDeviceSchedule();
            if (ok) {
              Alert.alert('Berhasil', 'Jadwal perangkat telah direset.');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Mode Koneksi */}
      <View
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.cardTitle, { color: colors.text }]}>
          Mode Koneksi Perangkat
        </Text>
        <View style={styles.segmentRow}>
          {(['bluetooth', 'wifi'] as const).map((m) => {
            const active = mode === m;
            return (
              <Pressable
                key={m}
                onPress={() => setMode(m)}
                style={[
                  styles.segmentBtn,
                  {
                    backgroundColor: active ? colors.primary : colors.surfaceAlt,
                  },
                ]}
              >
                <Ionicons
                  name={m === 'bluetooth' ? 'bluetooth' : 'wifi'}
                  size={16}
                  color={active ? colors.primaryText : colors.text}
                />
                <Text
                  style={{
                    color: active ? colors.primaryText : colors.text,
                    fontWeight: '700',
                  }}
                >
                  {m === 'bluetooth' ? 'Bluetooth SPP' : 'Wi-Fi AP'}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {mode === 'bluetooth' ? (
          <View style={{ gap: 10, marginTop: 4 }}>
            <Pressable
              disabled={busy}
              onPress={scanBluetoothDevices}
              style={[styles.actionBtn, { backgroundColor: colors.surfaceAlt }]}
            >
              {busy ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Ionicons name="search" size={18} color={colors.primary} />
              )}
              <Text style={{ color: colors.text, fontWeight: '600' }}>
                Muat Perangkat Bluetooth Terpasang (Paired)
              </Text>
            </Pressable>

            {pairedDevices.map((dev) => (
              <Pressable
                key={dev.address}
                onPress={() => connectDevice(dev.address, dev.name)}
                style={[
                  styles.deviceRow,
                  {
                    borderColor: colors.border,
                    backgroundColor: colors.surfaceAlt,
                  },
                ]}
              >
                <View>
                  <Text style={{ color: colors.text, fontWeight: '700' }}>
                    {dev.name}
                  </Text>
                  <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                    {dev.address}
                  </Text>
                </View>
                <Text style={{ color: colors.primary, fontWeight: '700' }}>
                  Hubungkan
                </Text>
              </Pressable>
            ))}
          </View>
        ) : (
          <View style={{ gap: 10, marginTop: 4 }}>
            <Text style={{ color: colors.textMuted, fontSize: 12 }}>
              Alamat Access Point Bel (default: http://192.168.4.1)
            </Text>
            <TextInput
              value={wifiBaseUrl}
              onChangeText={setWifiBaseUrl}
              autoCapitalize="none"
              style={[
                styles.input,
                { borderColor: colors.border, color: colors.text },
              ]}
            />
            <Pressable
              disabled={busy}
              onPress={() => connectDevice(wifiBaseUrl, 'Bel Wi-Fi AP')}
              style={[styles.actionBtn, { backgroundColor: colors.primary }]}
            >
              <Ionicons name="wifi" size={18} color={colors.primaryText} />
              <Text style={{ color: colors.primaryText, fontWeight: '700' }}>
                Uji & Hubungkan Wi-Fi
              </Text>
            </Pressable>
          </View>
        )}

        {status === 'connected' ? (
          <Pressable
            onPress={disconnectDevice}
            style={[styles.actionBtn, { backgroundColor: `${colors.danger}18` }]}
          >
            <Ionicons name="close-circle" size={18} color={colors.danger} />
            <Text style={{ color: colors.danger, fontWeight: '700' }}>
              Putuskan Koneksi
            </Text>
          </Pressable>
        ) : null}
      </View>

      {/* Tampilan / Dark Mode */}
      <View
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.cardTitle, { color: colors.text }]}>
          Tema Tampilan (Dark Mode)
        </Text>
        <View style={styles.segmentRow}>
          {(
            [
              ['system', 'Sistem'],
              ['light', 'Terang'],
              ['dark', 'Gelap'],
            ] as Array<[ThemePreference, string]>
          ).map(([pref, label]) => {
            const active = themePreference === pref;
            return (
              <Pressable
                key={pref}
                onPress={() => setThemePreference(pref)}
                style={[
                  styles.segmentBtn,
                  {
                    backgroundColor: active ? colors.primary : colors.surfaceAlt,
                  },
                ]}
              >
                <Text
                  style={{
                    color: active ? colors.primaryText : colors.text,
                    fontWeight: '700',
                    fontSize: 13,
                  }}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Backup & Restore JSON */}
      <View
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.cardTitle, { color: colors.text }]}>
          Backup & Restore Jadwal (JSON)
        </Text>
        <View style={styles.segmentRow}>
          <Pressable
            onPress={handleBackup}
            style={[styles.segmentBtn, { backgroundColor: colors.surfaceAlt }]}
          >
            <Ionicons name="download-outline" size={18} color={colors.primary} />
            <Text style={{ color: colors.text, fontWeight: '700' }}>
              Ekspor JSON
            </Text>
          </Pressable>
          <Pressable
            onPress={handleRestore}
            style={[styles.segmentBtn, { backgroundColor: colors.surfaceAlt }]}
          >
            <Ionicons name="folder-open-outline" size={18} color={colors.primary} />
            <Text style={{ color: colors.text, fontWeight: '700' }}>
              Impor JSON
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Zona Berbahaya */}
      <View
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.cardTitle, { color: colors.danger }]}>
          Reset Perangkat
        </Text>
        <Pressable
          disabled={busy}
          onPress={handleResetDevice}
          style={[styles.actionBtn, { backgroundColor: colors.danger }]}
        >
          <Ionicons name="warning-outline" size={18} color="#FFFFFF" />
          <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>
            Hapus Semua Jadwal di Perangkat
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 14, paddingBottom: 32 },
  card: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 10 },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  segmentRow: { flexDirection: 'row', gap: 8 },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 11,
    borderRadius: 10,
  },
  deviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
  },
});
