04_TSD.md — Spesifikasi Arsitektur Teknis HeavyInspect

Project: HeavyInspect Version / status: 1.0.0 / APPROVED Owner: Gita Rahma Fitriani Last reviewed: 2026-07-30

1. Architecture

* Style: Modular Monolith menggunakan Next.js App Router. Arsitektur ini mengonsolidasikan logika bisnis ke dalam modul-modul domain yang terisolasi dalam satu unit deployment tunggal untuk meminimalkan kompleksitas operasional di lapangan.
* Context diagram: Sistem beroperasi sebagai aplikasi web full-stack terintegrasi. Next.js bertindak sebagai entry point utama yang menangani rendering sisi klien (React) dan logika sisi server (Server Actions/API). Data persisten disimpan dalam SQLite 3, di mana proses Node.js berinteraksi langsung dengan berkas database pada file system lokal melalui mekanisme penguncian (locking) tingkat database. Komunikasi antar modul dilakukan melalui pemanggilan fungsi internal yang didefinisikan sebagai public interfaces.
* Components and responsibilities:

Component	Responsibility	Owned data	Interfaces
UI Layer	Rendering responsif (Tailwind CSS), validasi input instan, manajemen local state (IndexedDB/LocalStorage).	State input sementara, cache tampilan.	React Props, Client Hooks.
Application Layer	Koordinasi use case, penegakan aturan bisnis per domain, penanganan otorisasi.	Logika domain, aturan validasi server-side.	Server Actions, Internal Module API.
Persistence Layer	Manajemen transaksi ACID lokal, pengelolaan koneksi SQLite, optimasi performa read/write.	Berkas .sqlite3 (Asset, Inspection, User).	SQL Queries (Drizzle/Prisma), WAL Mode.

2. Technology decisions

Area	Choice	Version	Rationale	Alternatives rejected
Framework	Next.js	14+ (App Router)	Mendukung SSR untuk performa awal yang cepat dan Server Actions untuk komunikasi data yang efisien.	React SPA (Client-only)
Language	TypeScript	5.0+	Menjamin type safety pada kontrak antar modul dan mengurangi runtime error di lapangan.	JavaScript
Styling	Tailwind CSS	3.0+	Utility-first yang ringan, memastikan UI tetap responsif pada perangkat mobile dengan bandwidth terbatas.	Bootstrap, CSS-in-JS
Database	SQLite 3	Latest	Zero-configuration, performa tinggi untuk operasi read-heavy, dan kemudahan backup berupa penyalinan berkas tunggal.	PostgreSQL, MySQL

3. Module boundaries

Module	Owns	Depends on	Public interface	Forbidden responsibility
Asset	Spesifikasi teknis unit (Komatsu PC 200-8), status kesehatan alat.	-	getUnitDetail, updateAssetStatus	Dilarang mengubah status Approval secara langsung.
Inspection	Logika form P2H (Engine, Hydraulic), validasi ambang batas teknis.	Asset	submitInspection, getInspectionHistory	Dilarang akses SQL langsung ke tabel Asset atau User; wajib melalui antarmuka publik.
Approval	Alur kerja otorisasi, verifikasi tanda tangan digital supervisor.	Inspection	processApproval, getPendingTasks	Dilarang mengubah data spesifikasi teknis pada Modul Asset.

4. Key flows and failure handling

Pemeriksaan Harian (P2H) Komatsu PC 200-8

1. Inisialisasi: Sistem memuat parameter validasi spesifik PC 200-8 (misal: ambang batas tekanan hidrolik).
2. Input Lapangan: Operator mengisi data poin pemeriksaan melalui perangkat mobile.
3. Validasi Klien: Pengecekan tipe data dan kelengkapan secara instan.
4. Persistensi Lokal: Data disimpan sementara di IndexedDB browser untuk mencegah kehilangan data jika koneksi terputus.
5. Sinkronisasi: Server Action mengirimkan data ke Persistence Layer.
6. Commit: Transaksi atomik menyimpan data ke tabel inspections dan inspection_details.

Consistency model: Local ACID Transactions. Seluruh entri P2H harus berhasil ditulis secara utuh atau dibatalkan sepenuhnya untuk menjaga integritas relasional. Idempotency key: Menggunakan kombinasi unit_id, operator_id, dan timestamp_date untuk mencegah duplikasi laporan pada hari yang sama. Retries, timeouts, and compensation:

* Lock Contention: Jika SQLite terkunci, sistem melakukan retry otomatis 3x dengan exponential backoff.
* Timeout: Batas waktu koneksi ditetapkan 10 detik; jika terlampaui, sistem memberikan pesan "Database Connection Timeout".
* Compensation: Jika transaksi gagal setelah retry, pengguna diarahkan untuk memulihkan draf dari local state (IndexedDB). Observability:
* Logs: Pencatatan aktivitas via JSON terstruktur (level: INFO/ERROR) untuk setiap kegagalan sinkronisasi.
* Metrics: Pelacakan waktu penyelesaian inspeksi (completion time) dan tingkat kegagalan transaksi (transaction failure rate).

5. Security and operations

* Authentication / authorization: Session-based Authentication yang dilindungi oleh Next.js Middleware. RBAC membatasi akses: Operator (Write P2H), Supervisor (Approve), Admin (Manage Asset).
* Secret handling: Kredensial database dan kunci enkripsi sesi disimpan secara eksklusif dalam variabel lingkungan (.env) yang tidak masuk ke kontrol versi.
* Data classification / encryption:
  * PII: Data operator dan supervisor diklasifikasikan sebagai sensitif.
  * Operational Data: Hasil inspeksi teknis unit (PC 200-8).
  * Encryption: Seluruh komunikasi wajib melalui HTTPS; data sensitif di database dienkripsi pada tingkat aplikasi jika diperlukan.
* Rate limits / abuse controls: Implementasi rate limiting pada API rute /api/inspection (maksimal 10 submisi per menit per user) untuk mencegah serangan DoS atau pengiriman data sampah.
* Environments / configuration: Tersedia lingkungan development untuk local testing dan production untuk penggunaan operasional lapangan.
* Deployment / rollback: Strategi blue-green deployment sederhana dengan memvalidasi berkas .sqlite3 sebelum penggantian binary aplikasi.
* Backup / recovery objectives:
  * RPO (Recovery Point Objective): 24 jam (backup harian).
  * RTO (Recovery Time Objective): 1 jam melalui pemulihan berkas database.
  * WAL Mode: Mengaktifkan Write-Ahead Logging pada SQLite untuk meningkatkan konkurensi tulis dan ketahanan terhadap kerusakan berkas saat terjadi mati listrik mendadak.

6. Non-functional requirements

Kategori	Persyaratan	Measurement	Target
Performance	Kecepatan render UI mobile.	Largest Contentful Paint (LCP)	< 2.5 Detik
Availability	Ketersediaan sistem operasional.	Uptime Monitoring	99.5%
Accessibility	Kemudahan penggunaan bagi operator.	WCAG 2.1 Level AA	Kontras rasio > 4.5:1, Target sentuh > 44px
Robustness	Penanganan konkurensi database.	Concurrent Write Tests	Sukses menangani 10 submisi simultan tanpa korupsi data
