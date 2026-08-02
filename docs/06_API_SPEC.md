06_API_SPEC.md - Spesifikasi Kontrak API REST v1 HeavyInspect

1. Informasi Dokumen dan Versi

Item	Keterangan
Nama Proyek	HeavyInspect
Versi API	v1
Status Dokumen	FINAL
Tanggal Peninjauan Terakhir	2024-05-24

2. Konvensi Kontrak dan Standar Global

Seluruh layanan API dalam ekosistem HeavyInspect wajib mematuhi standar teknis berikut:

* Media Type: Permintaan (request) dan tanggapan (response) menggunakan application/json.
* Versi API: Menggunakan prefix URL untuk manajemen versi. Format: /api/v1/....
* Base URL:
  * Development: https://dev-api.heavyinspect.id/api/v1
  * Production: https://api.heavyinspect.id/api/v1
* Autentikasi: Mekanisme Bearer Token (JWT) pada HTTP Header Authorization. Token wajib dikirimkan untuk setiap endpoint terproteksi.

3. Struktur Error Envelope

Sesuai dengan 01_PROJECT_RULES.md, semua kegagalan permintaan harus mengembalikan struktur seragam berikut:

Format JSON Error:

{
  "status": "error",
  "code": "VALIDATION_ERROR",
  "message": "Beberapa field tidak valid atau tidak lengkap.",
  "errors": [
    {
      "field": "mahasiswa_sig",
      "message": "Tanda tangan digital wajib disertakan sesuai BR-001."
    }
  ]
}


Common Errors:

HTTP Status	Kode Error	Deskripsi / Tindakan Klien
400	VALIDATION_ERROR	Data tidak valid. Periksa field errors untuk detail perbaikan.
401	UNAUTHORIZED	Token hilang, tidak valid, atau kedaluwarsa. Lakukan autentikasi ulang.
403	FORBIDDEN	Peran (role) tidak memiliki izin akses ke resource ini.
404	NOT_FOUND	Resource (ID Unit/Laporan) tidak ditemukan di database.

4. Definisi Peran dan Terminologi (Akses Kontrol)

Peran Sistem	Terminologi Industri	Batasan Akses Modul P2H
Mahasiswa	Mechanic	Inisiasi inspeksi, scan unit, pengisian checklist, dan submit laporan.
Instruktur	Leader	Review teknis dan Approval Level 1.
Dosen	Supervisor	Verifikasi akhir dan Approval Level 2 (Final).

5. Definisi Endpoint: Manajemen Unit

Mengambil data teknis unit berdasarkan hasil pemindaian kode fisik.

* Endpoint: GET /units/scan/:code
* Tujuan: Validasi identitas unit melalui QR/Barcode.
* Otorisasi: Mahasiswa.
* Idempotency: Not Applicable (Read-only).

Request

Location	Field	Type	Required	Validation	Description
Path	code	String	Ya	Alphanumeric, Min: 5	Kode unik unit dari QR/Barcode.

Responses

Status	When	Body
200	Unit ditemukan	{"status": "success", "data": {"unit_id": "UH-001", "model": "CAT 320", "status": "READY"}}
404	Unit tidak terdaftar	{"status": "error", "code": "NOT_FOUND", "message": "Unit tidak ditemukan."}

Side effects: Tidak ada. Related requirements/tests: FSD-UNIT-01, TEST-UNIT-SCAN.

6. Definisi Endpoint: Submission P2H

Pengiriman formulir inspeksi harian yang telah dilengkapi oleh Mahasiswa.

* Endpoint: POST /p2h/submit
* Otorisasi: Mahasiswa.
* Idempotency: Required (Header X-Idempotency-Key).

Request

Location	Field	Type	Required	Validation	Description
Body	unit_id	String	Ya	UUID / ID Terdaftar	Referensi ke tabel unit.
Body	checklist_data	Object	Ya	BR-001 (Non-empty)	Kumpulan data poin inspeksi.
Body	mahasiswa_sig	String	Ya	Base64 (Min-len: 1000)	Tanda tangan digital mahasiswa.

Responses

Status	When	Body
201	Laporan berhasil disimpan	{"status": "success", "data": {"p2h_id": "P2H-2024-001", "status": "SUBMITTED"}}
400	Data tidak lengkap	{"status": "error", "code": "VALIDATION_ERROR", "errors": [...]}

Side effects:

* Membuat entitas baru di tabel p2h_reports.
* Mengubah status laporan menjadi SUBMITTED.
* Trigger Audit Log: ACTION_P2H_SUBMIT (Actor ID, Timestamp).

Related requirements/tests: BR-001, FSD-P2H-SUBMIT, TEST-P2H-01.

7. Definisi Endpoint: Approval P2H

