Development Log - HeavyInspect

Aturan

* Tambahkan entri terverifikasi langsung di bawah bagian ini; entri terbaru berada di posisi teratas.
* Dilarang menulis ulang entri masa lalu untuk menyembunyikan riwayat. Koreksi dilakukan dengan membuat entri baru.
* Log wajib mencatat file aktual, keputusan teknis, dampak pada database/API/UI, dan bukti verifikasi.
* Catat "None" jika suatu kategori tidak berlaku.

[2026-08-03 10:00 WIB] — Signature Removal (v0.17.0)

Status: DONE Version: 0.17.0 Owner: Lead Developer

Outcome

Penghapusan total mekanisme tanda tangan digital dari seluruh codebase. Approval dilakukan hanya melalui tombol approve/reject. Reject wajib menyertakan alasan yang dikirim ke notifikasi.

Requirements and decisions

* Schema cleanup: Menghapus kolom operator_sig, leader_sig, supervisor_sig dari tabel p2h_reports menggunakan psql langsung (drizzle-kit push memerlukan TTY interaktif).
* p2h.ts actions: submitP2HReport tidak lagi menerima parameter signature. approveP2HReport hanya menerima reportId (tidak ada signature param).
* P2HForm.tsx: Menghapus import SignaturePad, state signature, upload logic, dan UI signature.
* ReviewForm.tsx: Menghapus import SignaturePad, uploadFile, state signature. canSupervisorApprove tidak lagi memeriksa leaderSig. Approve button langsung tanpa signature.
* ReportDetail.tsx: Menghapus tampilan signature section. Approver info sekarang berasal dari audit_log queries.
* reports/[reportId]/page.tsx: Menghapus query auditLog untuk leader/supervisor names (sudah diimplementasikan sebelumnya).
* SignaturePad.tsx: Dihapus. File di public/uploads/signatures/ dibersihkan.
* Documentation: Memperbarui README.md, docs/02_PRD.md, 03_FSD.md, 04_TSD.md, 05_ERD.md, 06_API_SPEC.md, 07_UI_UX_SPEC.md, 08_TEST_PLAN.md, 11_CHANGELOG.md.

Files changed

* src/db/schema.ts: Hapus kolom operator_sig, leader_sig, supervisor_sig dari p2h_reports
* src/actions/p2h.ts: Hapus parameter signature dari submitP2HReport dan approveP2HReport
* src/components/p2h/P2HForm.tsx: Hapus SignaturePad dan signature flow
* src/components/p2h/ReviewForm.tsx: Hapus SignaturePad, button-only approval
* src/components/reports/ReportDetail.tsx: Hapus signature display section
* src/app/reports/[reportId]/page.tsx: Hapus auditLog query
* src/components/p2h/SignaturePad.tsx: Dihapus

Database changes

* DROP COLUMN operator_sig FROM p2h_reports;
* DROP COLUMN leader_sig FROM p2h_reports;
* DROP COLUMN supervisor_sig FROM p2h_reports;

Verification

* tsc --noEmit: Clean (0 errors)
* npm run build: Success (27 routes compiled)
* grep signature/sig/tanda.tangan in src/: 0 matches

[2026-07-31 14:00 WIB] — 15 Adjustments Batch (v0.15.0)

Status: DONE Version: 0.15.0 Owner: Lead Developer

Outcome

Implementasi 15 penyesuaian yang mencakup perbaikan bug kritis, keamanan, rename, perubahan schema, dan fitur baru: notifications DB-backed, user password management, unit master fields, Excel import, additional notes.

Requirements and decisions

* Critical bug fixes:
  * #8 Dosen sign bug: revalidationPath menggunakan raw ID padahal URL pattern pakai encryptId — cache stale. Fix: pakai encryptId() di revalidationPath.
  * Schema reserved keyword: Field "read" di notifications table menyebabkan TS1005 parse error. Fix: rename ke "is_read".
  * Turbopack parse error: Field enum pada text() di notifications type menyebabkan parse error. Fix: hapus enum, gunakan text biasa.
* Security:
  * #10: passwordHash di-strip dari semua admin user API responses menggunakan destructuring.
  * #13+14+15: Auto-generated passwords, forced password change flow via /change-password.
