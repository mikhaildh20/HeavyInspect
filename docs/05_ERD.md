05_ERD.md — Skema Database SQLite 3 HeavyInspect (Edu-P2H)

Dokumen ini merinci rancangan skema database untuk aplikasi HeavyInspect (Edu-P2H). Arsitektur data ini dirancang untuk memastikan integritas tinggi dalam pencatatan inspeksi alat berat, kepatuhan terhadap alur kerja verifikasi (sign-off), dan performa optimal pada engine SQLite 3.

Informasi Proyek	Detail
Nama Proyek	HeavyInspect (Edu-P2H)
Database	SQLite 3
Versi Dokumentasi	V1.1.0
Tanggal Peninjauan Terakhir	2026-07-31

1. Ringkasan Model Data (Data Model Overview)

Skema database HeavyInspect dikembangkan untuk mendukung digitalisasi proses Pemeliharaan dan Pemeriksaan Harian (P2H) alat berat, khususnya unit Komatsu PC 200-8. Struktur data dibangun secara relasional untuk mengikat identitas pengguna (Users), aset fisik (Units), dan parameter standar pemeriksaan (Checklist Parameters).

Alur kerja utama berpusat pada entitas P2H Reports yang berfungsi sebagai kontainer transaksi. Setiap laporan mereferensikan banyak detail temuan (P2H Results) dan pencatatan konsumsi cairan (Fluid Additions). Integritas data dijaga melalui mekanisme status (Draft, Submitted, Approved) yang didukung oleh database-level triggers untuk mencegah modifikasi data pada laporan yang telah disetujui, menjamin validitas audit trail dan verifikasi tanda tangan multi-level.

2. Definisi Entitas (Entities)

Seluruh entitas menggunakan standar SQLite 3 storage classes. Data temporal disimpan sebagai TEXT dalam format ISO8601 (YYYY-MM-DD HH:MM:SS) untuk menjamin kemampuan pengurutan (lexicographical sorting).

Tabel users: Kolom role kini secara ketat hanya menerima nilai: Mahasiswa, Instruktur, atau Dosen [05_ERD.md].
Tabel p2h_reports:
Mengganti operator_sig menjadi mahasiswa_sig.
Mengganti leader_sig menjadi instruktur_sig.
Mengganti supervisor_sig menjadi dosen_sig.
Relasi mahasiswa_id (FK ke users) digunakan untuk melacak siapa yang melakukan inspeksi awal [05_ERD.md].
Tabel checklist_parameters: Menambahkan fleksibilitas agar Dosen dapat mengatur poin pemeriksaan untuk unit

2.1 Tabel users

Purpose: Mengelola identitas pengguna dan kontrol akses berbasis peran (RBAC).

Column	Type	Null	Default	Constraints/Index	Description
id	INTEGER	No	-	PK, AUTOINCREMENT	ID unik pengguna
username	TEXT	No	-	UNIQUE, INDEX	Nama pengguna untuk login
password_hash	TEXT	No	-	-	Hash kredensial (Argon2/bcrypt)
full_name	TEXT	No	-	-	Nama lengkap sesuai ID karyawan
role	TEXT	No	-	CHECK(role IN ('operator','leader','supervisor'))	Peran dalam alur verifikasi
must_change_password	INTEGER	No	0	-	Flag paksa ganti password saat login pertama
generated_password	TEXT	Yes	-	-	Password sementara yang di-generate sistem (ditampilkan ke admin)
is_active	INTEGER	No	1	CHECK(is_active IN (0,1))	Flag soft delete
deleted_at	TEXT	Yes	-	-	Timestamp soft delete
created_at	TEXT	No	CURRENT_TIMESTAMP	ISO8601	Waktu pendaftaran
updated_at	TEXT	No	CURRENT_TIMESTAMP	ISO8601	Waktu perubahan terakhir

Relations: Tidak memiliki Foreign Key eksternal. Direferensikan oleh p2h_reports.
Lifecycle: Data dibuat oleh Administrator; dinonaktifkan via is_active = 0 (tidak dihapus fisik).
Authorization Boundary: Read: All roles; Write: System/Admin.

2.2 Tabel units

Purpose: Inventarisasi alat berat yang menjadi objek inspeksi P2H.