Proses persetujuan berjenjang untuk validasi laporan P2H.

* Endpoint: PATCH /p2h/approve/:id
* Otorisasi: Instruktur, Dosen.
* Idempotency: Required (Header X-Idempotency-Key).

Request

Location	Field	Type	Required	Validation	Description
Path	id	String	Ya	Valid P2H ID	ID laporan yang akan disetujui.
Body	instruktur_sig	String	Opsional	BR-008 (Wajib jika Leader)	Signature Leader (Base64).
Body	dosen_sig	String	Opsional	BR-008 (Wajib jika Superv)	Signature Supervisor (Base64).
Body	notes	String	Tidak	Max: 255 chars	Catatan evaluasi.

Responses

Status	When	Body
200	Persetujuan berhasil	{"status": "success", "data": {"p2h_id": "...", "status": "APPROVED_BY_LEADER"}}
403	Melompati jenjang	{"status": "error", "code": "FORBIDDEN", "message": "Memerlukan persetujuan Instruktur dahulu."}

Side effects:

* Status Transition: SUBMITTED → APPROVED_BY_LEADER (Jika Instruktur).
* Status Transition: APPROVED_BY_LEADER → COMPLETED (Jika Dosen).
* Trigger Audit Log: ACTION_P2H_APPROVAL (Current Status, New Status, Actor).

Related requirements/tests: BR-008, FSD-P2H-APPROVAL, TEST-P2H-08.

8. Tabel Validasi Aturan Bisnis (Business Rules)

ID Aturan	Deskripsi Aturan	Endpoint Terkait
BR-001	Kelengkapan Input: Server menolak data jika ada item checklist kosong atau mahasiswa_sig di bawah batas minimum length.	POST /p2h/submit
BR-008	Persetujuan Berjenjang: dosen_sig hanya diterima jika record memiliki status APPROVED_BY_LEADER.	PATCH /p2h/approve/:id

9. Catatan Implementasi dan Keamanan

* Idempotency: Klien wajib menyertakan X-Idempotency-Key pada semua request mutasi (POST/PATCH). Server akan menyimpan kunci selama 24 jam untuk mencegah duplikasi data akibat network retry.
* Audit Trail: Sesuai 01_PROJECT_RULES.md, setiap mutasi status wajib mencatat state before dan after.
* Approval Security: Setiap aksi approve/reject harus divalidasi melalui role-based access control. Metadata approval disimpan di audit_log untuk verifikasi integritas laporan.
* Rate Limiting: Maksimal 100 request/menit per User ID untuk mencegah abuse pada endpoint scan dan submission.

10. Definisi Endpoint: Bulk Import Users

Import massal pengguna dari file Excel (.xlsx/.xls/.csv).

* Endpoint: POST /api/admin/users/import
* Otorisasi: Admin.
* Idempotency: Not Applicable.

Request

Location	Field	Type	Required	Validation	Description
Body	rows	Array<Object>	Ya	Min: 1, Max: 100	Array baris dari file Excel.
Body	rows[].username	String	Ya	UNIQUE	Username pengguna.
Body	rows[].fullName	String	Ya	-	Nama lengkap.
Body.rows[].role	String	Ya	IN ('operator','leader','supervisor')	Peran pengguna.

Responses

Status	When	Body
201	Import berhasil (sebagian/besarall)	{"created": [...], "errors": [...]}
400	Invalid role / missing fields	{"error": "Invalid role"}
401	Bukan admin	{"error": "Unauthorized"}

Side effects:
* Membuat entri baru di tabel users untuk setiap baris valid.
* Password di-generate otomatis (12 karakter).
* must_change_password = 1 untuk semua user yang di-import.

11. Definisi Endpoint: Change Password

Ganti password paksa saat login pertama kali.

* Endpoint: POST /api/profile/password
* Otorisasi: Semua role (yang login).

Request

Location	Field	Type	Required	Validation	Description
Body	newPassword	String	Ya	Min: 6 chars	Password baru.

Responses

Status	When	Body
200	Password berhasil diubah	{"success": true}
400	Password terlalu pendek	{"error": "Password must be at least 6 characters"}

Side effects:
* Memperbarui password_hash di tabel users.
* Mengatur must_change_password = 0.

12. Definisi Server Actions: Notifications

Operasi notifikasi menggunakan Next.js Server Actions (bukan REST API).

* getMyNotifications(): Mengambil notifikasi user yang sedang login (max 50, urut terbaru).
* markNotificationRead(id): Menandai satu notifikasi sebagai sudah dibaca.
* markAllNotificationsRead(): Menandai semua notifikasi sebagai sudah dibaca.
* getMunreadCount(): Menghitung jumlah notifikasi belum dibaca.
