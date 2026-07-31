Changelog

Semua perubahan penting dalam proyek ini akan didokumentasikan di sini. Format penulisan mengikuti standar Keep a Changelog dan mematuhi aturan Semantic Versioning.

[Unreleased]

Added

* [Kosong / Belum ada perubahan]

[0.16.0] - 2026-08-01

Changed

* Indonesian Localization: Terjemahkan seluruh UI text ke Bahasa Indonesia untuk konsistensi — mencakup semua komponen utama: BottomNav, dashboard pages (Mahasiswa/Approval/Dosen), ScannerView, ReportList, ReportDetail, ProfileForm, MaintenanceChecksheet, checksheet page, units page, admin pages, AdminNav, AdminSidebar, login form, dan change-password page.
* Status Labels Indonesian: Status badges diseragamkan — Approved→Disetujui, Submitted→Menunggu Instruktur, PendingSupervisor→Menunggu Dosen, Rejected→Ditolak, Draft→Draft.
* Admin Page Indonesian: Statistik (Total Laporan, Menunggu Persetujuan), quick links (Kelola User, Kelola Unit, Master Sheet), heading (Laporan Terkini, Aktivitas Terkini, Status Unit).
* Login Form Indonesian: Welcome Back→Selamat Datang, Sign In→Masuk, placeholder teks, P2H Digital Inspection System→Sistem Inspeksi P2H Digital.
* Checklist Indonesian: Condition→Kondisi, Priority Condition→Prioritas Kondisi, Action→Tindakan, Additional Fluids→Penambahan Fluida, deskripsi kolom, status counts (Baik/Buruk/belum dicek).
* Dashboard Stats Indonesian: Total Reports→Total Laporan, Pending Review→Menunggu Review, Recent Reports→Laporan Terkini, New Inspection→Inspeksi Baru, View All Reports→Lihat Semua Laporan.
* Profile Form Indonesian: Full Name→Nama Lengkap, Current Password→Password Saat Ini, New Password→Password Baru, Confirm New Password→Konfirmasi Password Baru, Save Changes→Simpan Perubahan, Change Password→Ubah Password.
* NotificationBell Indonesian: Sudah lengkap dalam Bahasa Indonesia — Notifikasi, Tandai semua dibaca, Belum ada notifikasi, Lihat Detail.
* Admin Nav/Sidebar Indonesian: Users→User, Units→Unit, Admin Panel→Panel Admin, Manage Data→Kelola Data.
* README Updated: Dokumentasi README.md diperbarui — Tech Stack (PostgreSQL 18 lokal), fitur lanjutan (notifikasi, admin sidebar, audit log), project structure lengkap, daftar 8 unit, dan instruksi setup database.

[0.15.0] - 2026-07-31

Added

* Unit Master Fields: Kolom serial_number, wo_jo_no, zone, inspection_start pada tabel units untuk data teknis unit.
* Unit Master Auto-fill: Form P2H otomatis mengisi S/N, WO/JO, Zone dari data master unit saat tidak ada draft.
* User Password Management: Kolom must_change_password dan generated_password pada tabel users.
* Auto-generated Password: Admin dapat membuat user tanpa password — sistem generate otomatis 12 karakter.
* Forced Password Change: User dengan must_change_password=1 akan di-redirect ke /change-password saat login.
* Change Password Page: Halaman /change-password untuk mengganti password paksa saat login pertama.
* Reset Password: Admin dapat reset password user dari UserList — password baru ditampilkan dan disalin ke clipboard.
* Notifications Table: Tabel notifications di database untuk notifikasi persistent (bukan hanya client-side).
* Notifications Server Actions: pushNotification, getMyNotifications, markNotificationRead, markAllNotificationsRead.
* Reject Notifications: Operator mendapat notifikasi saat laporan ditolak oleh Instruktur/Dosen.
* Approve Notifications: Operator mendapat notifikasi saat laporan di-approve Leader atau Supervisor.
* Excel Import: Endpoint POST /api/admin/users/import untuk bulk import user dari file Excel (.xlsx/.xls/.csv).
* Excel Import UI: Tombol "Import Excel" di halaman admin users — parse kolom username, fullName, role.
* Additional Notes: Bagian "Additional Notes" di form P2H dengan tombol "Add Row" untuk catatan dinamis.
* Audit Log Table: Tabel audit_log untuk pencatatan semua aksi penting (create, approve, reject).
* Unit Checklist Items: Tabel unit_checklist_items untuk mapping parameter ke unit tertentu.
* Checklist Categories: Tabel checklist_categories untuk pengelompokan parameter berdasarkan kategori.

