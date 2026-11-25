import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
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
import { AUDIO_CATEGORIES, AudioCategory } from '@/utils/audioCatalog';

export default function PlaylistsByCategoryScreen() {
  const { colors } = useTheme();
  const { busy, playMp3OnDevice, stopMp3OnDevice } = useAppStore();

  const [selectedCategory, setSelectedCategory] = useState<AudioCategory | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [customId, setCustomId] = useState('31');
  const [playingId, setPlayingId] = useState<number | null>(null);

  const handlePlay = async (id: number) => {
    setPlayingId(id);
    await playMp3OnDevice(id);
  };

  const handleStop = async () => {
    setPlayingId(null);
    await stopMp3OnDevice();
  };

  const filteredTracks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (selectedCategory) {
      if (!q) return selectedCategory.tracks;
      return selectedCategory.tracks.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          String(t.id).includes(q) ||
          (t.subtitle && t.subtitle.toLowerCase().includes(q))
      );
    }
    if (!q) return [];
    return AUDIO_CATEGORIES.flatMap((cat) =>
      cat.tracks
        .filter(
          (t) =>
            t.title.toLowerCase().includes(q) ||
            String(t.id).includes(q) ||
            (t.subtitle && t.subtitle.toLowerCase().includes(q))
        )
        .map((t) => ({ ...t, categoryTitle: cat.title }))
    );
  }, [selectedCategory, searchQuery]);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Putar Nomor MP3 Manual */}
      <View
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border, marginTop: 0 },
        ]}
      >
        <Text style={[styles.catTitle, { color: colors.text }]}>
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
            <Ionicons name="play" size={16} color="#FFFFFF" />
            <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>
              Putar
            </Text>
          </Pressable>
          <Pressable
            disabled={busy}
            onPress={handleStop}
            style={[styles.playBtn, { backgroundColor: colors.danger }]}
          >
            <Ionicons name="stop" size={16} color="#FFFFFF" />
            <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>
              Stop
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Pencarian */}
      <View
        style={[
          styles.searchBox,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Ionicons name="search" size={18} color={colors.textMuted} />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Cari nama nada atau nomor MP3..."
          placeholderTextColor={colors.textMuted}
          style={[styles.searchInput, { color: colors.text }]}
        />
        {searchQuery ? (
          <Pressable onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </View>

      {/* Jika sedang di dalam kategori */}
      {selectedCategory ? (
        <View style={{ gap: 10 }}>
          <View style={styles.catHeaderRow}>
            <Pressable
              onPress={() => setSelectedCategory(null)}
              style={[styles.backChip, { backgroundColor: colors.surfaceAlt }]}
            >
              <Ionicons name="arrow-back" size={16} color={colors.text} />
              <Text style={{ color: colors.text, fontWeight: '700', fontSize: 13 }}>
                Semua Kategori
              </Text>
            </Pressable>

            <Pressable
              disabled={busy}
              onPress={handleStop}
              style={[styles.stopChip, { backgroundColor: colors.danger }]}
            >
              <Ionicons name="stop" size={15} color="#FFFFFF" />
              <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 13 }}>
                Stop
              </Text>
            </Pressable>
          </View>

          <View
            style={[
              styles.catBanner,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View
              style={[
                styles.catIconBox,
                { backgroundColor: `${selectedCategory.color}20` },
              ]}
            >
              <Ionicons
                name={selectedCategory.icon as never}
                size={24}
                color={selectedCategory.color}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.catTitle, { color: colors.text }]}>
                {selectedCategory.title}
              </Text>
              <Text style={[styles.catDesc, { color: colors.textMuted }]}>
                {selectedCategory.description}
              </Text>
            </View>
          </View>

          {filteredTracks.map((track) => {
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
                      { backgroundColor: colors.surfaceAlt },
                    ]}
                  >
                    <Text style={{ color: colors.primary, fontWeight: '800' }}>
                      #{track.id}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.trackTitle, { color: colors.text }]}>
                      {track.title}
                    </Text>
                    {track.subtitle ? (
                      <Text style={{ color: colors.textMuted, fontSize: 12 }}>
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
                    size={17}
                    color="#FFFFFF"
                  />
                </View>
              </Pressable>
            );
          })}
        </View>
      ) : searchQuery.trim() ? (
        /* Hasil pencarian lintas kategori */
        <View style={{ gap: 10 }}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
            HASIL PENCARIAN ({filteredTracks.length})
          </Text>
          {filteredTracks.map((track) => {
            const isPlaying = playingId === track.id;
            const catTitle =
              'categoryTitle' in track ? String(track.categoryTitle) : '';
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
                      { backgroundColor: colors.surfaceAlt },
                    ]}
                  >
                    <Text style={{ color: colors.primary, fontWeight: '800' }}>
                      #{track.id}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.trackTitle, { color: colors.text }]}>
                      {track.title}
                    </Text>
                    <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                      {catTitle}
                    </Text>
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
                    size={17}
                    color="#FFFFFF"
                  />
                </View>
              </Pressable>
            );
          })}
        </View>
      ) : (
        /* Menu Semua Kategori */
        <View style={{ gap: 12 }}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
            SEMUA DAFTAR PUTAR PER KATEGORI
          </Text>

          {AUDIO_CATEGORIES.map((cat) => (
            <Pressable
              key={cat.id}
              onPress={() => setSelectedCategory(cat)}
              style={[
                styles.catMenuCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <View
                style={[
                  styles.catIconBox,
                  { backgroundColor: `${cat.color}20` },
                ]}
              >
                <Ionicons
                  name={cat.icon as never}
                  size={24}
                  color={cat.color}
                />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.catTitleRow}>
                  <Text style={[styles.catTitle, { color: colors.text }]}>
                    {cat.title}
                  </Text>
                  {cat.isDaily ? (
                    <View
                      style={[
                        styles.dailyPill,
                        { backgroundColor: `${colors.primary}20` },
                      ]}
                    >
                      <Text
                        style={{
                          color: colors.primary,
                          fontSize: 10,
                          fontWeight: '800',
                        }}
                      >
                        HARIAN
                      </Text>
                    </View>
                  ) : null}
                </View>
                <Text style={[styles.catDesc, { color: colors.textMuted }]}>
                  {cat.description}
                </Text>
                <Text
                  style={{
                    color: cat.color,
                    fontSize: 12,
                    fontWeight: '700',
                    marginTop: 4,
                  }}
                >
                  {cat.tracks.length} Nada MP3 →
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textMuted}
              />
            </Pressable>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 12, paddingBottom: 32 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: { flex: 1, fontSize: 14, paddingVertical: 2 },
  sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8 },
  catMenuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  catIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  catTitle: { fontSize: 15, fontWeight: '700' },
  catDesc: { fontSize: 12, marginTop: 2 },
  dailyPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  catHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  stopChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  catBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
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
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackTitle: { fontSize: 15, fontWeight: '600' },
  playCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: { borderRadius: 16, borderWidth: 1, padding: 14, gap: 10, marginTop: 4 },
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
});