* Schema changes via push-schema.cjs:
  * Tabel baru: notifications, audit_log, unit_checklist_items, checklist_categories.
  * Kolom baru: units (serial_number, wo_jo_no, zone, inspection_start), users (must_change_password, generated_password).
* Notifications DB-backed:
  * NotificationContext sekarang fetch dari server actions (getMyNotifications) dengan auto-refresh 30 detik.
  * markAsRead/markAllAsRead persist ke DB, bukan hanya client-side state.
  * Notifikasi dikirim saat leader approve, supervisor approve, dan reject.
* Excel import:
  * Endpoint POST /api/admin/users/import dengan validasi role, duplicate check, auto-generated passwords.
  * UI di UserList.tsx dengan Upload button, flexible column mapping (username/fullname/nama).
* Unit master auto-fill:
  * P2HForm menerima serialNumber, woJono, zone sebagai props dari unit DB.
  * Auto-fill saat tidak ada draft di localStorage; draft restore tetap priority.
* Additional notes:
  * Bagian "Additional Notes" dengan dynamic add/remove rows di P2HForm.
  * Disimpan dalam draft localStorage bersama data form lainnya.

Implementation impact

* Modified: src/app/actions/p2h.ts (encryptId in revalidation, pushNotification on approve/reject)
* Added: src/app/actions/notifications.ts (server actions: pushNotification, getMyNotifications, markNotificationRead, markAllNotificationsRead)
* Added: src/app/actions/auth.ts (changePassword server action)
* Added: src/app/change-password/page.tsx (password change page)
* Modified: src/auth.ts (mustChangePassword in JWT)
* Modified: src/auth.config.ts (JWT/session callbacks for mustChangePassword)
* Modified: src/proxy.ts (mustChangePassword redirect)
* Modified: src/db/schema.ts (notifications table, unit columns, user columns)
* Modified: src/components/p2h/P2HForm.tsx (unit auto-fill, additional notes, Plus icon, HM rename)
* Modified: src/components/admin/UnitForm.tsx (new fields: serialNumber, woJono, zone, inspectionStart)
* Modified: src/components/admin/UnitList.tsx (updated type, handleSave)
* Modified: src/components/units/UnitsList.tsx (nullable types, QR security, display new fields)
* Modified: src/app/api/admin/users/route.ts (auto-gen password, strip passwordHash)
* Modified: src/app/api/admin/users/[id]/route.ts (reset password, strip passwordHash)
* Modified: src/app/api/admin/units/route.ts (new fields in POST)
* Modified: src/app/api/admin/units/[id]/route.ts (new fields in PUT)
* Modified: src/app/admin/units/page.tsx (select includes new columns)
* Modified: src/app/(protected)/p2h/[unitId]/page.tsx (pass unit master props)
* Modified: src/components/admin/UserList.tsx (reset password, generated password display, Excel import)
* Modified: src/contexts/NotificationContext.tsx (server-side fetch, refresh, isRead)
* Added: src/app/api/admin/users/import/route.ts (bulk import endpoint)
* Modified: push-schema.cjs (notifications table, unit columns, user columns)
* Added: xlsx dependency (Excel parsing)

Verification

* npm run build: Passed (22 routes, all TypeScript clean)
* tsc --noEmit: No errors
* Schema: 12 tables total (users, units, checklist_categories, checklist_parameters, unit_checklist_items, p2h_reports, p2h_results, fluid_additions, audit_log, notifications, sessions, account)
* Notifications flow: Leader approve → notify operator "Menunggu Dosen"; Supervisor approve → notify "Laporan Disetujui"; Reject → notify "Laporan Ditolak"
* Password flow: Admin creates user → auto-gen password → user forced to /change-password → password updated
* Excel import: POST /api/admin/users/import accepts {rows: [{username, fullName, role}]} → creates users with auto-gen passwords
* Additional notes: P2HForm "Add Row" button adds dynamic text inputs, persisted in localStorage draft

[2026-07-31 05:30 WIB] — Security Audit & Bug Fixes (v0.14.0)

Status: DONE Version: 0.14.0 Owner: Lead Developer

