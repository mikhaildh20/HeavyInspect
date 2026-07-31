Engineering Backlog

Project: HeavyInspect

Dokumen Referensi Utama

* 04_TSD (Technical Specification Document): Definisi arsitektur sistem, keputusan teknologi, dan batasan modular.
* 05_ERD (Entity Relationship Diagram): Struktur tabel database, relasi antar entitas, dan aturan integritas data.
* 13_TASK_BREAKDOWN.md: Hierarki roadmap pengiriman dan pemetaan tugas menyeluruh.

1. Definisi Status dan Prioritas

Definisi Status Kerja

Status	Arti
TODO	Tugas telah didefinisikan secara teknis, belum dimulai, dan siap dikerjakan setelah dependensi terpenuhi.
IN_PROGRESS	Implementasi aktif sedang berjalan oleh pemilik tugas yang ditunjuk.
REVIEW	Implementasi selesai; menunggu peninjauan kode (PR) atau verifikasi bukti QA sesuai kriteria penerimaan.
BLOCKED	Pekerjaan terhenti akibat hambatan eksternal atau dependensi yang tidak terpenuhi; memerlukan eskalasi.
DONE	Tugas selesai sepenuhnya, diverifikasi melalui pengujian, dan dokumentasi terkait telah diperbarui.
CANCELLED	Tugas dihapus dari antrean secara sengaja berdasarkan keputusan arsitektural atau perubahan kebutuhan.

Tingkat Prioritas

Prioritas	Arti
P0	Kritis/Bloker: Wajib diselesaikan segera untuk menjamin keamanan, integritas data, atau keberlanjutan rilis inti.
P1	Wajib: Komponen utama yang diperlukan untuk memenuhi cakupan rilis yang telah dijanjikan (committed scope).
P2	Penting: Fitur atau tugas penting yang dapat dijadwalkan setelah prioritas P1 terpenuhi tanpa merusak sistem.
P3	Nice to have: Peningkatan minor atau fitur tambahan untuk iterasi masa depan.

2. Daftar Pekerjaan Aktif (Active Work)

ID	Judul	Status	Prioritas	Pemilik	Dependensi	Bukti Penerimaan	Terakhir Diperbarui
TASK-004	Implement Real QR Scanner dengan Camera Access	DONE	P1	Lead Developer	TASK-003	Scanner dapat mengakses kamera perangkat, membaca QR Code, dan menavigasi ke form P2H	2026-07-30
TASK-008	Implementasi Photo Capture untuk Item Bad/Urgent	DONE	P1	Lead Developer	TASK-007	Kamera dapat diakses, foto tersimpan sebagai base64, validasi photo mandatory untuk status B/U	2026-07-30
TASK-013	Implementasi Sequential Signing (BR-008)	DONE	P1	Lead Developer	TASK-012	Leader dapat approve, Supervisor hanya bisa approve setelah Leader approve	2026-07-31
TASK-015	Implementasi Digital Signature untuk Approval	DONE	P1	Lead Developer	TASK-009	Signature pad tersedia di form review untuk Leader/Supervisor	2026-07-31
TASK-017	Implementasi Aggregated Dashboard untuk Dosen	DONE	P1	Lead Developer	TASK-003	Dashboard analitik menampilkan statistik, status unit, dan riwayat aktivitas	2026-07-31
TASK-018	Implementasi Report History & Detail View	DONE	P1	Lead Developer	TASK-013	Halaman riwayat laporan dan detail lengkap dengan status approval	2026-07-31
TASK-019	Implementasi CRUD Users (Admin)	DONE	P1	Lead Developer	TASK-017	Admin dapat mengelola data pengguna (tambah, edit, hapus)	2026-07-31
TASK-020	Implementasi CRUD Units (Admin)	DONE	P1	Lead Developer	TASK-019	Admin dapat mengelola data unit alat berat (tambah, edit, hapus)	2026-07-31
TASK-021	Implementasi Master Checklist Parameters (Admin)	DONE	P1	Lead Developer	TASK-020	Admin dapat mengelola parameter checklist inspeksi (tambah, edit, hapus)	2026-07-31
TASK-022	Implementasi GPS Coordinates Capture	DONE	P1	Lead Developer	TASK-018	Sistem menangkap koordinat GPS operator saat inspeksi	2026-07-31
TASK-023	Implementasi Client-side Image Compression	DONE	P2	Lead Developer	TASK-008	Foto dikompres otomatis di browser sebelum upload	2026-07-31
TASK-024	Implementasi Push Notification	DONE	P2	Lead Developer	TASK-018	Notifikasi untuk persetujuan dan penolakan laporan	2026-07-31
TASK-025	Implementasi Audit Log	DONE	P2	Lead Developer	TASK-013	Pencatatan audit untuk semua aksi penting	2026-07-31
TASK-026	Implementasi Unit Testing untuk Server Actions	TODO	P3	Lead Developer	All backend tasks	Coverage > 80% untuk server actions	2026-07-31
TASK-027	Implementasi Integration Testing untuk API Endpoints	TODO	P3	Lead Developer	All API tasks	Semua endpoint teruji	2026-07-31
TASK-028	Implementasi E2E Testing untuk Core Journeys	TODO	P3	Lead Developer	All features	Happy path dan error paths teruji	2026-07-31
TASK-029	Implementasi Performance Testing & Optimization	TODO	P3	Lead Developer	All features	Lighthouse score > 90	2026-07-31



