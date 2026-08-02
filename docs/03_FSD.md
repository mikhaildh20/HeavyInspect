03_FSD: Spesifikasi Fungsional HeavyInspect

Project: HeavyInspect
Version / Status: v1.0 / APPROVED
Date: 2026-07-30

1. Ruang Lingkup dan Terminologi

1.1 Tujuan

Dokumen ini menetapkan spesifikasi fungsional untuk modul inspeksi digital dan alur persetujuan bertingkat dalam platform HeavyInspect. Dokumen ini berfungsi sebagai acuan teknis bagi tim pengembang (backend/frontend) dan penjamin kualitas (QA) untuk mengimplementasikan logika bisnis P2H (Pemeliharaan dan Pemeriksaan Harian).

1.2 Definisi dan Terminologi

Istilah	Definisi
P2H	Pemeliharaan dan Pemeriksaan Harian: Prosedur pemeriksaan visual dan fungsional unit alat berat sebelum operasional dimulai untuk menjamin keselamatan kerja.
SMR	Service Meter Reading: Indikator akumulasi jam operasional mesin pada alat berat (serupa dengan odometer pada kendaraan ringan).
HeavyInspect	Nama sistem aplikasi manajemen aset dan inspeksi digital yang menjadi objek spesifikasi ini.
Sequential Approval	Protokol otorisasi di mana approval harus dilakukan secara berurutan sesuai hierarki organisasi (Mechanic -> Leader -> Supervisor).
Submitted	Status laporan setelah mekanik menyelesaikan inspeksi dan menekan tombol submit final.
Fully Approved	Status akhir laporan setelah melewati seluruh tahapan verifikasi dalam hierarki persetujuan.

2. Modul Fungsional: Inspeksi Digital (P2H)

Purpose: Memungkinkan mekanik melakukan digitalisasi inspeksi harian unit secara akurat di lapangan.
Actors: Mechanic.
Preconditions:

1. Mekanik telah terautentikasi melalui session yang valid.
2. Unit alat berat terdaftar dalam database sistem.
3. User memiliki hak akses (role) sebagai 'Mechanic'.

2.1 Use Case: UC-001 — Pelaksanaan Inspeksi P2H

Step	Actor / System Action	Validation / Rule	Result
1	Mekanik memindai QR Code pada unit.	Sistem melakukan lookup unit ID via API GET /units/{qr_code_id}.	Data unit (Model, SN) ditampilkan pada layar.
2	Mekanik memasukkan nilai SMR terbaru.	BR-002: Validasi nilai input vs nilai terakhir di database.	Input diterima jika valid; Error jika anomali.
3	Mekanik mengisi checklist kondisi (Good/Bad).	Input wajib (Mandatory) untuk seluruh item dalam template inspeksi.	Status item tersimpan di state lokal aplikasi.
4	Mekanik mengambil foto pada item berkondisi "Bad".	BR-001: Validasi keberadaan attachment pada item dengan flag 'Bad'.	Foto terunggah dan terasosiasi dengan item terkait.
5	Mekanik menekan tombol "Submit".	BR-010: Sistem mencatat timestamp, user_id, dan koordinat GPS.	Status laporan berubah dari DRAFT menjadi SUBMITTED.

Inputs: | Field | Type | Required | Description | | :--- | :--- | :--- | :--- | | unit_id | UUID | Yes | ID unik unit alat berat. | | smr_value | Decimal (10,1) | Yes | Nilai jam operasional terbaru (harus positif). | | checklist_results | Array[Object] | Yes | Pasangan item_id dan status_enum (Good/Bad). | | evidence_photos | Binary/Blob | Conditional | Wajib jika status_enum adalah 'Bad'. |

Outputs:

* Pencatatan entri baru pada tabel p2h_reports.
* Perubahan status unit jika ditemukan kerusakan kritikal (Logic: Status Unit -> Breakdown).

Errors: | Code | Condition | User Behaviour | | :--- | :--- | :--- | | ERR-SMR-LOW | Input SMR < SMR terakhir di database. | Munculkan warning: "Nilai SMR tidak boleh lebih rendah dari [Last SMR]". Input ditolak. | | ERR-MISSING-IMG | Item 'Bad' tanpa lampiran foto. | Fokus otomatis ke item terkait dengan pesan: "Wajib melampirkan foto untuk kondisi Bad". | | ERR-OFFLINE | Koneksi terputus saat submit. | Data disimpan di local storage (IndexedDB) untuk sinkronisasi otomatis saat online. |

2.2 Aturan Bisnis (Business Rules) - Inspeksi

ID	Rule	Enforced By	Related Requirement
BR-001	Wajib Foto: Sistem menolak request POST /p2h/submit jika terdapat item checklist berstatus 'Bad' tanpa bukti foto (file metadata null).	Server	PRD-001
BR-002	Validasi SMR: Nilai SMR input (SMR_i) harus >= SMR_last_recorded. Validasi dilakukan di level API untuk mencegah manipulasi data jam mesin.	Server	PRD-002