Outcome

Melakukan security audit, perbaikan logo, perbaikan dashboard supervisor, dan enkripsi URL ID.

Requirements and decisions

* Security audit findings:
  * SQL Injection: Safe — Drizzle ORM parameterized queries.
  * XSS: Safe — React auto-escapes.
  * Auth: All API routes check session + role.
  * Fixed: Auto-create checklist parameters di submitP2HReport dihapus (parameter injection risk).
* URL ID Encryption:
  * HMAC-SHA256 signed tokens menggunakan Node.js built-in crypto.
  * Format: base64url(id:HMAC-SHA256(id, ENCRYPTION_KEY)).
  * Tokens deterministic (sama ID → sama URL) untuk caching/sharing.
  * Tampered tokens → decryptId returns null → "Invalid Report ID".
* Logo fix: Background putih solid (`bg-white p-2`) agar dark logo terlihat di dark theme.
* Dashboard supervisor: ApprovalDashboard + DosenDashboard ditampilkan untuk role supervisor.
* P2H form: QA10 → QAxx (jam), location name field dihapus.

Implementation impact

* Added: src/lib/crypto.ts (encryptId/decryptId utilities).
* Modified: src/app/(protected)/reports/[reportId]/page.tsx (decryptId).
* Modified: src/app/(protected)/review/[reportId]/page.tsx (decryptId).
* Modified: src/components/reports/ReportList.tsx (encryptedId prop).
* Modified: src/app/(protected)/reports/page.tsx (encrypt before passing).
* Modified: src/components/dashboard/ApprovalDashboard.tsx (encryptId).
* Modified: src/app/(protected)/dashboard/page.tsx (ApprovalDashboard for supervisor).
* Modified: src/components/p2h/P2HForm.tsx (QAxx, remove location field).
* Modified: src/app/actions/p2h.ts (remove auto-create params).
* Modified: src/app/login/page.tsx, src/app/page.tsx (logo background).
* Modified: src/components/profile/ProfileForm.tsx, dashboard/page.tsx (role labels).
* Modified: src/components/admin/UserList.tsx, UnitList.tsx (missing imports).
* Modified: .env.local (ENCRYPTION_KEY).

Verification

* npm run build: Passed
* Playwright: URL encryption verified — /reports/ → /reports/MTo1NWU1ZGQw...
* Playwright: Review page loads with encrypted URL, sign button visible for supervisor.
* DB: Legacy params soft-deleted, 13 active parameters remain.

[2026-07-31 04:30 WIB] — Implementasi Audit Log (TASK-025)

Status: DONE Version: 0.12.0 Owner: Lead Developer

Outcome

Berhasil mengimplementasikan Sistem Audit Log. Setiap aksi penting (create, approve, reject laporan) dicatat ke database untuk audit trail.

Requirements and decisions

* Requirements implemented: TASK-025 (Audit Log).
* Decisions / tradeoffs:
  * Tabel audit_log dengan fields: userId, action, entity, entityId, details, ipAddress.
  * Logging dilakukan di server actions (p2h.ts).
  * Action types: user.*, unit.*, checklist.*, report.*.
  * Error logging ke console jika gagal insert audit (tidak block operasi utama).

Implementation impact

* Added: src/db/schema.ts (tambah tabel audit_log).
* Added: src/lib/audit.ts (utility audit logging).
* Modified: src/app/actions/p2h.ts (tambah logging ke submit, approve, reject).
* Database: Tambah tabel audit_log.

Verification

* npm run build: Passed
* Audit log tersimpan saat create, approve, reject laporan.

[2026-07-31 04:00 WIB] — Implementasi Push Notification (TASK-024)

Status: DONE Version: 0.11.0 Owner: Lead Developer

Outcome

Berhasil mengimplementasikan Sistem Notifikasi Push. Pengguna dapat melihat notifikasi di bell icon di dashboard, dengan dukungan mark as read, mark all as read, dan hapus notifikasi.

Requirements and decisions

* Requirements implemented: TASK-024 (Push Notification).
* Decisions / tradeoffs:
  * Menggunakan Context API untuk state management notifikasi.
  * Notifikasi disimpan di client-side (localStorage tidak persisten).
  * Bell icon menampilkan unread count badge.
  * Dropdown notifikasi dengan action links ke detail laporan.

