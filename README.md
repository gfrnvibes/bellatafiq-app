# Bellatafiq — Bell MTs At-Taufiq

**Bellatafiq** adalah aplikasi kontrol **Bel Sekolah Modern** untuk **MTs At-Taufiq**, dibangun menggunakan **React Native + Expo (Android)** sebagai pengganti aplikasi pengontrol bel lama agar tampil lebih modern, responsif, dan bebas dari gangguan *"Aplikasi tidak menanggapi"* (ANR).

---

## Fitur Utama

- **Dual Mode Koneksi (Anti-ANR):**
  - **Bluetooth Classic SPP** (`00001101-0000-1000-8000-00805F9B34FB`) dengan manajemen izin otomatis untuk **Android 7.0 – Android 16**.
  - **Wi-Fi Access Point** (`http://192.168.4.1/`) dengan batas waktu (*timeout*) dan antrean perintah berurutan (*command queue*) agar UI tidak pernah macet.
- **Beranda Compact:**
  - Status perangkat dan jam *real-time* dalam tata letak **2 kolom ringkas** dengan tombol **Sinkronkan Waktu** 1-tap.
  - **6 Tombol Aksi Cepat Bel** (*Masuk Kelas, Pergantian Pelajaran, Istirahat, Masuk Setelah Istirahat, Sholat Dzuhur, Pulang*) dengan kontrol **Play / Stop menyatu**.
- **Bel Harian & Daftar Putar per Kategori:**
  - Halaman **Bel Harian** khusus untuk nada yang paling sering dipakai setiap hari.
  - Halaman **Daftar Putar** terstruktur dalam 5 kategori (*Bel Harian & KBM, Upacara & Apel, Keagamaan & Pembiasaan, Ujian, Kegiatan Khusus & Darurat*), lengkap dengan pencarian dan **Putar Nomor MP3 Manual**.
- **Manajemen Jadwal Mingguan & Preset:**
  - Pengaturan jadwal **Minggu–Sabtu** (hingga 30 slot/hari), Time Picker modern, serta fitur **Salin Hari**.
  - **Preset Jadwal** siap pakai: *Jadwal Normal*, *Jadwal Ujian (PTS/PAS)*, dan *Jadwal Ramadhan*.
- **Dark Mode & Backup/Restore JSON:**
  - Mendukung tema **Sistem / Terang / Gelap**.
  - Ekspor & impor jadwal ke file `.json` untuk cadangan atau berbagi konfigurasi antar perangkat guru.

---

## Kompatibilitas

- **Sistem Operasi:** Android **7.0 Nougat (API 24)** hingga **Android 16 (API 36)**.

---

## Panduan Singkat Penggunaan (Operator / Guru MTs At-Taufiq)

1. Pasang file `.apk` **Bellatafiq** dari halaman **Releases** di repository ini.
2. Pastikan Bluetooth HP menyala (dan sudah *paired* dengan modul Bel Sekolah) **atau** hubungkan Wi-Fi HP ke Access Point Bel (`192.168.4.1`).
3. Buka aplikasi **Bellatafiq** → masuk ke tab **Koneksi & Data** → pilih perangkat Bel Sekolah dan tekan **Hubungkan**.
4. Kembali ke **Beranda** untuk menyinkronkan waktu atau menekan tombol bel cepat, atau buka tab **Jadwal** untuk mengatur jadwal mingguan.

---

## Pengembangan & Build (Developer)

```bash
# Install dependensi
npm install

# Cek TypeScript & jalankan unit test
npx tsc --noEmit
npx jest

# Build APK Android via EAS Build
npx eas-cli build --platform android --profile preview
```
