Engineering Handoff: HeavyInspect

1. Instruksi 'Start Here' (Mulai di Sini)

Bagi pengembang atau agen AI baru, ikuti urutan pembacaan dokumen berikut secara ketat untuk memahami konteks teknis dan aturan operasional:

1. 00_AI_AGENT_START_PROMPT.md: Memahami protokol interaksi agen dan instruksi inisialisasi.
2. 01_PROJECT_RULES.md: Memahami hirarki otoritas dokumen, batasan rekayasa, dan quality gates.
3. 09_BACKLOG.md: Meninjau antrean tugas aktif dan prioritas pengembangan.
4. 10_DEV_LOG.md: Meninjau riwayat keputusan arsitektur dan bukti verifikasi sebelumnya.
5. HANDOFF.md (Dokumen ini): Memahami status sesi terakhir dan instruksi eksekusi segera.

Peringatan Teknis: Jangan mempercayai dokumentasi secara buta. Lakukan spot-check terhadap repositori (kode sumber, skema database, dan konfigurasi lingkungan) untuk memastikan sinkronisasi antara dokumen dan implementasi aktual sebelum memulai tugas.

2. Status Terverifikasi Saat Ini

Proyek telah menyelesaikan implementasi 15 penyesuaian (v0.15.0), termasuk perbaikan bug kritis, keamanan, fitur notifications, user password management, unit master fields, dan Excel import.

* Fase Proyek: Fase 9 (Notification & Polish) — Completed.
* Versi Saat Ini: 0.15.0.
* Cabang Utama (Branch): main.
* Hasil Verifikasi Terakhir: npm run build passes (22 routes). Semua TypeScript clean, tidak ada error.

3. Keputusan Arsitektur dan Batasan Teknis

Berikut adalah keputusan teknologi inti yang menjadi fondasi pengembangan:

Area	Keputusan	Rationale
Framework Utama	Next.js	Standar aplikasi web modern dengan dukungan SSR/ISR.
Database	SQLite 3	Pilihan untuk kesederhanaan portable di lingkungan terbatas.
Bahasa Pemrograman	TypeScript 5.x	Pengetikan statis ketat diwajibkan (Ref: 12_CODING_STANDARDS.md).
Gaya Arsitektur	Modular Monolith	Memisahkan domain bisnis sambil menjaga kesederhanaan deployment.

Peran Pengguna dan Batasan Akses (Roles)

Akses sistem dibatasi secara ketat berdasarkan peran yang didefinisikan dalam 02_PRD.md:

* Mahasiswa: Input data inspeksi P2H. Boundary: Hanya dapat menulis/mengedit rekaman yang ditugaskan kepada mereka.
* Instruktur: Verifikasi hasil inspeksi. Boundary: Memberikan persetujuan atau umpan balik pada input mahasiswa di departemen terkait.
* Dosen: Monitoring dan manajemen data master. Boundary: Akses penuh ke laporan analitik dan konfigurasi sistem.

Batasan Operasional dan Hirarki Sumber Kebenaran

Sesuai dengan README.md dan 01_PROJECT_RULES.md, pengembang wajib mematuhi hirarki berikut jika terjadi konflik informasi:

1. Instruksi keamanan dan operasional lokal repositori.
2. 01_PROJECT_RULES.md (Aturan main dan batasan rekayasa).
3. Spesifikasi formal (02_PRD hingga 08_TEST_PLAN).
4. Dokumen pendukung (09_BACKLOG hingga 14_HANDOFF).

4. Risiko dan Hambatan Terbuka (Open Blockers & Risks)

ID	Deskripsi Risiko	Dampak	Pemilik (Owner)	Tindakan Berikutnya
[GAP-001]	Ketidakpastian solusi offline storage untuk kebutuhan inspeksi di area tanpa sinyal.	Fitur utama (Inspeksi) terancam gagal jika sinkronisasi data tidak andal.	System Architect	Ajukan strategi sinkronisasi (e.g., PouchDB vs. LocalStorage + Sync) dan perbarui 04_TSD.md.

5. Rekomendasi Tugas Berikutnya

Berdasarkan 09_BACKLOG.md dan 13_TASK_BREAKDOWN.md, tugas berikutnya yang direkomendasikan:

1. TASK-022: Implementasi GPS Coordinates Capture — Menangkap koordinat GPS saat inspeksi.
2. TASK-023: Implementasi Client-side Image Compression — Optimasi kompresi gambar di sisi klien.
3. TASK-024: Implementasi Push Notification — Notifikasi untuk persetujuan dan penolakan (sudah sebagian via DB notifications, perlu push notification untuk mobile).

6. Aturan Pembaruan Dokumen (Update Rule)

Dokumen HANDOFF.md wajib diperbarui setelah setiap tugas selesai diverifikasi atau jika ada keputusan material baru.

1. Faktual & Bertanggal: Gunakan data objektif dengan stempel waktu dan bukti verifikasi yang eksplisit.
2. Konektivitas: Tautkan setiap pembaruan ke entri log terkait di 10_DEV_LOG.md. Jangan menduplikasi riwayat panjang; jaga dokumen tetap ringkas dan berorientasi pada aksi.
3. Persona: Tetap gunakan nada profesional, direct, dan otoritatif sebagai Senior Technical Lead.