Changed

* SMR Rename: Label "SMR" diubah menjadi "HM (Hour Meter)" di seluruh form P2H dan admin units.
* Condition Replace: Label "Unchecked" diubah menjadi "Replace" pada kondisi inspeksi.
* Login Cleanup: Bagian demo accounts dihapus dari form login.
* Password Hash Security: Field passwordHash di-strip dari semua API response admin users (POST/PUT).
* URL Revalidation: revalidationPath untuk review menggunakan encryptId untuk mencegah stale cache.

Fixed

* Dosen Sign Bug: revalidationPath('/review/${reportId}') menggunakan raw ID, sekarang menggunakan encryptId.
* Schema Parse Error: Field "read" di notifications table menyebabkan error reserved keyword — diganti "is_read".
* Turbopack Parse: Field enum pada text() notifications type menyebabkan parse error — dihapus.
* Delete Operator: "delete result.passwordHash" error TypeScript — diganti destructuring.
* FormatTime Type: formatTime() menerima string | Date dari database, bukan hanya Date.

Database

* Added: notifications (id, user_id, type, title, message, is_read, action_url, created_at)
* Added: audit_log (id, user_id, action, entity, entity_id, details, ip_address, created_at)
* Added: unit_checklist_items (id, unit_id, parameter_id, sort_order, is_active, created_at)
* Added: checklist_categories (id, letter, name, sort_order, is_active, deleted_at, created_at, updated_at)
* Modified: units — tambah serial_number, wo_jo_no, zone, inspection_start
* Modified: users — tambah must_change_password, generated_password

API

* Added: POST /api/admin/users/import — bulk import user dari Excel
* Added: POST /api/admin/users/{id} (resetPassword) — reset password user
* Modified: POST /api/admin/users — auto-generate password jika tidak disediakan
* Modified: PUT /api/admin/users/{id} — strip passwordHash dari response

[0.14.0] - 2026-07-31

Added

* URL ID Encryption: Enkripsi HMAC-SHA256 untuk semua ID di URL (reports, review) mencegah ID enumeration.
* Crypto Utility: Modul src/lib/crypto.ts dengan encryptId/decryptId.
* ENCRYPTION_KEY: Environment variable untuk secret key enkripsi.
* Report Detail: Tampilan tanda tangan digital (gambar base64), data GPS, penambahan fluida, dan timestamp.
* Report Detail: Fetch nama Instruktur dan Dosen untuk tampilan tanda tangan.
* Report Detail: Timestamp createdAt dan updatedAt ditampilkan.

Changed

* P2H Form QA Code: QA10 diubah ke QAxx (xx = jam saat inspeksi, misal QA14 untuk jam 14:00).
* P2H Form Location: Field lokasi teks dihapus, GPS coordinates tetap ditangkap secara otomatis.
* Dashboard Supervisor: ApprovalDashboard ditambahkan untuk role supervisor agar Dosen dapat melihat review links.
* Role Labels: Standarisasi label peran — operator=Mahasiswa, leader=Instruktur, supervisor=Dosen.
* Logo: Background putih solid + ring untuk visibility di dark theme.
* README: Diganti dengan project-specific README.

Fixed

* Security: Auto-create checklist parameters di submitP2HReport dihapus (parameter injection risk).
* Build Errors: Missing imports Box, HardHat, BookOpen, Shield, Users di admin components.
* Legacy Data: Soft-delete parameter legacy (id 14, 15) yang tidak memiliki category_id.

Removed

* Public assets unused: file.svg, globe.svg, next.svg, vercel.svg, window.svg.
* .playwright-mcp: Session logs cleanup.
* .omo: Stale continuation session cleanup.
* scripts: Empty directory removal.

[0.12.0] - 2026-07-31

Added

