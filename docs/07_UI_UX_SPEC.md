07_UI_UX_SPEC.md — Spesifikasi UI/UX Edu-P2H (HeavyInspect)

1. Prinsip Pengalaman Pengguna (Experience Principles)

Filosofi desain Edu-P2H dirancang untuk ketahanan operasional tinggi di lingkungan bengkel alat berat (TRPAB) yang keras, minim cahaya di bawah unit, dan penggunaan alat pelindung diri (sarung tangan).

* High-Contrast Visuals (Low-Light Optimization): Menggunakan warna Kuning Alat Berat (#FACC15) yang dipadukan dengan latar belakang gelap (Dark Mode-first) untuk visibilitas maksimal di bawah kolong mesin atau area workshop dengan pencahayaan rendah.
* Field-Ready Interaction (Glove-Friendly): Semua elemen interaktif memiliki target sentuh minimal 48x48dp (melampaui standar 44dp) untuk mengakomodasi penggunaan sarung tangan kerja. Feedback visual saat tombol ditekan (Pressed State) dibuat sangat kontras (perubahan elevasi atau kecerahan 20%) guna memastikan input teregistrasi meski dalam kebisingan tinggi.
* Mobile-First & Responsive Policy:
  * Mobile (<768px): Tampilan kolom tunggal (vertical stack) untuk fokus pada satu item checklist per waktu.
  * Tablet (≥768px): Menggunakan Split-View atau tata letak 2-kolom. Sisi kiri menampilkan Tabel Checklist, sisi kanan menampilkan pratinjau foto/referensi manual unit untuk meminimalkan scrolling berlebih.

2. Sistem Desain (Design System)

Token/Component	Definition/Value	Usage	Accessibility Requirement
Primary Color	#FACC15 (Kuning Alat Berat)	Branding, Button Aksi Utama (Solid Fill).	Kontras teks hitam (#000000) di atas #FACC15 (7.0:1).
Success State	Hijau (#22C55E)	Status 'Good' (G).	Wajib menyertakan Checkmark Icon.
Warning State	Kuning (#FACC15)	Status 'Bad' (B) / Broken.	Diferensiasi: Menggunakan Thick Border 3px + Ikon Tanda Seru (!) agar berbeda dari branding primary.
Danger State	Merah (#EF4444)	Status 'Urgent' (U).	Pulse animation pada status kritis.
Typography	Inter / Roboto (Sans-serif)	Label dan Instruksi.	Ukuran Body min 16px; SMR Input min 24px.
Interactive State	Overlay Hitam 10% (Pressed)	Visual feedback pada tombol.	Transisi instan (<100ms) untuk responsivitas.

3. Navigasi dan Akses Berbasis Peran (Navigation & Role Access)

Navigasi dirancang untuk meminimalkan jumlah ketukan (taps) menuju fungsi utama setiap peran.

Peran	Entry Points	Allowed Screens	Restricted Screens
Mahasiswa	Bottom Nav: Home, Scan, History	Dashboard (Tugas Aktif), Scan QR, Form P2H, Profile.	Review Instruktur, Manajemen Unit.
Instruktur	Bottom Nav: Tasks, Units, Settings	Dashboard (Queue), Review P2H, Photo Validation, Signature.	Pengaturan Kurikulum, System Logs.
Dosen	Bottom Nav: Reports, Monitoring	Dashboard (Stats), Recap Reports, Final Approval.	Input Form P2H (Read-only).

4. Spesifikasi Layar (Screen Specifications)

4.1. Dashboard (Role-Based)

* Mahasiswa: Fokus pada widget "Unit Terjadwal" dengan progress bar pengisian P2H.
* Dosen/Instruktur: Widget "Persetujuan Menunggu" (Approval Queue) dengan indikator urgensi (Urgent items diprioritaskan di atas).

4.2. Layar Scan QR

* UI Layout: Viewport kamera 1:1 di tengah dengan corner bracket berwarna Kuning #FACC15.
* Instruction: Label teks "Arahkan Kamera ke QR Code di Chassis Unit".
* Haptic & Audio Feedback:
  * Success: Getaran pendek (50ms pulse) + Bunyi 'Beep' high-pitch.
  * Error: Getaran ganda (100ms x 2 pulse) + Bunyi 'Buzz' low-pitch.

4.3. Layar Form P2H (Input Utama)

Formulir menggunakan pendekatan progressive disclosure untuk menjaga kebersihan antarmuka.

* Header SMR (Service Meter Reading):
  * Input Mechanics: Native Numeric Keypad dengan tombol besar.
  * Logic: Input masking (angka saja), validasi nilai tidak boleh lebih kecil dari SMR terakhir yang tersimpan di database.
* Tabel Checklist (G/B/U):
  * Tiga tombol toggle horizontal (Segmented Control).
  * Status 'B' atau 'U' memicu ekspansi sel secara vertikal (animasi slide-down).
* Unggah Foto (BR-001):
  * Muncul otomatis jika status 'B' atau 'U'.
  * Placeholder: Kotak dengan Dashed Border kontras tinggi dan ikon kamera besar di tengah.
  * Wajib mengambil foto langsung dari kamera (disable gallery upload untuk integritas data lapangan).
* Signature Pad:
  * Canvas area sensitif sentuhan.
  * Sequential CTA: Jika bukan giliran peran terkait, area ini tertutup overlay semi-transparan dengan teks "Menunggu Tanda Tangan [Peran Sebelumnya]".

5. Alur Interaksi dan Aturan Bisnis (Interaction & Business Rules)

1. BR-001 (Mandatory Photo): Sistem melakukan validasi saat event onStatusChange. Jika status = 'B'/'U' dan photo_blob null, maka tombol 'Submit' diubah ke status disabled (opacity 50%) dan menampilkan tooltip "Foto wajib untuk status Bad/Urgent".
2. BR-008 (Sequential Signing): Alur tanda tangan adalah Lock-Step.
  * Step 1: Mahasiswa tanda tangan -> Submit (Data Terkunci).
  * Step 2: Instruktur menerima notifikasi -> Review -> Tanda tangan aktif.
  * Step 3: Dosen akses via dashboard -> Review Final -> Tanda tangan aktif.
3. Haptic Confirmation: Setiap pergantian status checklist (G/B/U) memberikan getaran mekanis singkat untuk konfirmasi tanpa perlu melihat layar secara terus-menerus.

6. Status Interaksi (Interaction States)

* Loading: Menggunakan Skeleton Screens untuk layout form dan spinner #FACC15 untuk proses upload foto.
* Empty: Jika tidak ada jadwal, tampilkan ilustrasi "Unit Semua Sehat" dengan instruksi untuk melakukan scan unit baru.
* Error: Inline validation berwarna Merah (#EF4444) dengan ikon peringatan di samping field yang bermasalah.
* Offline/Degraded: Muncul banner "Mode Offline: Data Tersimpan Lokal" di bagian header. Tombol 'Submit' berubah menjadi 'Simpan Lokal' dan akan otomatis sinkron saat mendeteksi koneksi stabil (Background Sync).

7. Penyelarasan Dokumen (Traceability Matrix)

UI Element	Functional ID (FSD)	Technical ID (TSD)	Business Rule (BR)
Header SMR Input	FSD-P2H-INPUT	TSD-P2H-SMR-MASK	-
Checklist G/B/U	FSD-P2H-FORM	TSD-P2H-LOGIC	BR-001 (Trigger)
Photo Upload Placeholder	FSD-P2H-INPUT	TSD-MEDIA-UPL	BR-001 (Condition)
Submit Button	FSD-P2H-SUBMIT	TSD-P2H-SUBMIT	BR-001 (Validation)
Signature Canvas	FSD-AUTH-SIG	TSD-SEC-SIG	BR-008 (Sequence)
QR Viewport	FSD-UNIT-SCAN	TSD-CAM-LIB	-
Dashboard Approval	FSD-DASH-VIEW	TSD-QUERY-AGG	BR-008 (Status Check)
