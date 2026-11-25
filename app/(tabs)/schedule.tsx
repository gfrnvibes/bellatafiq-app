import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { MAX_SLOTS_PER_DAY } from '@/services/protocol/BelProtocol';
import { useAppStore } from '@/store/useAppStore';
import { useTheme } from '@/theme/useTheme';
import { DAYS_OF_WEEK, DayName, ScheduleSlot } from '@/types/bell';

export default function ScheduleScreen() {
  const { colors } = useTheme();
  const {
    schedule,
    presets,
    activePresetId,
    busy,
    addOrUpdateSlot,
    removeSlot,
    toggleSlot,
    applyPreset,
    sendDayScheduleToDevice,
    copyDayScheduleOnDevice,
  } = useAppStore();

  const [selectedDay, setSelectedDay] = useState<DayName>('Senin');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [presetModalVisible, setPresetModalVisible] = useState(false);
  const [copyModalVisible, setCopyModalVisible] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [editingSlotNumber, setEditingSlotNumber] = useState<number | null>(null);
  const [timeValue, setTimeValue] = useState('07:00');
  const [mp3Value, setMp3Value] = useState('1');
  const [labelValue, setLabelValue] = useState('');

  const daySlots = schedule[selectedDay] || [];

  const openAddModal = () => {
    if (daySlots.length >= MAX_SLOTS_PER_DAY) {
      Alert.alert('Batas Maksimal', `Maksimal ${MAX_SLOTS_PER_DAY} slot per hari.`);
      return;
    }
    setEditingSlotNumber(null);
    setTimeValue('07:00');
    setMp3Value('1');
    setLabelValue('');
    setEditModalVisible(true);
  };

  const openEditModal = (slot: ScheduleSlot) => {
    setEditingSlotNumber(slot.slot);
    setTimeValue(slot.time);
    setMp3Value(String(slot.mp3));
    setLabelValue(slot.label || '');
    setEditModalVisible(true);
  };

  const handleSaveSlot = () => {
    const mp3 = Number.parseInt(mp3Value, 10) || 1;
    addOrUpdateSlot(selectedDay, {
      slot: editingSlotNumber ?? daySlots.length + 1,
      time: timeValue,
      mp3: Math.max(1, Math.min(999, mp3)),
      enabled: true,
      label: labelValue.trim() || undefined,
    });
    setEditModalVisible(false);
  };

  const handleSendDay = async () => {
    const ok = await sendDayScheduleToDevice(selectedDay);
    if (ok) {
      Alert.alert('Terkirim', `Jadwal hari ${selectedDay} berhasil disimpan ke Bel.`);
    }
  };

  const timeToDate = (hhmm: string): Date => {
    const [h, m] = hhmm.split(':').map((n) => Number.parseInt(n, 10) || 0);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Pemilih Hari */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.dayBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}
        contentContainerStyle={styles.dayBarContent}
      >
        {DAYS_OF_WEEK.map((day) => {
          const active = day === selectedDay;
          return (
            <Pressable
              key={day}
              onPress={() => setSelectedDay(day)}
              style={[
                styles.dayChip,
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
                {day}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Toolbar Preset & Salin */}
      <View style={styles.toolbar}>
        <Pressable
          onPress={() => setPresetModalVisible(true)}
          style={[styles.toolBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <Ionicons name="layers-outline" size={16} color={colors.primary} />
          <Text style={[styles.toolBtnText, { color: colors.text }]}>Preset</Text>
        </Pressable>

        <Pressable
          onPress={() => setCopyModalVisible(true)}
          style={[styles.toolBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <Ionicons name="copy-outline" size={16} color={colors.primary} />
          <Text style={[styles.toolBtnText, { color: colors.text }]}>Salin Hari</Text>
        </Pressable>

        <Pressable
          onPress={openAddModal}
          style={[styles.toolBtn, { backgroundColor: colors.primary, borderColor: colors.primary }]}
        >
          <Ionicons name="add" size={18} color={colors.primaryText} />
          <Text style={[styles.toolBtnText, { color: colors.primaryText }]}>Tambah</Text>
        </Pressable>
      </View>

      {/* Daftar Slot */}
      <ScrollView contentContainerStyle={styles.listContent}>
        {daySlots.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="calendar-clear-outline" size={36} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              Belum ada jadwal untuk {selectedDay}
            </Text>
            <Text style={[styles.emptySub, { color: colors.textMuted }]}>
              Tekan Tambah atau pilih Preset Jadwal di atas.
            </Text>
          </View>
        ) : (
          daySlots.map((slot) => (
            <Pressable
              key={slot.slot}
              onPress={() => openEditModal(slot)}
              style={[
                styles.slotCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  opacity: slot.enabled ? 1 : 0.6,
                },
              ]}
            >
              <View style={styles.slotLeft}>
                <Text style={[styles.slotTime, { color: colors.primary }]}>
                  {slot.time}
                </Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.slotLabel, { color: colors.text }]} numberOfLines={1}>
                    {slot.label || `Jadwal #${slot.slot}`}
                  </Text>
                  <Text style={[styles.slotMeta, { color: colors.textMuted }]}>
                    Slot {slot.slot} • Nada MP3 #{slot.mp3}
                  </Text>
                </View>
              </View>

              <View style={styles.slotActions}>
                <Switch
                  value={slot.enabled}
                  onValueChange={() => toggleSlot(selectedDay, slot.slot)}
                />
                <Pressable
                  onPress={() => removeSlot(selectedDay, slot.slot)}
                  hitSlop={8}
                >
                  <Ionicons name="trash-outline" size={20} color={colors.danger} />
                </Pressable>
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>

      {/* Tombol Kirim ke Perangkat */}
      <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <Pressable
          disabled={busy}
          onPress={handleSendDay}
          style={[
            styles.sendBtn,
            { backgroundColor: colors.primary, opacity: busy ? 0.6 : 1 },
          ]}
        >
          {busy ? (
            <ActivityIndicator size="small" color={colors.primaryText} />
          ) : (
            <Ionicons name="cloud-upload-outline" size={20} color={colors.primaryText} />
          )}
          <Text style={[styles.sendBtnText, { color: colors.primaryText }]}>
            Kirim Jadwal {selectedDay} ke Perangkat
          </Text>
        </Pressable>
      </View>

      {/* Modal Tambah / Edit Slot */}
      <Modal visible={editModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {editingSlotNumber ? `Edit Slot #${editingSlotNumber}` : 'Tambah Jadwal Bel'}
            </Text>

            <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Waktu Bunyi</Text>
            <Pressable
              onPress={() => setShowTimePicker(true)}
              style={[styles.inputBox, { borderColor: colors.border, backgroundColor: colors.surfaceAlt }]}
            >
              <Ionicons name="time-outline" size={18} color={colors.primary} />
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>
                {timeValue}
              </Text>
            </Pressable>

            {showTimePicker && (
              <DateTimePicker
                value={timeToDate(timeValue)}
                mode="time"
                is24Hour
                onChange={(_, date) => {
                  setShowTimePicker(false);
                  if (date) {
                    const hh = String(date.getHours()).padStart(2, '0');
                    const mm = String(date.getMinutes()).padStart(2, '0');
                    setTimeValue(`${hh}:${mm}`);
                  }
                }}
              />
            )}

            <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Nomor Nada MP3 (1–99)</Text>
            <TextInput
              value={mp3Value}
              onChangeText={setMp3Value}
              keyboardType="number-pad"
              style={[styles.inputBox, { borderColor: colors.border, color: colors.text }]}
              placeholder="1"
              placeholderTextColor={colors.textMuted}
            />

            <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Keterangan (Opsional)</Text>
            <TextInput
              value={labelValue}
              onChangeText={setLabelValue}
              style={[styles.inputBox, { borderColor: colors.border, color: colors.text }]}
              placeholder="Mis. Masuk Jam Ke-1"
              placeholderTextColor={colors.textMuted}
            />

            <View style={styles.modalBtns}>
              <Pressable
                onPress={() => setEditModalVisible(false)}
                style={[styles.modalBtn, { backgroundColor: colors.surfaceAlt }]}
              >
                <Text style={{ color: colors.text, fontWeight: '600' }}>Batal</Text>
              </Pressable>
              <Pressable
                onPress={handleSaveSlot}
                style={[styles.modalBtn, { backgroundColor: colors.primary }]}
              >
                <Text style={{ color: colors.primaryText, fontWeight: '700' }}>Simpan</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Preset Jadwal */}
      <Modal visible={presetModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Pilih Preset Jadwal</Text>
            {presets.map((p) => {
              const active = p.id === activePresetId;
              return (
                <Pressable
                  key={p.id}
                  onPress={() => {
                    applyPreset(p.id);
                    setPresetModalVisible(false);
                  }}
                  style={[
                    styles.presetItem,
                    {
                      borderColor: active ? colors.primary : colors.border,
                      backgroundColor: colors.surfaceAlt,
                    },
                  ]}
                >
                  <Text style={[styles.presetName, { color: colors.text }]}>{p.name}</Text>
                  <Text style={{ color: colors.textMuted, fontSize: 12 }}>{p.description}</Text>
                </Pressable>
              );
            })}
            <Pressable
              onPress={() => setPresetModalVisible(false)}
              style={[styles.modalBtn, { backgroundColor: colors.surfaceAlt, marginTop: 8 }]}
            >
              <Text style={{ color: colors.text, fontWeight: '600' }}>Tutup</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Modal Salin Hari */}
      <Modal visible={copyModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Salin Jadwal {selectedDay} ke:
            </Text>
            {DAYS_OF_WEEK.filter((d) => d !== selectedDay).map((targetDay) => (
              <Pressable
                key={targetDay}
                onPress={async () => {
                  setCopyModalVisible(false);
                  const ok = await copyDayScheduleOnDevice(selectedDay, targetDay);
                  if (ok) {
                    Alert.alert('Berhasil', `Jadwal ${selectedDay} disalin ke ${targetDay}.`);
                  }
                }}
                style={[styles.presetItem, { borderColor: colors.border, backgroundColor: colors.surfaceAlt }]}
              >
                <Text style={{ color: colors.text, fontWeight: '600' }}>{targetDay}</Text>
              </Pressable>
            ))}
            <Pressable
              onPress={() => setCopyModalVisible(false)}
              style={[styles.modalBtn, { backgroundColor: colors.surfaceAlt, marginTop: 8 }]}
            >
              <Text style={{ color: colors.text, fontWeight: '600' }}>Batal</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  dayBar: { flexGrow: 0, flexShrink: 0, borderBottomWidth: 1 },
  dayBarContent: { paddingHorizontal: 12, paddingVertical: 10, alignItems: 'center', gap: 8 },
  dayChip: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 999 },
  toolbar: { flexDirection: 'row', padding: 12, gap: 8 },
  toolBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
  },
  toolBtnText: { fontSize: 13, fontWeight: '700' },
  listContent: { paddingHorizontal: 12, paddingBottom: 24, gap: 10 },
  emptyCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 28,
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700' },
  emptySub: { fontSize: 13, textAlign: 'center' },
  slotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  slotLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  slotTime: { fontSize: 18, fontWeight: '800', fontVariant: ['tabular-nums'] },
  slotLabel: { fontSize: 15, fontWeight: '600' },
  slotMeta: { fontSize: 12, marginTop: 2 },
  slotActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  footer: { padding: 12, borderTopWidth: 1 },
  sendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 12,
  },
  sendBtnText: { fontSize: 15, fontWeight: '700' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: { borderRadius: 18, padding: 18, gap: 10 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  inputLabel: { fontSize: 12, fontWeight: '600' },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  modalBtns: { flexDirection: 'row', gap: 10, marginTop: 8 },
  modalBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 11,
    borderRadius: 10,
  },
  presetItem: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 3,
  },
  presetName: { fontSize: 15, fontWeight: '700' },
});