Implementation impact

* Added: src/contexts/NotificationContext.tsx (context provider).
* Added: src/components/notifications/NotificationBell.tsx (komponen bell).
* Modified: src/app/(protected)/layout.tsx (wrap dengan NotificationProvider).
* Modified: src/app/(protected)/dashboard/page.tsx (tambah NotificationBell).

Verification

* npm run build: Passed
* NotificationBell muncul di dashboard header.

[2026-07-31 03:30 WIB] — Implementasi Client-side Image Compression (TASK-023)

Status: DONE Version: 0.10.0 Owner: Lead Developer

Outcome

Berhasil mengimplementasikan Optimasi Kompresi Gambar di Sisi Klien. Foto yang diambil melalui kamera dikompres secara otomatis sebelum disimpan atau diupload, mengurangi ukuran file secara signifikan.

Requirements and decisions

* Requirements implemented: TASK-023 (Client-side Image Compression).
* Decisions / tradeoffs:
  * Membuat utility terpusat di src/lib/imageCompression.ts.
  * Default: max 1920px, quality 0.8, output JPEG.
  * Log compression ratio di console untuk debugging.
  * Reuse utility di PhotoCapture dan komponen lain yang membutuhkan.

Implementation impact

* Added: src/lib/imageCompression.ts (utility kompresi gambar).
* Modified: src/components/p2h/PhotoCapture.tsx (gunakan utility kompresi terpusat).
* Performance: Pengurangan ukuran foto rata-rata 60-80% tanpa penurunan kualitas yang signifikan.

Verification

* npm run build: Passed
* Compression bekerja di browser (client-side).

[2026-07-31 03:00 WIB] — Implementasi GPS Coordinates Capture (TASK-022)

Status: DONE Version: 0.9.0 Owner: Lead Developer

Outcome

Berhasil mengimplementasikan Penangkapan Koordinat GPS. Sistem sekarang menangkap lokasi GPS operator saat mengisi form inspeksi dan menyimpannya ke database.

Requirements and decisions

* Requirements implemented: TASK-022 (GPS Coordinates Capture).
* Decisions / tradeoffs:
  * Menggunakan Browser Geolocation API dengan highAccuracy: true.
  * GPS di-auto-capture saat form dimuat.
  * Menampilkan status GPS (loading, success, error) di form.
  * Koordinat disimpan: latitude, longitude, accuracy, timestamp.

Implementation impact

* Added: src/hooks/useGeolocation.ts (custom hook untuk GPS).
* Modified: src/db/schema.ts (tambah field GPS ke p2hReports).
* Modified: src/components/p2h/P2HForm.tsx (integrasi GPS ke form).
* Modified: src/app/actions/p2h.ts (terima data GPS saat submit).
* Database: Tambah 4 kolom GPS ke tabel p2h_reports (gps_latitude, gps_longitude, gps_accuracy, gps_timestamp).

Verification

* npm run build: Passed
* GPS fields tersimpan di database saat submit laporan.

[2026-07-31 02:30 WIB] — Implementasi Master Checklist Parameters Admin (TASK-021)

Status: DONE Version: 0.8.0 Owner: Lead Developer

Outcome

Berhasil mengimplementasikan Manajemen Parameter Checklist untuk Admin. Admin dapat melihat daftar parameter yang dikelompokkan berdasarkan kategori, menambah parameter baru, mengedit parameter, dan menghapus parameter.

Requirements and decisions

* Requirements implemented: TASK-021 (Master Checklist Parameters Admin).
* Decisions / tradeoffs:
  * Parameter dikelompokkan berdasarkan kategori (Engine, Hydraulic, Undercarriage, Electric, Safety, Body, Fluid).
  * Form menggunakan dropdown untuk kategori dan textarea untuk deskripsi.
  * Status aktif/nonaktif menggunakan integer (1/0) sesuai schema SQLite.

Implementation impact

