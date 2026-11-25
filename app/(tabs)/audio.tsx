import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useAppStore } from '@/store/useAppStore';
import { useTheme } from '@/theme/useTheme';
import { DAILY_CATEGORY } from '@/utils/audioCatalog';

export default function DailyBellScreen() {
  const { colors } = useTheme();
  const { busy, playMp3OnDevice, stopMp3OnDevice } = useAppStore();
  const [playingId, setPlayingId] = useState<number | null>(null);

  const handlePlay = async (id: number) => {
    setPlayingId(id);
    await playMp3OnDevice(id);
  };

  const handleStop = async () => {
    setPlayingId(null);
    await stopMp3OnDevice();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header Ringkas Bel Harian */}
        <View
          style={[
            styles.heroCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={styles.heroTop}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.heroTitle, { color: colors.text }]}>
                {DAILY_CATEGORY.title}
              </Text>
              <Text style={[styles.heroSub, { color: colors.textMuted }]}>
                Akses cepat nada bel yang paling sering dipakai setiap hari.
              </Text>
            </View>
            <Pressable
              disabled={busy}
              onPress={handleStop}
              style={[styles.stopAllBtn, { backgroundColor: colors.danger }]}
            >
              <Ionicons name="stop" size={16} color="#FFFFFF" />
              <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 13 }}>
                Stop
              </Text>
            </Pressable>
          </View>

          <Pressable
            onPress={() => router.push('/(tabs)/playlists')}
            style={[styles.linkBtn, { backgroundColor: colors.surfaceAlt }]}
          >
            <Ionicons name="albums-outline" size={16} color={colors.primary} />
            <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 13 }}>
              Buka Semua Daftar Putar per Kategori →
            </Text>
          </Pressable>
        </View>

        {/* Daftar Nada Harian */}
        {DAILY_CATEGORY.tracks.map((track) => {
          const isPlaying = playingId === track.id;
          return (
            <Pressable
              key={track.id}
              disabled={busy}
              onPress={() => (isPlaying ? handleStop() : handlePlay(track.id))}
              style={[
                styles.trackCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: isPlaying ? colors.primary : colors.border,
                },
              ]}
            >
              <View style={styles.trackLeft}>
                <View
                  style={[
                    styles.numBadge,
                    {
                      backgroundColor: isPlaying
                        ? colors.primary
                        : colors.surfaceAlt,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: isPlaying ? '#FFFFFF' : colors.primary,
                      fontWeight: '800',
                    }}
                  >
                    #{track.id}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.trackTitle, { color: colors.text }]}>
                    {track.title}
                  </Text>
                  {track.subtitle ? (
                    <Text style={[styles.trackSub, { color: colors.textMuted }]}>
                      {track.subtitle}
                    </Text>
                  ) : null}
                </View>
              </View>

              <View
                style={[
                  styles.playCircle,
                  {
                    backgroundColor: isPlaying ? colors.danger : colors.primary,
                  },
                ]}
              >
                <Ionicons
                  name={isPlaying ? 'stop' : 'play'}
                  size={18}
                  color="#FFFFFF"
                />
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 10, paddingBottom: 32 },
  heroCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
    marginBottom: 4,
  },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  heroTitle: { fontSize: 17, fontWeight: '800' },
  heroSub: { fontSize: 13, marginTop: 2 },
  stopAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  linkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 10,
  },
  trackCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
  },
  trackLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  numBadge: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackTitle: { fontSize: 15, fontWeight: '700' },
  trackSub: { fontSize: 12, marginTop: 2 },
  playCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