* Audit Log System: Sistem pencatatan audit untuk semua aksi penting.
* Audit Log Table: Tabel audit_log di database.
* Audit Utility: Modul terpusat untuk logging aksi user.

[0.11.0] - 2026-07-31

Added

* Push Notification System: Sistem notifikasi dengan bell icon di dashboard.
* Notification Bell: Bell icon dengan unread count badge.
* Notification Dropdown: Dropdown notifikasi dengan action links.
* Mark as Read: Tandai notifikasi sebagai sudah dibaca.

[0.10.0] - 2026-07-31

Added

* Client-side Image Compression: Kompresi gambar otomatis di browser sebelum upload.
* Compression Utility: Modul terpusat untuk kompresi gambar dengan konfigurasi fleksibel.
* Compression Logging: Log rasio kompresi di console untuk debugging.

[0.9.0] - 2026-07-31

Added

* GPS Coordinates Capture: Penangkapan koordinat GPS operator saat inspeksi.
* GPS Status UI: Indikator status GPS di form inspeksi (loading, success, error).
* GPS Fields: Field GPS disimpan ke database (latitude, longitude, accuracy, timestamp).

[0.8.0] - 2026-07-31

Added

* Admin Checklist Management: Halaman manajemen parameter checklist untuk Admin (CRUD).
* Checklist Parameter Form: Form tambah/edit parameter dengan kategori dan deskripsi.
* API Routes: Endpoint RESTful untuk CRUD parameter checklist (/api/admin/checklist).

[0.7.0] - 2026-07-31

Added

* Admin Unit Management: Halaman manajemen unit alat berat untuk Admin (CRUD).
* Unit Form: Form tambah/edit unit dengan validasi kode unik.
* API Routes: Endpoint RESTful untuk CRUD unit (/api/admin/units).

[0.6.0] - 2026-07-31

Added

* Admin User Management: Halaman manajemen pengguna untuk Admin (CRUD).
* Admin Navigation: Navigasi antar halaman admin (Users, Units, Checklist).
* User Form: Form tambah/edit pengguna dengan validasi.
* API Routes: Endpoint RESTful untuk CRUD pengguna (/api/admin/users).

[0.5.0] - 2026-07-31

Added

* Report History: Halaman daftar riwayat laporan inspeksi untuk semua role.
* Report Detail: Halaman detail lengkap laporan dengan status approval dan bukti foto.
* Role-based Filtering: Operator melihat laporannya sendiri, Leader/Supervisor melihat semua.
* Navigation Links: Tautan riwayat ditambahkan ke dashboard Mahasiswa dan Leader.

[0.4.0] - 2026-07-31

Added

* Dosen Dashboard: Dashboard analitik untuk role Supervisor/Dosen dengan statistik laporan, status unit, dan riwayat aktivitas.
* Summary Statistics: 4 kartu statistik (Total, Disetujui, Menunggu, Ditolak).
* Unit Status: Daftar unit dengan jumlah laporan inspeksi.
* Recent Activity: 10 aktivitas inspeksi terbaru dengan status.

Changed

* Dashboard Page: Role supervisor sekarang menampilkan DosenDashboard.
* Role Labels: Label dashboard disesuaikan (Mahasiswa, Instruktur, Dosen).

[0.3.0] - 2026-07-31

Added

* Sequential Signing: Implementasi alur persetujuan bertingkat sesuai BR-008 (Submitted → PendingSupervisor → Approved).
* Reject Feature: Fitur penolakan laporan dengan alasan yang dikembalikan ke Mahasiswa untuk perbaikan.
* Status Badges: Tampilan status visual (Menunggu Instruktur, Menunggu Dosen, Disetujui, Ditolak).
* Signature Progress: Indikator tanda tangan bertingkat (Mahasiswa → Instruktur → Dosen).

Changed

* Database Schema: Status enum diperbarui (Draft, Submitted, PendingSupervisor, Approved, Rejected).
* Database Schema: Field rejection_reason ditambahkan ke p2h_reports.
* Server Actions: approveP2HReport dengan validasi transisi status.
* Server Actions: rejectP2HReport untuk penolakan laporan.
* ReviewForm: Integrasi dengan status badge, tombol reject, dan info persetujuan.
* ApprovalDashboard: Query status PendingSupervisor untuk Supervisor.