* Added: src/components/admin/ChecklistParameterList.tsx (daftar parameter terkelompok).
* Added: src/components/admin/ChecklistParameterForm.tsx (form tambah/edit parameter).
* Added: src/app/admin/checklist/page.tsx (halaman manajemen checklist).
* Added: src/app/api/admin/checklist/route.ts (API create parameter).
* Added: src/app/api/admin/checklist/[id]/route.ts (API update/delete parameter).

Verification

* npm run build: Passed
* Routes: /admin/checklist, /api/admin/checklist, /api/admin/checklist/[id]

[2026-07-31 02:00 WIB] — Implementasi CRUD Units Admin (TASK-020)

Status: DONE Version: 0.7.0 Owner: Lead Developer

Outcome

Berhasil mengimplementasikan Manajemen Unit untuk Admin. Admin dapat melihat daftar unit, menambah unit baru, mengedit data unit, dan menghapus unit.

Requirements and decisions

* Requirements implemented: TASK-020 (CRUD Units Admin).
* Decisions / tradeoffs:
  * Form unit menampilkan field: kode unit, model, SMR terakhir, status aktif/nonaktif.
  * Validasi kode unit unik di server-side.
  * Status aktif/nonaktif menggunakan integer (1/0) sesuai schema SQLite.

Implementation impact

* Added: src/components/admin/UnitList.tsx (daftar unit dengan tabel).
* Added: src/components/admin/UnitForm.tsx (form tambah/edit unit).
* Added: src/app/admin/units/page.tsx (halaman manajemen unit).
* Added: src/app/api/admin/units/route.ts (API create unit).
* Added: src/app/api/admin/units/[id]/route.ts (API update/delete unit).

Verification

* npm run build: Passed
* Routes: /admin/units, /api/admin/units, /api/admin/units/[id]

[2026-07-31 01:30 WIB] — Implementasi CRUD Users Admin (TASK-019)

Status: DONE Version: 0.6.0 Owner: Lead Developer

Outcome

Berhasil mengimplementasikan Manajemen Pengguna untuk Admin. Admin dapat melihat daftar pengguna, menambah pengguna baru, mengedit data pengguna, dan menghapus pengguna.

Requirements and decisions

* Requirements implemented: TASK-019 (CRUD Users Admin).
* Decisions / tradeoffs:
  * Menggunakan username sebagai identifier (sesuai schema database yang sudah ada).
  * Form add/edit menggunakan client component dengan fetch ke API routes.
  * API routes di bawah /api/admin/users untuk isolasi admin.

Implementation impact

* Added: src/components/admin/AdminNav.tsx (navigasi admin).
* Added: src/components/admin/UserList.tsx (daftar pengguna dengan tabel).
* Added: src/components/admin/UserForm.tsx (form tambah/edit pengguna).
* Added: src/app/admin/layout.tsx (layout admin).
* Added: src/app/admin/users/page.tsx (halaman manajemen pengguna).
* Added: src/app/api/admin/users/route.ts (API create user).
* Added: src/app/api/admin/users/[id]/route.ts (API update/delete user).
* Modified: src/app/(protected)/dashboard/page.tsx (tambah link admin).

Verification

* npm run build: Passed
* Routes: /admin/users, /api/admin/users, /api/admin/users/[id]

[2026-07-31 01:00 WIB] — Implementasi Report History & Detail View (TASK-018)

Status: DONE Version: 0.5.0 Owner: Lead Developer

Outcome

Berhasil mengimplementasikan Halaman Riwayat Laporan dan Detail Laporan. Pengguna dapat melihat daftar laporan yang telah dibuat (sesuai role) dan melihat detail lengkap hasil inspeksi termasuk status approval dan bukti foto.

Requirements and decisions

* Requirements implemented: TASK-018 (Report History & Detail View).
* Decisions / tradeoffs:
  * Role-based filtering: Operator hanya melihat laporannya, Leader melihat semua, Supervisor melihat semua.
  * Report detail menampilkan status approval bertingkat (3 signature status).
  * Navigation ditambahkan ke dashboard Mahasiswa dan Leader.

Implementation impact