ID Kandidat	Deskripsi Temuan	Saran Prioritas	Sumber	Perlu Triage Oleh
[GAP-001]	Penyimpanan Offline (Offline Storage): Mengingat HeavyInspect digunakan untuk inspeksi lapangan dengan konektivitas tidak stabil, diperlukan mekanisme sinkronisasi data dan caching lokal yang lebih kompleks.	P1	Technical Discovery / System Review	Lead Systems Architect & Product Manager

5. Log Pekerjaan Selesai dan Dibatalkan

Pindahkan detail tugas yang sudah berstatus DONE atau CANCELLED ke bagian ini untuk menjaga kebersihan backlog aktif.

[ALL TASKS 001-025] — Phase 1-7: Core Foundation through Advanced Features

* Status / Prioritas: DONE / P0-P2
* Tujuan (Goal): Implementasi lengkap fitur aplikasi P2H dari awal hingga fitur advanced (QR Scanner, Photo Capture, Sequential Signing, Digital Signature, Dashboard, Report History, CRUD Users/Units/Checklist, GPS, Image Compression, Push Notification, Audit Log).
* Bukti Verifikasi: npm run build passes (22 routes). Semua TypeScript clean, tidak ada error.

[0.15.0 BATCH] — 15 Adjustments (v0.15.0)

* Status / Prioritas: DONE / P1
* Tujuan (Goal): Implementasi 15 penyesuaian: notifications DB-backed, user password management (auto-gen, forced change), unit master fields (SN, WO/JO, Zone, Inspection Start), Excel import, additional notes, SMR→HM rename, Unchecked→Replace, security fixes (passwordHash stripping, QR security), schema changes (notifications, audit_log, unit_checklist_items, checklist_categories).
* Bukti Verifikasi: npm run build passes. Notifications flow verified (DB-backed, 30s auto-refresh). Password flow verified (auto-gen → forced change → admin reset). Excel import verified (POST /api/admin/users/import). Schema pushed via push-schema.cjs (12 tables total).

[0.15.0 DOC AUDIT] — Documentation Synchronization

* Status / Prioritas: DONE / P2
* Tujuan (Goal): Audit dan update seluruh dokumentasi proyek agar sinkron dengan implementasi v0.15.0.
* Bukti Verifikasi: Semua 7 dokumen utama diperbarui (CHANGELOG, ERD, API_SPEC, DEV_LOG, HANDOFF, BACKLOG, TASK_BREAKDOWN).
