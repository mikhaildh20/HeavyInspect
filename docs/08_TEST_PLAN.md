08_TEST_PLAN.md: Rencana Pengujian Kualitas Sistem HeavyInspect

Dokumen ini menetapkan strategi komprehensif, metodologi, dan protokol jaminan kualitas untuk sistem HeavyInspect (Edu-P2H). Fokus utama adalah menjamin integritas data operasional dan validitas alur kerja persetujuan di lingkungan bengkel TRPAB.

1. Informasi Dokumen

* Proyek: Edu-P2H (HeavyInspect)
* Versi: 1.0.0
* QA Owner: Senior QA Engineer / Technical Lead

2. Sasaran Kualitas dan Cakupan

Risiko Kualitas Utama

* Kehilangan Data Digital P2H: Kegagalan persistensi data pada kondisi jaringan fluktuatif di hangar TRPAB yang mengakibatkan diskontinuitas catatan pemeliharaan.
* Manipulasi Tanda Tangan Elektronik: Pelanggaran hierarki persetujuan atau modifikasi data laporan pasca-penandatanganan.

Sasaran Utama (Program Goals)

* Zero Data Loss: Menjamin persistensi data 100% melalui mekanisme local storage persistence dan strategi retry otomatis saat konektivitas intermiten di area bengkel. Validasi dilakukan pada level sinkronisasi client-side ke server-side.
* Integrity of Approval: Memastikan rantai kepercayaan (chain of trust) pada approval berjenjang. Sistem harus mengunci status laporan segera setelah approval diberikan dan menolak approval jika urutan otoritas (Mahasiswa -> Instruktur -> Dosen) dilanggar.

Cakupan Pengujian

* Mekanisme Scan QR: Identifikasi unit Komatsu PC 200-8 dalam berbagai kondisi pencahayaan rendah dan label QR yang mengalami degradasi fisik.
* Validasi Nilai SMR (Service Meter Reading): Penolakan input anomali yang tidak logis terhadap data historis di database.
* Alur Kerja Sequential Signing: Verifikasi logika server-side untuk memastikan status signed_at pada level sebelumnya telah terpenuhi.

Kriteria Keluar (Exit Criteria)

1. 100% dari P0 (Critical) test cases lulus tanpa pengecualian.
2. Tidak terdapat cacat dengan tingkat keparahan Blocker atau Critical yang belum terselesaikan.
3. Hasil uji regresi otomatis menunjukkan stabilitas pada fungsi inti di semua supported viewports.

3. Lingkungan dan Data Pengujian

Environment	Purpose	Build / configuration	Test data	Owner
Staging	Uji integrasi, E2E, dan UAT.	Docker-based staging dengan mirror skema database produksi.	Snapshot data riil unit Komatsu PC 200-8; Akun dummy (Mahasiswa, Instruktur, Dosen).	QA Team
Local/Dev	Unit testing dan pengembangan fitur.	Node.js environment dengan database in-memory/local.	Data mock minimalis sesuai schema.	Developer

4. Strategi Pengujian Berlapis

Layer	Purpose	Tool / method	Required for
Unit Testing	Validasi logika bisnis isolasi (Fungsi kalkulasi & utilitas).	Vitest	Semua modul logika bisnis.
Integration Testing	Contract Testing untuk memastikan integritas skema API antara frontend dan backend.	Vitest	Modul API, Middleware, dan Database Repository.
End-to-End (E2E)	Validasi Critical User Journey dari Scan QR hingga Approval akhir.	Playwright	Alur pemeriksaan unit dan sinkronisasi data.
Security Testing	Audit otorisasi peran dan proteksi manipulasi parameter ID.	OWASP ZAP / Manual Audit	Endpoint approval dan upload bukti foto.
Performance Testing	Memastikan responsivitas sistem saat beban puncak di jam bengkel.	k6	Sinkronisasi batch data P2H oleh banyak user simultan.

5. Tabel Kasus Uji Spesifik (Aturan Bisnis Kritis)

ID	Requirement / rule	Preconditions	Steps	Expected result	Type	Priority
TEST-001	Mandatory Photo (BR-001 / PRD-005)	Mahasiswa di halaman input form pemeriksaan.	1. Isi semua field teks.<br>2. Kosongkan lampiran foto.<br>3. Klik "Submit".	UI menampilkan pesan error; tombol submit dinonaktifkan hingga file diunggah.	Functional	P0
TEST-002	SMR Validation (BR-002 / PRD-006)	Database mencatat SMR terakhir unit adalah 5000.	1. Input nilai SMR 4900.<br>2. Klik "Next".	Sistem memblokir aksi "Next", menampilkan peringatan logis, dan mencegah penulisan ke database.	Logic	P0
TEST-003	Sequential Approval (BR-008 / PRD-010)	Laporan telah disubmit Mahasiswa namun belum disetujui Instruktur.	1. Login sebagai Dosen.<br>2. Buka detail laporan tersebut.	Tombol/fitur approve Dosen tidak terlihat atau dalam status disabled.	Authorization	P0
TEST-004	QR Edge Case (BR-005 / PRD-004)	Menggunakan stiker QR unit PC 200-8 yang kusam/rusak 20%.	1. Pindai QR di area minim cahaya (hangar).	Algoritma pemindaian berhasil mengidentifikasi unit tanpa false-negative.	Reliability	P1

6. Pemeriksaan Regresi dan Rilis

* [ ] Build, lint, dan typecheck berhasil diselesaikan tanpa error (Zero Warnings).
* [ ] Seluruh rangkaian pengujian otomatis (Vitest & Playwright) lulus 100%.
* [ ] Validasi manual alur kritis dilakukan di bengkel TRPAB menggunakan perangkat mobile target.
* [ ] Review kompatibilitas skema database (migration check) dan kontrak API telah disetujui.
* [ ] Pemeriksaan aksesibilitas (kontras warna & navigasi keyboard) dan keamanan (token expiry) lulus.
* [ ] Daftar Known Issues telah ditinjau: semua isu tersisa memiliki owner, tingkat keparahan, dan rencana mitigasi.

7. Pelaporan Cacat (Defect Reporting)

Field	Required content
ID / Severity	Contoh: BUG-001 / Critical (Blocker), Major, Minor.
Reproduction	Langkah detail, spesifikasi perangkat (Android/iOS), dan data unit yang digunakan.
Expected / Actual	Deskripsi hasil yang seharusnya terjadi vs anomali yang ditemukan.
Evidence	URL rekaman sesi, screenshot UI, atau raw log dari konsol/server.
Owner / status	Pengembang yang ditugaskan dan status saat ini (NEW/IN_PROGRESS/FIXED).
