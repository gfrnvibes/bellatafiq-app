import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useAppStore } from '@/store/useAppStore';
import { useTheme } from '@/theme/useTheme';
import { DAYS_OF_WEEK } from '@/types/bell';

export default function DashboardScreen() {
  const { colors } = useTheme();
  const {
    mode,
    status,
    connectedTargetName,
    busy,
    lastError,
    schedule,
    logs,
    syncTimeToDevice,
    playMp3OnDevice,
    stopMp3OnDevice,
    clearError,
  } = useAppStore();

  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const todayName = DAYS_OF_WEEK[now.getDay()];
  const todaySlots = schedule[todayName].filter((s) => s.enabled);

  const statusColor =
    status === 'connected'
      ? colors.success
      : status === 'connecting'
      ? colors.warning
      : status === 'error'
      ? colors.danger
      : colors.textMuted;

  const statusLabel =
    status === 'connected'
      ? `Terhubung (${connectedTargetName || mode.toUpperCase()})`
      : status === 'connecting'
      ? 'Menghubungkan...'
      : status === 'error'
      ? 'Koneksi Gagal'
      : 'Belum Terhubung';

  const handleSyncTime = async () => {
    const ok = await syncTimeToDevice(new Date(), false);
    if (ok) {
      Alert.alert('Berhasil', 'Jam & tanggal perangkat berhasil disinkronkan.');
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Banner Brand Bellatafiq */}
      <View
        style={[
          styles.brandCard,
          { backgroundColor: '#FFFFFF', borderColor: colors.border },
        ]}
      >
        <Image
          source={require('../../assets/images/logo.png')}
          style={styles.brandLogo}
          resizeMode="contain"
        />
        <Text style={styles.brandSlogan}>Bell Sekolah Modern</Text>
      </View>

      {/* Kartu Status Koneksi */}
      <View
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <View style={styles.rowBetween}>
          <View style={styles.rowCenter}>
            <View
              style={[styles.dot, { backgroundColor: statusColor }]}
            />
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Status Perangkat
            </Text>
          </View>
          <View
            style={[
              styles.badge,
              { backgroundColor: colors.surfaceAlt },
            ]}
          >
            <Ionicons
              name={mode === 'bluetooth' ? 'bluetooth' : 'wifi'}
              size={14}
              color={colors.primary}
            />
            <Text style={[styles.badgeText, { color: colors.text }]}>
              {mode === 'bluetooth' ? 'Bluetooth SPP' : 'Wi-Fi AP'}
            </Text>
          </View>
        </View>

        <Text style={[styles.statusText, { color: statusColor }]}>
          {statusLabel}
        </Text>

        {lastError ? (
          <Pressable
            onPress={clearError}
            style={[styles.errorBanner, { backgroundColor: `${colors.danger}18` }]}
          >
            <Ionicons name="alert-circle" size={18} color={colors.danger} />
            <Text style={[styles.errorText, { color: colors.danger }]}>
              {lastError}
            </Text>
          </Pressable>
        ) : null}

        <Pressable
          onPress={() => router.push('/(tabs)/settings')}
          style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
        >
          <Ionicons
            name={status === 'connected' ? 'swap-horizontal' : 'link'}
            size={18}
            color={colors.primaryText}
          />
          <Text style={[styles.btnText, { color: colors.primaryText }]}>
            {status === 'connected'
              ? 'Kelola Koneksi'
              : 'Hubungkan ke Bel Sekolah'}
          </Text>
        </Pressable>
      </View>

      {/* Kartu Jam & Sinkronisasi */}
      <View
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.mutedLabel, { color: colors.textMuted }]}>
          WAKTU SAAT INI ({todayName.toUpperCase()})
        </Text>
        <Text style={[styles.clockText, { color: colors.text }]}>
          {now.toLocaleTimeString('id-ID', { hour12: false })}
        </Text>
        <Text style={[styles.dateText, { color: colors.textMuted }]}>
          {now.toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </Text>

        <Pressable
          disabled={busy}
          onPress={handleSyncTime}
          style={[
            styles.secondaryBtn,
            {
              backgroundColor: colors.surfaceAlt,
              opacity: busy ? 0.6 : 1,
            },
          ]}
        >
          {busy ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Ionicons name="time-outline" size={18} color={colors.primary} />
          )}
          <Text style={[styles.secondaryBtnText, { color: colors.text }]}>
            Sinkronkan Waktu ke Perangkat
          </Text>
        </Pressable>
      </View>

      {/* Aksi Cepat */}
      <View style={styles.quickRow}>
        <Pressable
          disabled={busy}
          onPress={() => playMp3OnDevice(1)}
          style={[
            styles.quickCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Ionicons name="notifications" size={24} color={colors.primary} />
          <Text style={[styles.quickTitle, { color: colors.text }]}>
            Bunyikan Bel #1
          </Text>
          <Text style={[styles.quickSub, { color: colors.textMuted }]}>
            Tes nada utama
          </Text>
        </Pressable>

        <Pressable
          disabled={busy}
          onPress={stopMp3OnDevice}
          style={[
            styles.quickCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Ionicons name="stop-circle" size={24} color={colors.danger} />
          <Text style={[styles.quickTitle, { color: colors.text }]}>
            Stop Audio
          </Text>
          <Text style={[styles.quickSub, { color: colors.textMuted }]}>
            Hentikan MP3
          </Text>
        </Pressable>
      </View>

      {/* Ringkasan Jadwal Hari Ini */}
      <View
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <View style={styles.rowBetween}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            Jadwal {todayName} ({todaySlots.length} Aktif)
          </Text>
          <Pressable onPress={() => router.push('/(tabs)/schedule')}>
            <Text style={{ color: colors.primary, fontWeight: '600' }}>
              Lihat Semua
            </Text>
          </Pressable>
        </View>
        {todaySlots.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            Tidak ada jadwal aktif untuk hari {todayName}.
          </Text>
        ) : (
          todaySlots.slice(0, 5).map((slot) => (
            <View
              key={slot.slot}
              style={[styles.slotRow, { borderBottomColor: colors.border }]}
            >
              <Text style={[styles.slotTime, { color: colors.primary }]}>
                {slot.time}
              </Text>
              <Text
                style={[styles.slotLabel, { color: colors.text }]}
                numberOfLines={1}
              >
                {slot.label || `Slot #${slot.slot}`}
              </Text>
              <Text style={[styles.slotMp3, { color: colors.textMuted }]}>
                MP3 #{slot.mp3}
              </Text>
            </View>
          ))
        )}
      </View>

      {/* Log Aktivitas Ringkas */}
      <View
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.cardTitle, { color: colors.text, marginBottom: 8 }]}>
          Log Komunikasi Terbaru
        </Text>
        {logs.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            Belum ada aktivitas komunikasi.
          </Text>
        ) : (
          logs.slice(0, 5).map((log) => (
            <View key={log.id} style={styles.logRow}>
              <Ionicons
                name={log.ok ? 'checkmark-circle' : 'close-circle'}
                size={16}
                color={log.ok ? colors.success : colors.danger}
              />
              <Text style={[styles.logTime, { color: colors.textMuted }]}>
                {log.timestamp}
              </Text>
              <Text
                style={[styles.logMsg, { color: colors.text }]}
                numberOfLines={1}
              >
                {log.message}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 14, paddingBottom: 32 },
  brandCard: {
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 4,
  },
  brandLogo: { width: 170, height: 52 },
  brandSlogan: {
    fontSize: 13,
    fontWeight: '700',
    color: '#114B42',
    letterSpacing: 0.4,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: { fontSize: 12, fontWeight: '600' },
  statusText: { fontSize: 15, fontWeight: '600' },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 10,
  },
  errorText: { flex: 1, fontSize: 13 },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 4,
  },
  btnText: { fontSize: 15, fontWeight: '700' },
  mutedLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8 },
  clockText: { fontSize: 36, fontWeight: '800', fontVariant: ['tabular-nums'] },
  dateText: { fontSize: 14 },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 11,
    borderRadius: 12,
    marginTop: 6,
  },
  secondaryBtnText: { fontSize: 14, fontWeight: '600' },
  quickRow: { flexDirection: 'row', gap: 12 },
  quickCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 4,
  },
  quickTitle: { fontSize: 15, fontWeight: '700', marginTop: 4 },
  quickSub: { fontSize: 12 },
  emptyText: { fontSize: 13, fontStyle: 'italic' },
  slotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  slotTime: { fontSize: 15, fontWeight: '700', width: 52 },
  slotLabel: { flex: 1, fontSize: 14 },
  slotMp3: { fontSize: 12, fontWeight: '600' },
  logRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 3 },
  logTime: { fontSize: 12, fontVariant: ['tabular-nums'] },
  logMsg: { flex: 1, fontSize: 13 },
});
