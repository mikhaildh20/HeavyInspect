README: HeavyInspect

1. Visi dan Gambaran Umum Proyek

HeavyInspect adalah inisiatif digitalisasi prosedur Pemeliharaan dan Pemeriksaan Harian (P2H) yang dirancang khusus untuk memenuhi standar kurikulum praktikum Teknik Rekayasa Pemeliharaan Alat Berat (TRPAB). Proyek ini berfokus pada transformasi digital pemeriksaan unit Komatsu PC 200-8 melalui sistem berbasis QR Code.

Visi utama proyek ini adalah mengeliminasi hambatan administratif dalam proses manual, meningkatkan akurasi inspeksi, dan memastikan keterlacakan data (data traceability) yang absolut. Keberhasilan proyek diukur berdasarkan terpenuhinya Success Metrics yang ditetapkan dalam PRD, yakni terciptanya ekosistem data digital yang terintegrasi, transparan, dan siap digunakan untuk evaluasi teknis dalam lingkungan pendidikan tinggi teknik.

2. Hierarki Dokumentasi (Source-of-Truth)

Seluruh kontributor dan AI Agent wajib mengikuti hierarki dokumen berikut. Instruksi hukum, keamanan, dan operasional lokal adalah otoritas tertinggi yang membatalkan ketentuan dokumen di bawahnya.

1. Konstrain Eksternal: Aturan hukum, keamanan, dan operasional yang disetujui pihak berwenang.
2. 01_PROJECT_RULES.md: Aturan operasional, kebijakan konflik, dan batasan rekayasa.
3. 02_PRD.md: Cakupan produk, visi bisnis, dan tujuan fungsional utama.
4. 03_FSD.md: Perilaku fungsional yang dapat diamati dan aturan bisnis (logic).
5. 04_TSD.md: Arsitektur sistem, batasan implementasi, dan keputusan teknologi.
6. 05_ERD.md: Model data, skema database, dan kebijakan migrasi.
7. 06_API_SPEC.md: Kontrak API eksternal dan spesifikasi endpoint.
8. 07_UI_UX_SPEC.md: Kontrak visual, desain antarmuka, dan interaksi pengguna.
9. 08_TEST_PLAN.md: Strategi kualitas, kriteria penerimaan, dan metodologi verifikasi.
10. 09_BACKLOG.md: Antrean tugas aktif dan status pengiriman saat ini.
11. 10_DEV_LOG.md: Riwayat rekayasa terverifikasi dan log keputusan teknis.
12. 11_CHANGELOG.md: Perubahan yang telah dirilis ke versi publik/baseline.
13. 12_CODING_STANDARDS.md: Konvensi penulisan kode dan standar kualitas.
14. 13_TASK_BREAKDOWN.md: Peta jalan (roadmap) lengkap dan hierarki tugas proyek.
15. HANDOFF.md: Status keberlanjutan sesi dan instruksi transisi antar kontributor.

3. Model Operasional Proyek

Sebagai standar integritas sistem, kontributor (manusia maupun AI Agent) wajib mematuhi aturan operasional berikut:

* Pengerjaan Tugas: Selesaikan hanya satu tugas yang koheren dalam satu waktu untuk menjaga stabilitas sistem dan fokus verifikasi.
* Penanganan Konflik: Jika ditemukan kontradiksi antar dokumen, gunakan urutan preseden pada Bagian 2. Jangan menebak (Do not guess). Konflik yang tidak terselesaikan wajib dicatat sebagai item dengan status "BLOCKED" di 09_BACKLOG.md dan dilaporkan di HANDOFF.md.
* Definisi Selesai (Definition of Done): Tugas dianggap tuntas hanya jika memiliki bukti implementasi, bukti verifikasi teknis, pemutakhiran status backlog, entri di 10_DEV_LOG.md, dan pemutakhiran 11_CHANGELOG.md (jika relevan).

4. Status Proyek

Proyek HeavyInspect saat ini telah mencapai status PRODUCTION-READY:

* [x] Semua fitur inti (P2H, review, approval, admin panel) telah diimplementasikan
* [x] Sistem autentikasi dengan role-based routing berfungsi
* [x] Upload file (foto) ke folder `public/uploads/`
* [x] Notifikasi real-time dengan audit log
* [x] Export Excel untuk data unit dan user

Catatan: Sistem dalam kondisi stabil dan siap digunakan untuk pengembangan lebih lanjut.

5. Alur Kerja Kontributor (Workflow)

Prosedur wajib bagi setiap pengembang atau AI Agent:

1. Orientasi: Baca spesifikasi relevan, backlog, log pengembangan, dan handoff.
2. Pemilihan Tugas: Pilih satu tugas yang tidak terblokir (unblocked) dan tandai sebagai IN_PROGRESS.
3. Perencanaan: Tetapkan kriteria penerimaan (acceptance criteria) dan identifikasi dependensi.
4. Eksekusi & Verifikasi: Implementasikan tugas, lalu lakukan verifikasi teknis. Bukti verifikasi harus menyertakan log, perintah (commands), atau skenario QA yang dapat diulang.
5. Dokumentasi: Perbarui dokumen terkait (Backlog, Dev Log, Handoff, Changelog) pada waktu yang tepat sebelum mengakhiri sesi kerja.

6. Panduan Orientasi AI Agent

AI Agent baru yang bergabung dalam repositori ini wajib:

1. Merujuk ke 00_AI_AGENT_START_PROMPT.md untuk konfigurasi lingkungan awal.
2. Melakukan pemeriksaan acak (spot-check) pada dokumen HANDOFF.md terhadap kondisi aktual repositori sebelum mempercayai informasi yang tercantum.
3. Memastikan setiap tindakan selaras dengan batasan rekayasa yang tercantum dalam 01_PROJECT_RULES.md.