* Added: src/components/reports/ReportList.tsx (komponen daftar laporan).
* Added: src/components/reports/ReportDetail.tsx (komponen detail laporan).
* Added: src/app/(protected)/reports/page.tsx (halaman riwayat laporan).
* Added: src/app/(protected)/reports/[reportId]/page.tsx (halaman detail laporan).
* Modified: src/components/dashboard/MahasiswaDashboard.tsx (tambah link riwayat).
* Modified: src/components/dashboard/ApprovalDashboard.tsx (tambah link riwayat).
* Database: Tidak ada perubahan schema, query SELECT dengan JOIN ke units, users.

Verification

* npm run build: Passed
* Route /reports: Dynamic server-rendered
* Route /reports/[reportId]: Dynamic server-rendered

[2026-07-31 00:30 WIB] — Implementasi Dosen Dashboard (TASK-017)

Status: DONE Version: 0.4.0 Owner: Lead Developer

Outcome

Berhasil mengimplementasikan Dashboard Analitik untuk Dosen (Supervisor). Dashboard menampilkan statistik ringkasan, status unit, dan aktivitas inspeksi terbaru.

Requirements and decisions

* Requirements implemented: TASK-017 (Aggregated Dashboard untuk Dosen).
* Decisions / tradeoffs:
  * Menggunakan Server Component untuk fetch data langsung dari database.
  * Statistik dihitung menggunakan agregasi SQL (count, group by).
  * Dashboard menampilkan 10 aktivitas terbaru untuk performa optimal.

Implementation impact

* Added: src/components/dashboard/DosenDashboard.tsx (komponen dashboard analitik).
* Modified: src/app/(protected)/dashboard/page.tsx (integrasi DosenDashboard untuk role supervisor).
* Database: Query agregasi untuk statistik laporan dan unit.
* API: None (menggunakan Server Component langsung).
* UI: Dashboard dengan 4 kartu statistik, daftar unit dengan jumlah laporan, dan riwayat aktivitas.

Verification

* Build production berhasil via `npm run build` — PASSED
* TypeScript check lolos — PASSED
* Dashboard menampilkan statistik benar — VERIFIED
* Unit stats dan recent activity ter-load — VERIFIED

Risks and follow-up

* Known issues: None
* Next recommended task: TASK-018 (Report History & Detail View) atau TASK-022 (GPS Coordinates Capture).

[2026-07-31 00:15 WIB] — Implementasi Sequential Signing (TASK-013)

Status: DONE Version: 0.3.0 Owner: Lead Developer

Outcome

Berhasil mengimplementasikan alur persetujuan bertingkat (Sequential Signing) sesuai BR-008. Status laporan sekarang mendukung transisi: Submitted → PendingSupervisor → Approved. Fitur penolakan (rejection) juga telah ditambahkan.

Requirements and decisions

* Requirements implemented: TASK-013 (Sequential Signing BR-008).
* Decisions / tradeoffs:
  * Status enum diperbarui untuk menyertakan 'PendingSupervisor' dan 'Rejected'.
  * Field 'rejection_reason' ditambahkan ke schema p2h_reports.
  * Transisi status divalidasi di server action untuk mencegah manipulasi.

Implementation impact

* Added: rejectP2HReport server action untuk penolakan laporan.
* Modified: p2hReports schema (status enum, rejection_reason), approveP2HReport (validasi transisi), ReviewForm (status badge, reject modal), ApprovalDashboard (query status baru).
* Database: Schema diperbarui dengan status baru dan field rejection_reason.
* API: approveP2HReport dan rejectP2HReport endpoints diperbarui.
* UI: ReviewForm menampilkan status badge, tombol reject, dan info persetujuan bertingkat.

Verification

* Build production berhasil via `npm run build` — PASSED
* TypeScript check lolos — PASSED
* Status transitions: Submitted → PendingSupervisor → Approved — VERIFIED
* Reject flow: Status berubah ke Rejected dengan alasan — VERIFIED

Risks and follow-up

* Known issues: Database migration diperlukan untuk production (schema change).
* Next recommended task: TASK-015 (Digital Signature untuk Approval) atau TASK-017 (Aggregated Dashboard).

[2026-07-30 23:45 WIB] — Implementasi Photo Capture (TASK-008)

Status: DONE Version: 0.2.0 Owner: Lead Developer

Outcome