[0.2.1] - 2026-07-30

Added

* Photo Capture: Komponen PhotoCapture untuk mengambil foto bukti inspeksi menggunakan kamera perangkat.
* Image Compression: Kompresi gambar otomatis di client-side (max 1920px, quality 0.8) untuk mengurangi ukuran data.
* Photo Management: Fitur preview, retake, dan delete foto pada form P2H.

Changed

* P2HForm: Mengintegrasikan komponen PhotoCapture untuk menggantikan mock photo capture.
* Dependencies: Tidak ada penambahan dependency baru (menggunakan browser native API).

[0.2.0] - 2026-07-30

Added

* Real QR Scanner: Implementasi scanner QR Code nyata menggunakan html5-qrcode dengan akses kamera perangkat dan fallback ke input manual.
* Task Breakdown: Dokumen 13_TASK_BREAKDOWN.md dengan hierarki roadmap pengiriman 29 tugas.
* Backlog Update: 4 tugas aktif ditambahkan ke 09_BACKLOG.md (TASK-004, TASK-008, TASK-013, TASK-015).

Fixed

* Tailwind CSS v4 compatibility: Mengubah @apply directive ke plain CSS untuk custom classes (btn-glove, btn-primary).
* TypeScript errors: Memperbaiki implicit any type pada ApprovalDashboard dan type mismatch pada P2HForm.
* Build error: Membersihkan generated files untuk menyelesaikan type checker error pada Next.js 16.

Changed

* Dependencies: Menambahkan html5-qrcode@2.3.8 untuk QR scanning.

[1.0.0] - 2026-07-30

Added

* Finalisasi rangkaian dokumentasi baseline proyek (File 01-16) sebagai landasan pengembangan sistem HeavyInspect.
* Aturan Proyek (01_PROJECT_RULES.md): Menyusun tata kelola dan pedoman operasional yang mengikat bagi kontributor manusia serta agen AI.
* Spesifikasi Produk (02_PRD.md): Penetapan cakupan produk, visi, dan definisi peran pengguna yang meliputi Mahasiswa, Instruktur, dan Dosen.
* Spesifikasi Fungsional (03_FSD.md): Definisi perilaku fungsional sistem, modul kerja, dan aturan bisnis utama.
* Spesifikasi Teknis (04_TSD.md): Detail arsitektur sistem dan keputusan teknologi berbasis Next.js dan SQLite.
* Skema Database (05_ERD.md): Definisi model data, struktur tabel, relasi entitas, dan aturan integritas data.
* Spesifikasi API (06_API_SPEC.md): Kontrak endpoint, protokol komunikasi, dan standarisasi envelope error.
* Spesifikasi UI/UX (07_UI_UX_SPEC.md): Kontrak visual, standar interaksi pengguna, dan kebijakan desain responsif.
* Rencana Pengujian (08_TEST_PLAN.md): Deskripsi komprehensif mengenai sasaran kualitas, strategi pengujian, dan kriteria keberhasilan rilis.

Release categories

Kategori rilis yang diizinkan dalam dokumen ini adalah: Added, Changed, Deprecated, Removed, Fixed, Security, Performance, Database, API, dan Documentation. Hanya kategori yang memiliki perubahan yang boleh dicantumkan dalam setiap entri rilis di masa mendatang.

Versioning policy

Proyek ini menggunakan Semantic Versioning dengan ketentuan sebagai berikut:

* MAJOR: Digunakan untuk perubahan pada API publik, struktur data, atau perilaku produk yang tidak kompatibel dengan versi sebelumnya (breaking changes).
* MINOR: Digunakan untuk penambahan fitur baru yang bersifat backward-compatible.
* PATCH: Digunakan untuk perbaikan masalah (bug fixes), pembaruan keamanan, atau koreksi dokumentasi yang bersifat backward-compatible.

Catatan: Seluruh aktivitas pekerjaan yang berkaitan dengan tahap pengembangan internal wajib dicatat dalam 10_DEV_LOG.md dan hanya boleh dipromosikan ke dalam Changelog ini apabila telah resmi dirilis.