3. Modul Fungsional: Persetujuan (Approval)

Mahasiswa (Mechanic): Melakukan inspeksi fisik, pengisian form, dan submit laporan [2.2, 5].
Instruktur (Leader): Melakukan verifikasi lapangan dan approve laporan [2.2].
Dosen (Supervisor): Melakukan validasi akhir, penilaian (grading), dan persetujuan administratif [2.2].

Purpose: Memastikan hasil inspeksi diverifikasi oleh otoritas yang lebih tinggi sesuai standar operasional.
Actors: Leader, Supervisor.
Preconditions:

1. Laporan P2H memiliki status SUBMITTED atau PENDING_SUPERVISOR.
2. Actor memiliki role 'Leader' atau 'Supervisor'.

3.1 Use Case: UC-002 — Alur Persetujuan Bertingkat (Sequential Approval)

Step	Actor / System Action	Validation / Rule	Result
1	Mekanik melakukan "Final Submit".	Memastikan seluruh mandatory field terisi.	Status laporan -> SUBMITTED.
2	Leader membuka Dashboard Approval dan memilih laporan.	Sistem memverifikasi role 'Leader'.	Tampilan detail P2H dan tombol 'Approve' muncul.
3	Leader melakukan 'Approve'.	BR-008: Validasi status laporan harus SUBMITTED.	Status laporan -> PENDING_SUPERVISOR.
4	Supervisor membuka Dashboard Approval.	Sistem memverifikasi role 'Supervisor'.	Tampilan detail P2H dan tombol 'Final Approve' muncul.
5	Supervisor melakukan 'Final Approve'.	BR-008: Validasi status laporan harus PENDING_SUPERVISOR.	Status laporan -> FULLY_APPROVED.

Inputs:

* report_id: UUID
* approval_action: Enum (Approve / Reject)
* notes: String (Optional)

Outputs:

* Update kolom last_approved_by dan status pada tabel p2h_reports.
* Trigger notifikasi ke Mekanik (Push Notification).

Errors: | Code | Condition | User Behaviour | | :--- | :--- | :--- | | ERR-AUTH-FLOW | Supervisor mencoba approve laporan yang belum disetujui Leader. | Pesan: "Laporan memerlukan persetujuan Leader terlebih dahulu." |

3.2 Aturan Bisnis (Business Rules) - Persetujuan

ID	Rule	Enforced By	Related Requirement
BR-008	Sequential Approval: Mekanisme state-gate di mana tombol approve untuk Supervisor tidak akan aktif/tersedia sebelum laporan disetujui oleh Leader.	Client & Server	PRD-005
BR-010	Audit Logging: Setiap aksi persetujuan wajib mencatat payload: {user_id, timestamp, action, details}. Metadata ini berfungsi sebagai audit trail perubahan status.	Server	PRD-006

4. State Transitions

Entity	From	Event	To	Guard / Side Effect
P2H_Report	DRAFT	FINALIZE_SUBMIT	SUBMITTED	Trigger BR-001 & BR-002.
P2H_Report	SUBMITTED	LEADER_APPROVE	PENDING_SUPERVISOR	Mencatat approval Leader di audit_log.
P2H_Report	PENDING_SUPERVISOR	SUPERVISOR_APPROVE	FULLY_APPROVED	Laporan dikunci (Read-Only).
P2H_Report	SUBMITTED	REJECT	DRAFT	Laporan dikembalikan ke mekanik untuk revisi.

5. Perilaku Lintas-Modul (Cross-cutting Behaviour)

* Otorisasi (RBAC):
  * Hanya pengguna dengan role Mechanic yang dapat menginisiasi UC-001.
  * Akses ke endpoint POST /p2h/approve dibatasi secara ketat menggunakan middleware JWT yang memeriksa klaim role Leader atau Supervisor.
* Auditability:
  * Setiap mutasi status pada tabel p2h_reports harus dicatat ke dalam tabel audit_logs.
  * Metadata audit wajib mencakup: id_log, transaction_id, actor_id, old_status, new_status, dan user_agent.

6. Traceability Matrix

Functional Item	PRD Item	API / Data / UI Reference	Test Reference
UC-001	PRD-001	Screen: InspeksiForm, API: POST /p2h/reports	TEST-P2H-001
BR-001	PRD-001	Table: report_attachments	TEST-P2H-V01
BR-002	PRD-002	Logic: UnitService.validateSMR()	TEST-P2H-V02
UC-002	PRD-005	Screen: ApprovalDashboard, API: PUT /p2h/approve	TEST-APP-001
BR-008	PRD-005	Logic: ApprovalWorkflow.checkSequence()	TEST-APP-V01
BR-010	PRD-006	Table: audit_log	TEST-SEC-001
