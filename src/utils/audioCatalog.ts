export interface AudioTrack {
  id: number;
  title: string;
  subtitle?: string;
}

export interface AudioCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  isDaily?: boolean;
  tracks: AudioTrack[];
}

export const AUDIO_CATEGORIES: AudioCategory[] = [
  {
    id: 'harian',
    title: 'Bel Harian & KBM',
    description: 'Nada bel yang paling sering digunakan setiap hari saat KBM.',
    icon: 'alarm-outline',
    color: '#1D4ED8',
    isDaily: true,
    tracks: [
      { id: 1, title: 'Bel Masuk Sekolah', subtitle: 'Awal kegiatan pagi' },
      { id: 2, title: 'Pergantian Jam Pelajaran', subtitle: 'Nada transisi antar mapel' },
      { id: 3, title: 'Jam Pelajaran Ke-1', subtitle: 'Mulai sesi pagi' },
      { id: 4, title: 'Bel Istirahat 1', subtitle: 'Waktu istirahat pagi' },
      { id: 5, title: 'Masuk Setelah Istirahat', subtitle: 'Kembali ke kelas' },
      { id: 6, title: 'Jam Pelajaran Ke-5', subtitle: 'Sesi tengah hari' },
      { id: 7, title: 'Jam Pelajaran Ke-6', subtitle: 'Lanjutan KBM' },
      { id: 8, title: 'Bel Istirahat 2 / Dzuhur', subtitle: 'Istirahat siang & sholat' },
      { id: 9, title: 'Masuk Sesi Siang', subtitle: 'Mulai pelajaran siang' },
      { id: 10, title: 'Bel Pulang Sekolah', subtitle: 'Akhir kegiatan belajar' },
    ],
  },
  {
    id: 'upacara',
    title: 'Upacara & Apel',
    description: 'Lagu wajib & aba-aba kegiatan upacara hari Senin / hari besar.',
    icon: 'flag-outline',
    color: '#DC2626',
    tracks: [
      { id: 11, title: 'Persiapan Upacara Bendera', subtitle: 'Panggilan baris di lapangan' },
      { id: 12, title: 'Lagu Indonesia Raya', subtitle: 'Pengiring pengibaran bendera' },
      { id: 13, title: 'Mengheningkan Cipta', subtitle: 'Instrumen khidmat' },
      { id: 14, title: 'Pembacaan Pancasila & UUD 1945', subtitle: 'Sesi amanat upacara' },
      { id: 15, title: 'Pembubaran Barisan / Apel Pagi', subtitle: 'Kembali ke ruang kelas' },
    ],
  },
  {
    id: 'keagamaan',
    title: 'Keagamaan & Pembiasaan',
    description: 'Doa harian, tadarus pagi, asmaul husna, dan pengingat ibadah.',
    icon: 'moon-outline',
    color: '#059669',
    tracks: [
      { id: 16, title: 'Doa Sebelum Belajar', subtitle: 'Pembiasaan pagi di kelas' },
      { id: 17, title: 'Tadarus / Murottal Pagi', subtitle: 'Pembacaan ayat suci Al-Quran' },
      { id: 18, title: 'Asmaul Husna', subtitle: 'Pembiasaan Jumat / pagi' },
      { id: 19, title: 'Pengingat Sholat Dhuha', subtitle: 'Jeda ibadah pagi' },
      { id: 20, title: 'Pengingat Sholat Dzuhur', subtitle: 'Persiapan sholat berjamaah' },
      { id: 21, title: 'Doa Pulang Sekolah', subtitle: 'Penutup akhir pelajaran' },
    ],
  },
  {
    id: 'ujian',
    title: 'Ujian (PTS / PAS / ANBK)',
    description: 'Aba-aba khusus ruang ujian agar tertib dan seragam.',
    icon: 'document-text-outline',
    color: '#D97706',
    tracks: [
      { id: 22, title: 'Masuk Ruang Ujian', subtitle: 'Peserta memasuki ruangan' },
      { id: 23, title: 'Mulai Mengerjakan Soal', subtitle: 'Tanda waktu ujian dimulai' },
      { id: 24, title: 'Sisa Waktu 15 Menit', subtitle: 'Peringatan akhir ujian' },
      { id: 25, title: 'Waktu Ujian Selesai', subtitle: 'Berhenti mengerjakan & kumpulkan' },
    ],
  },
  {
    id: 'khusus',
    title: 'Kegiatan Khusus & Darurat',
    description: 'Senam pagi, kerja bakti, panggilan piket, dan sirine darurat.',
    icon: 'megaphone-outline',
    color: '#7C3AED',
    tracks: [
      { id: 26, title: 'Senam Pagi / Jumat Sehat', subtitle: 'Musik/aba-aba olahraga bersama' },
      { id: 27, title: 'Jumat Bersih / Kerja Bakti', subtitle: 'Kegiatan kebersihan lingkungan' },
      { id: 28, title: 'Panggilan Guru / Piket', subtitle: 'Notifikasi ruang guru' },
      { id: 29, title: 'Istirahat Ekstrakurikuler', subtitle: 'Sesi kegiatan sore' },
      { id: 30, title: 'Sirine Darurat / Evakuasi', subtitle: 'Peringatan kondisi darurat' },
    ],
  },
];

export const DAILY_CATEGORY = AUDIO_CATEGORIES.find((c) => c.isDaily) ?? AUDIO_CATEGORIES[0];