Column	Type	Null	Default	Constraints/Index	Description
id	INTEGER	No	-	PK, AUTOINCREMENT	ID unik unit
unit_code	TEXT	No	-	UNIQUE, INDEX	Kode lambung (e.g., EXCA-001)
model_name	TEXT	No	'Komatsu PC 200-8'	-	Model/Tipe alat berat
last_smr	REAL	No	0.0	-	Service Meter Reading terakhir (HM)
serial_number	TEXT	Yes	''	-	Nomor seri unit
wo_jo_no	TEXT	Yes	''	-	Nomor Work Order / Job Order
zone	TEXT	Yes	''	-	Zona operasional unit
inspection_start	TEXT	Yes	''	-	Waktu mulai inspeksi terakhir
is_active	INTEGER	No	1	CHECK(is_active IN (0,1))	Flag soft delete
deleted_at	TEXT	Yes	-	-	Timestamp soft delete
created_at	TEXT	No	CURRENT_TIMESTAMP	ISO8601	Waktu registrasi unit
updated_at	TEXT	No	CURRENT_TIMESTAMP	ISO8601	Waktu update data unit

Relations: Direferensikan oleh p2h_reports.
Lifecycle: Data unit bersifat statis-persisten; diperbarui saat registrasi alat baru atau update nilai SMR.
Authorization Boundary: Read: All roles; Write: Admin/System.

2.3 Tabel checklist_parameters

Purpose: Master data item pemeriksaan berdasarkan standar manufaktur Komatsu.

Column	Type	Null	Default	Constraints/Index	Description
id	INTEGER	No	-	PK, AUTOINCREMENT	ID unik parameter
category	TEXT	No	-	INDEX	Kategori (e.g., Mesin, Cabin)
description	TEXT	No	-	-	Nama item pemeriksaan
is_active	INTEGER	No	1	CHECK(is_active IN (0,1))	Flag soft delete
created_at	TEXT	No	CURRENT_TIMESTAMP	ISO8601	Waktu pembuatan parameter
updated_at	TEXT	No	CURRENT_TIMESTAMP	ISO8601	Waktu perubahan definisi

Relations: Direferensikan oleh p2h_results.
Lifecycle: Ditentukan di awal proyek. Perubahan parameter akan mengakibatkan penonaktifan versi lama dan pembuatan entitas baru.
Authorization Boundary: Read: All roles; Write: Admin.

2.4 Tabel p2h_reports

Purpose: Header transaksi laporan P2H yang mencatat status dan validasi tanda tangan.

Column	Type	Null	Default	Constraints/Index	Description
id	INTEGER	No	-	PK, AUTOINCREMENT	ID unik laporan
unit_id	INTEGER	No	-	FK (units.id)	Referensi unit yang diperiksa
operator_id	INTEGER	No	-	FK (users.id)	Referensi operator pemeriksa
report_date	TEXT	No	-	INDEX	Tanggal P2H (ISO8601 Date)
status	TEXT	No	'Draft'	CHECK(status IN ('Draft','Submitted','Approved'))	Status siklus hidup laporan
operator_sig	TEXT	Yes	-	-	Base64/Path TTD Operator
leader_sig	TEXT	Yes	-	-	Base64/Path TTD Leader
supervisor_sig	TEXT	Yes	-	-	Base64/Path TTD Supervisor
is_active	INTEGER	No	1	CHECK(is_active IN (0,1))	Flag soft delete
created_at	TEXT	No	CURRENT_TIMESTAMP	ISO8601	Waktu mulai pembuatan
updated_at	TEXT	No	CURRENT_TIMESTAMP	ISO8601	Waktu update terakhir

Relations:

* unit_id -> units.id (ON DELETE RESTRICT)
* operator_id -> users.id (ON DELETE RESTRICT) Lifecycle: Draft -> Submitted (dikunci untuk operator) -> Approved (dikunci permanen).
Authorization Boundary: Create: Operator; Update: Operator (Draft), Leader/Supervisor (Sign-off).

2.5 Tabel p2h_results

Purpose: Detail hasil pemeriksaan per item parameter untuk setiap laporan.

