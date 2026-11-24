import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useAppStore } from '@/store/useAppStore';
import { useTheme } from '@/theme/useTheme';

const QUICK_TONES = [
  { id: 1, label: 'Bel Masuk / Utama' },
  { id: 2, label: 'Pergantian Jam' },
  { id: 3, label: 'Jam Pelajaran 3' },
  { id: 4, label: 'Istirahat 1' },
  { id: 5, label: 'Selesai Istirahat' },
  { id: 6, label: 'Upacara / Apel' },
  { id: 7, label: 'Doa / Tadarus' },
  { id: 8, label: 'Istirahat 2 / Dzuhur' },
  { id: 9, label: 'Masuk Siang' },
  { id: 10, label: 'Bel Pulang' },
];

export default function AudioTestScreen() {
  const { colors } = useTheme();
  const { busy, playMp3OnDevice, stopMp3OnDevice } = useAppStore();
  const [customId, setCustomId] = useState('11');
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
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Kontrol Stop & Custom ID */}
      <View
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.cardTitle, { color: colors.text }]}>
          Putar Nomor MP3 Manual
        </Text>
        <View style={styles.customRow}>
          <TextInput
            value={customId}
            onChangeText={setCustomId}
            keyboardType="number-pad"
            placeholder="No. MP3"
            placeholderTextColor={colors.textMuted}
            style={[
              styles.input,
              { borderColor: colors.border, color: colors.text },
            ]}
          />
          <Pressable
            disabled={busy}
            onPress={() => handlePlay(Number.parseInt(customId, 10) || 1)}
            style={[styles.playBtn, { backgroundColor: colors.primary }]}
          >
            <Ionicons name="play" size={18} color={colors.primaryText} />
            <Text style={{ color: colors.primaryText, fontWeight: '700' }}>
              Putar
            </Text>
          </Pressable>
          <Pressable
            disabled={busy}
            onPress={handleStop}
            style={[styles.playBtn, { backgroundColor: colors.danger }]}
          >
            <Ionicons name="stop" size={18} color="#FFFFFF" />
            <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Stop</Text>
          </Pressable>
        </View>
      </View>

      {/* Daftar Nada Cepat */}
      <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
        DAFTAR NADA BEL (1–10)
      </Text>
      {QUICK_TONES.map((tone) => {
        const isPlaying = playingId === tone.id;
        return (
          <View
            key={tone.id}
            style={[
              styles.toneCard,
              {
                backgroundColor: colors.surface,
                borderColor: isPlaying ? colors.primary : colors.border,
              },
            ]}
          >
            <View style={styles.toneInfo}>
              <View
                style={[
                  styles.numBadge,
                  { backgroundColor: colors.surfaceAlt },
                ]}
              >
                <Text style={{ color: colors.primary, fontWeight: '800' }}>
                  #{tone.id}
                </Text>
              </View>
              <Text style={[styles.toneLabel, { color: colors.text }]}>
                {tone.label}
              </Text>
            </View>

            <Pressable
              disabled={busy}
              onPress={() =>
                isPlaying ? handleStop() : handlePlay(tone.id)
              }
              style={[
                styles.iconBtn,
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
            </Pressable>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 10, paddingBottom: 32 },
  card: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 10 },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  customRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 15,
    fontWeight: '600',
  },
  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginTop: 6,
  },
  toneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
  },
  toneInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  numBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toneLabel: { fontSize: 15, fontWeight: '600' },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