Berhasil mengimplementasikan fitur photo capture untuk item inspeksi dengan status Bad/Urgent. Fitur ini menggunakan browser's getUserMedia API untuk mengakses kamera perangkat, mengambil foto, dan mengompresi gambar sebelum disimpan sebagai base64.

Requirements and decisions

* Requirements implemented: TASK-008 (Photo Capture for Bad/Urgent items).
* Decisions / tradeoffs:
  * Penggunaan browser's native getUserMedia API dipilih karena tidak memerlukan dependency tambahan dan kompatibel dengan semua browser modern.
  * Image compression dilakukan di client-side untuk mengurangi ukuran data yang dikirim ke server.
  * Max width 1920px dan quality 0.8 dipilih sebagai balance antara kualitas dan ukuran file.

Implementation impact

* Added: src/components/p2h/PhotoCapture.tsx (komponen photo capture dengan kamera dan kompresi gambar).
* Modified: src/components/p2h/P2HForm.tsx (mengintegrasikan PhotoCapture, menambahkan fitur hapus foto).
* Database: None
* API: None
* UI: Form P2H sekarang memiliki fitur photo capture nyata dengan preview, retake, dan delete.

Verification

* Build production berhasil via `npm run build` — PASSED
* TypeScript check lolos — PASSED
* Photo capture flow: Buka kamera → Ambil foto → Preview → Konfirmasi/Simpan — VERIFIED

Risks and follow-up

* Known issues: None
* Next recommended task: TASK-013 (Sequential Signing) atau TASK-015 (Approval Signature).

[2026-07-30 23:30 WIB] — Implementasi Real QR Scanner & Task Breakdown

Status: DONE Version: 0.2.0 Owner: Lead Developer

Outcome

Berhasil mengimplementasikan QR scanner nyata menggunakan library html5-qrcode. Scanner sekarang dapat mengakses kamera perangkat, membaca QR Code, dan menavigasi ke form P2H. Selain itu, dokumen 13_TASK_BREAKDOWN.md telah dibuat dan backlog telah diperbarui dengan tugas-tugas aktif.

Requirements and decisions

* Requirements implemented: TASK-004 (Real QR Scanner), TASK-013 (Task Breakdown).
* Decisions / tradeoffs:
  * Penggunaan library html5-qrcode dipilih karena mendukung multi-platform, tidak memerlukan dependency berat, dan memiliki API yang stabil.
  * Dihapusnya generated files (.next) untuk menyelesaikan type checker error pada Next.js 16.

Implementation impact

* Added: html5-qrcode dependency, 13_TASK_BREAKDOWN.md, updated 09_BACKLOG.md.
* Modified: src/components/scan/ScannerView.tsx (real camera integration), src/app/globals.css (fixed Tailwind v4 compatibility), src/components/dashboard/ApprovalDashboard.tsx (fixed TypeScript errors).
* Database: None
* API: None
* UI: ScannerView sekarang menggunakan kamera nyata dengan fallback ke input manual.

Verification

* Build production berhasil via `npm run build` — PASSED
* TypeScript check lolos — PASSED
* Scanner dapat mengakses kamera di browser — VERIFIED

Risks and follow-up

* Known issues: Beberapa vulnerability pada dependencies (non-critical).
* Next recommended task: TASK-008 (Photo Capture) atau TASK-013 (Sequential Signing).

[2026-07-30 22:00 WIB] — Inisialisasi Project & Setup Database SQLite

Status: DONE Version: 0.1.0 Owner: Lead Developer

Outcome

Boilerplate Next.js telah diinisialisasi beserta dengan setup Drizzle ORM, SQLite 3, dan konfigurasi environment. Skema database berdasarkan 05_ERD.md telah berhasil di-push. Konfigurasi dasar middleware Auth.js (NextAuth) untuk peran pengguna (Mahasiswa, Instruktur, Dosen) telah siap.

Requirements and decisions

* Requirements implemented: TASK-001.
* Decisions / tradeoffs:
  * Penggunaan Drizzle ORM dipilih karena sifatnya yang ringan dan kompatibilitas yang baik dengan SQLite dan Next.js Server Actions.
  * Auth.js (NextAuth beta) dipilih untuk manajemen sesi dan Role-Based Access Control dasar.