Column	Type	Null	Default	Constraints/Index	Description
id	INTEGER	No	-	PK, AUTOINCREMENT	ID unik baris hasil
report_id	INTEGER	No	-	FK (p2h_reports.id), INDEX	Referensi laporan induk
parameter_id	INTEGER	No	-	FK (checklist_parameters.id)	Referensi item parameter
condition	TEXT	No	-	CHECK(condition IN ('OK','NOT OK'))	Status kondisi komponen
photo_url	TEXT	Yes	-	-	Path file foto temuan
notes	TEXT	Yes	-	-	Catatan deskriptif temuan
is_active	INTEGER	No	1	CHECK(is_active IN (0,1))	Flag soft delete
created_at	TEXT	No	CURRENT_TIMESTAMP	ISO8601	Waktu input hasil
updated_at	TEXT	No	CURRENT_TIMESTAMP	ISO8601	Waktu update hasil

Relations:

* report_id -> p2h_reports.id (ON DELETE CASCADE)
* parameter_id -> checklist_parameters.id (ON DELETE RESTRICT) Lifecycle: Mengikuti report_id. Tidak dapat diubah jika p2h_reports.status = 'Approved'.
Authorization Boundary: Read: All roles; Write: Operator (saat status Draft).

2.6 Tabel fluid_additions

Purpose: Mencatat penambahan cairan (Oli/BBM) selama periode P2H.

Column	Type	Null	Default	Constraints/Index	Description
id	INTEGER	No	-	PK, AUTOINCREMENT	ID unik transaksi cairan
report_id	INTEGER	No	-	FK (p2h_reports.id), INDEX	Referensi laporan P2H
fluid_type	TEXT	No	-	-	Jenis cairan (e.g., Engine Oil)
quantity	REAL	No	0.00	-	Volume penambahan (Liter)
is_active	INTEGER	No	1	CHECK(is_active IN (0,1))	Flag soft delete
created_at	TEXT	No	CURRENT_TIMESTAMP	ISO8601	Waktu pencatatan
updated_at	TEXT	No	CURRENT_TIMESTAMP	ISO8601	Waktu update

Relations: report_id -> p2h_reports.id (ON DELETE CASCADE).
Lifecycle: Mengikuti report_id.
Authorization Boundary: Read: All roles; Write: Operator (saat status Draft).

2.7 Tabel unit_checklist_items

Purpose: Mapping parameter checklist ke unit tertentu untuk penyesuaian pemeriksaan per unit.

Column	Type	Null	Default	Constraints/Index	Description
id	INTEGER	No	-	PK, AUTOINCREMENT	ID unik mapping
unit_id	INTEGER	No	-	FK (units.id), INDEX	Referensi unit
parameter_id	INTEGER	No	-	FK (checklist_parameters.id)	Referensi parameter
sort_order	INTEGER	No	0	- Urutan tampilan
is_active	INTEGER	No	1	- Flag aktif
created_at	TEXT	No	CURRENT_TIMESTAMP	ISO8601	Waktu pembuatan

Relations:
* unit_id -> units.id (ON DELETE CASCADE)
* parameter_id -> checklist_parameters.id (ON DELETE CASCADE)

2.8 Tabel checklist_categories

Purpose: Pengelompokan parameter checklist berdasarkan kategori inspeksi.

Column	Type	Null	Default	Constraints/Index	Description
id	INTEGER	No	-	PK, AUTOINCREMENT	ID unik kategori
letter	TEXT	No	-	UNIQUE	Kode huruf kategori (A, B, C, ...)
name	TEXT	No	-	-	Nama kategori
sort_order	INTEGER	No	0	- Urutan tampilan
is_active	INTEGER	No	1	CHECK(is_active IN (0,1))	Flag soft delete
deleted_at	TEXT	Yes	-	-	Timestamp soft delete
created_at	TEXT	No	CURRENT_TIMESTAMP	ISO8601	Waktu pembuatan
updated_at	TEXT	No	CURRENT_TIMESTAMP	ISO8601	Waktu perubahan

Relations: Direferensikan oleh checklist_parameters (via category_id).
Lifecycle: Data master statis; dikelola oleh Admin.

2.9 Tabel audit_log

Purpose: Pencatatan audit trail untuk semua aksi penting dalam sistem.