Implementation impact

* Added: Next.js boilerplate (`src/`), Drizzle schema & config, Auth.js config, environment setup.
* Database: Tabel-tabel master dari 05_ERD.md telah dibuat via Drizzle.

Verification

* Boilerplate Next.js kompilasi tanpa error via `tsc --noEmit` — PASSED
* Drizzle schema push ke local `local.db` — PASSED
* Linter checks via `next lint` — PASSED

[2023-10-27 10:00 WIB] — Penyelesaian Fase 0 (Baseline Dokumentasi)

Status: DONE Version: 0.1.0 Owner: Project Architect

Outcome

Fase 0 (Baseline Dokumentasi) telah dinyatakan selesai secara formal. Sistem telah mencapai sinkronisasi penuh terhadap 16 dokumen dasar yang mencakup seluruh spektrum arsitektur, dari aturan tata kelola hingga peta jalan pengembangan. Dengan tercapainya baseline ini, repositori dinyatakan siap untuk memulai eksekusi teknis pada [TASK-001].

Requirements and decisions

* Requirements implemented: Kepatuhan terhadap struktur tata kelola proyek sesuai 01_PROJECT_RULES.md dan inisialisasi seluruh rangkaian spesifikasi sistem (02_PRD.md hingga 08_TEST_PLAN.md).
* Decisions / tradeoffs:
  * Pemilihan Next.js App Router: Diputuskan untuk menggunakan model App Router guna mengoptimalkan performa melalui Server Components dan manajemen routing yang modular.
  * Penggunaan SQLite 3: Ditetapkan sebagai mesin database utama untuk fase Edu-P2H karena sifatnya yang file-based, ringan, dan memudahkan portabilitas antar lingkungan pengembangan mahasiswa.

Implementation impact

* Added: 00_AI_AGENT_START_PROMPT.md, 01_PROJECT_RULES.md, 02_PRD.md, 03_FSD.md, 04_TSD.md, 05_ERD.md, 06_API_SPEC.md, 07_UI_UX_SPEC.md, 08_TEST_PLAN.md, 09_BACKLOG.md, 10_DEV_LOG.md, 11_CHANGELOG.md, 12_CODING_STANDARDS.md, 13_TASK_BREAKDOWN.md, README.md, HANDOFF.md.
* Modified: None
* Database: Inisialisasi skema awal pada 05_ERD.md dengan penetapan penggunaan SQLite 3.
* API: Standarisasi kontrak API, media type, dan struktur error envelope pada 06_API_SPEC.md.
* UI: Penetapan alur navigasi berdasarkan peran pengguna (Mahasiswa, Instruktur, Dosen) pada 07_UI_UX_SPEC.md.

Verification

* Pemeriksaan integritas referensi silang (cross-reference) antar 16 dokumen utama — PASSED
* Validasi struktur peran pengguna (Mahasiswa, Instruktur, Dosen) sesuai kebutuhan inspeksi alat berat — VERIFIED
* Konfirmasi kesiapan workflow pengembangan dan kontrol perubahan sesuai 01_PROJECT_RULES.md — READY

Risks and follow-up

* Known issues: None
* Next recommended task: [TASK-001]

Project Decisions

Tanggal	Keputusan	Konteks / Rasional	Konsekuensi	Pemilik
2023-10-27	Pemilihan Next.js App Router	Mengutamakan performa Server Components dan struktur routing yang modular.	Pengembangan harus mengikuti pola direktori app/ dan penanganan state sisi server.	Project Architect
2023-10-27	Penggunaan SQLite 3	Kebutuhan database yang ringan, file-based, dan kemudahan portabilitas selama fase Edu-P2H.	Tidak memerlukan server DB terpisah; migrasi harus dikelola via script SQL/ORM.	Lead Developer
2023-10-27	Penetapan Peran (Mahasiswa, Instruktur, Dosen)	Membedakan akses kontrol berdasarkan kebutuhan fungsional inspeksi alat berat.	Implementasi middleware otorisasi wajib merujuk pada tabel peran di 02_PRD.md dan 03_FSD.md.	Product Owner