Column	Type	Null	Default	Constraints/Index	Description
id	INTEGER	No	-	PK, AUTOINCREMENT	ID unik log
user_id	INTEGER	No	-	FK (users.id)	Pengguna yang melakukan aksi
action	TEXT	No	-	-	Jenis aksi (e.g., report.submit, report.approve)
entity	TEXT	No	-	-	Entitas yang dipengaruhi (e.g., p2h_reports)
entity_id	INTEGER	Yes	-	-	ID entitas yang dipengaruhi
details	TEXT	Yes	-	-	Detail tambahan (JSON atau teks)
ip_address	TEXT	Yes	-	-	Alamat IP pelaku
created_at	TEXT	No	CURRENT_TIMESTAMP	ISO8601	Waktu aksi

Relations: user_id -> users.id (ON DELETE RESTRICT).
Lifecycle: Write-only; tidak pernah dihapus atau dimodifikasi.

2.10 Tabel notifications

Purpose: Sistem notifikasi persistent untuk informasi ke pengguna.

Column	Type	Null	Default	Constraints/Index	Description
id	INTEGER	No	-	PK, AUTOINCREMENT	ID unik notifikasi
user_id	INTEGER	No	-	FK (users.id), INDEX	Penerima notifikasi
type	TEXT	No	'info'	-	Jenis notifikasi (success, error, info, warning)
title	TEXT	No	-	-	Judul notifikasi
message	TEXT	No	-	-	Pesan detail notifikasi
is_read	INTEGER	No	0	-	Flag sudah dibaca (0=belum, 1=sudah)
action_url	TEXT	Yes	-	-	URL tujuan saat notifikasi diklik
created_at	TEXT	No	CURRENT_TIMESTAMP	ISO8601	Waktu notifikasi dibuat

Relations: user_id -> users.id (ON DELETE CASCADE).
Lifecycle: Dibuat otomatis saat event terjadi; dapat ditandai sudah dibaca.

3. Relasi dan Integritas Data (Relations)

Sesuai standar SQLite 3, integritas referensial ditegakkan dengan aturan:

1. P2H Report Dependencies: Penghapusan unit atau user yang masih memiliki referensi di laporan akan ditolak (ON DELETE RESTRICT).
2. Cascading Details: Jika sebuah laporan (p2h_reports) dihapus secara fisik (walaupun dilarang oleh aturan bisnis), maka seluruh data di p2h_results dan fluid_additions yang terkait akan ikut terhapus (ON DELETE CASCADE).
3. Mandatory State: Penggunaan PRAGMA foreign_keys = ON; wajib diaktifkan pada setiap koneksi database di layer aplikasi.

4. Aturan Bisnis dan Integritas (Integrity Rules)

4.1 Konvensi Data

* Presisi Numerik: Seluruh kolom REAL untuk last_smr harus disimpan dengan presisi 1 angka di belakang koma (e.g., 1250.5). Kolom quantity pada cairan disimpan dengan presisi 2 angka di belakang koma (e.g., 20.75).
* ISO8601 Consistency: Semua timestamp harus menggunakan UTC dengan format YYYY-MM-DD HH:MM:SS.

4.2 Database Safeguards (BR-001 & BR-008)

Untuk menjaga integritas laporan yang sudah disetujui, database harus mengimplementasikan trigger berikut (atau logika ekuivalen di Application Layer):

* Locking Trigger: Sebuah trigger BEFORE UPDATE ON p2h_results harus memvalidasi status di p2h_reports. Jika status adalah 'Approved', maka operasi UPDATE atau DELETE harus dibatalkan oleh database (RAISE ABORT).
* Status Transition: Status hanya boleh bergerak maju: Draft -> Submitted -> Approved.

4.3 Kebijakan Soft Deletion & Audit Trail

* Strict Soft Delete: Operasi DELETE tidak diperbolehkan pada data operasional. Kolom is_active digunakan sebagai filter global pada setiap kueri SELECT.
* Automated Audit: Kolom updated_at harus selalu diperbarui via database trigger AFTER UPDATE untuk setiap entitas guna memastikan jejak audit yang akurat.

5. Log Migrasi (Migration Log)

Migration ID	Date	Change	Forward Path	Data Impact
V1.0.0	2024-05-22	Baseline Schema Setup	Urutan eksekusi: 1. users, 2. units, 3. checklist_parameters, 4. p2h_reports, 5. p2h_results, 6. fluid_additions.	Pembuatan struktur database awal dengan konstrain integritas penuh.
