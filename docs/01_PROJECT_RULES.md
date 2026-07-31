Aturan Proyek: Edu-P2H (HeavyInspect)

Dokumen ini menetapkan kerangka kerja operasional, batasan teknik, dan prosedur wajib bagi seluruh kontributor (manusia dan agen AI). Dokumen ini bersifat otoritatif dan mengabaikan preferensi pribadi demi konsistensi arsitektur dan integritas data.

1. Identitas Proyek dan Kontrol Dokumen

Informasi Dasar	Detail
Nama Proyek	Edu-P2H (HeavyInspect)
Versi	1.0.0
Pemilik	Project Owner
Status	Dokumen Aktif
Terakhir Ditinjau	2024-05-22

2. Tujuan dan Hirarki Kebenaran (Precedensi)

Dokumen ini bertujuan untuk menstandarisasi proses pengembangan dan pengambilan keputusan. Jika terdapat kontradiksi informasi antar dokumen, hirarki berikut WAJIB diikuti (prioritas tertinggi ke terendah):

1. Instruksi Keamanan dan Operasional Lokal Repositori: Melampaui seluruh dokumen lainnya.
2. Batasan Hukum, Keamanan, dan Operasional yang Disetujui.
3. 01_PROJECT_RULES.md (Dokumen ini).
4. 02_PRD.md (Product Requirements Document).
5. 03_FSD.md (Functional Specification Document).
6. 04_TSD.md (Technical Specification Document).
7. 05_ERD.md (Database Schema / ERD).
8. 06_API_SPEC.md (API Specification).
9. 07_UI_UX_SPEC.md (UI/UX Specification).
10. 08_TEST_PLAN.md (Rencana Pengujian).
11. 09_BACKLOG.md (Daftar Tugas Aktif).
12. 10_DEV_LOG.md (Log Pengembangan).
13. 11_CHANGELOG.md (Catatan Perubahan Rilis).
14. 12_CODING_STANDARDS.md (Standar Kode).
15. 13_TASK_BREAKDOWN.md dan HANDOFF.md.

Protokol Resolusi Konflik: Jika terjadi konflik informasi yang tidak dapat diselesaikan berdasarkan hirarki di atas, pengembang DILARANG membuat asumsi sendiri. Konflik WAJIB dicatat dalam 09_BACKLOG.md dan HANDOFF.md sebagai hambatan (blocker) untuk segera ditinjau oleh Project Owner.

3. Batasan Teknik dan Arsitektur

Seluruh rekayasa sistem HeavyInspect WAJIB mematuhi batasan berikut tanpa pengecualian:

* Arsitektur: Menggunakan Next.js App Router sebagai fondasi framework aplikasi.
* Basis Data: Menggunakan SQLite 3 untuk menjamin portabilitas dan kemudahan manajemen data lokal.
* Quality Gates (Gerbang Kualitas): Integrasi kode ke main branch hanya diizinkan jika melewati otomatisasi pemeriksaan berikut:
  * Linter: Kepatuhan mutlak terhadap standar penulisan kode.
  * Typecheck: Validasi tipe data TypeScript tanpa galat.
  * Build Test: Aplikasi harus dapat dikompilasi secara sukses dalam lingkungan simulasi produksi.

4. Struktur Peran dan RBAC (Role-Based Access Control)

Aksesibilitas fitur dan batasan fungsional ditentukan oleh peran berikut:

Peran	Deskripsi	Batasan Akses
Mahasiswa (Mechanic)	Pelaksana teknis utama dalam alur kerja pemeliharaan.	Terbatas pada pengisian formulir P2H, pembacaan panduan teknis, dan pembaruan status tugas individu.
Instruktur (Leader)	Koordinator lapangan dan verifikator teknis.	Verifikasi hasil inspeksi mahasiswa, manajemen distribusi tugas tim, dan akses ke laporan performa tim.
Dosen (Supervisor)	Auditor tingkat tinggi dan pemegang otoritas akademik.	Pengawasan menyeluruh, audit validitas data historis, serta pengelolaan penilaian akhir dan manajemen pengguna.

5. Prosedur Alur Kerja Wajib (Required Workflow)

Setiap sesi kerja WAJIB mengikuti prosedur sinkron berikut:

1. Pra-Analisis: Tinjau spesifikasi terkait, status backlog terkini, 10_DEV_LOG.md, dan instruksi terakhir pada HANDOFF.md.
2. Aktivasi Tugas: Pilih tugas dengan status TODO yang tidak terblokir (unblocked). Ubah status menjadi IN_PROGRESS sebelum memulai penulisan kode.
3. Spesifikasi Teknis: Definisikan Acceptance Criteria (AC) dan identifikasi seluruh dependensi antar modul.
4. Eksekusi dan Validasi: Lakukan implementasi diikuti dengan tinjauan mandiri dan verifikasi fungsi sesuai rencana pengujian.
5. Sinkronisasi Dokumentasi: Segera setelah tugas diverifikasi, pengembang WAJIB memperbarui 09_BACKLOG.md, 10_DEV_LOG.md (termasuk daftar file yang diubah dan bukti verifikasi), HANDOFF.md, dan 11_CHANGELOG.md (jika relevan).

6. Aturan Kontrol Perubahan (Change Control)

Modifikasi elemen kunci sistem harus mengikuti protokol formal:

* Perubahan Persyaratan (Requirements): WAJIB mendapatkan persetujuan tertulis dari Project Owner dan memperbarui dokumen spesifikasi (PRD/FSD) sebelum kode diubah.
* Perubahan Skema (Schema): Setiap modifikasi basis data WAJIB menyertakan skrip migrasi yang dapat dibatalkan (reversible), pembaruan diagram ERD, dan analisis dampak terhadap data yang ada.
* Perubahan API: Seluruh respons API WAJIB menggunakan standar JSON Error Envelope yang konsisten. Perubahan kontrak API WAJIB mencakup pembaruan dokumentasi kontrak dan uji kompatibilitas balik (backward compatibility).

Peringatan Keamanan dan Data: DILARANG KERAS menyimpan atau melakukan commit terhadap secrets (API keys, credentials), data produksi, atau informasi pribadi sensitif (PII - Personally Identifiable Information). Pengembang wajib mengikuti kebijakan klasifikasi data proyek.

7. Standar Komunikasi dan Dokumentasi

Kontinuitas proyek bergantung pada kualitas dokumentasi harian:

* Log Pengembangan (10_DEV_LOG.md): Catat setiap tugas selesai dengan rincian file yang dimodifikasi, keputusan teknis yang diambil, dan bukti verifikasi (misalnya: hasil eksekusi perintah atau screenshot fungsionalitas).
* Catatan Perubahan (11_CHANGELOG.md): Rekam seluruh rilis fitur, perbaikan bug, dan perubahan API sesuai standar Semantic Versioning.
* Kontinuitas Sesi (HANDOFF.md): WAJIB dibaca pada awal sesi dan diperbarui pada akhir sesi untuk memastikan transisi antar kontributor atau agen AI berjalan tanpa kehilangan konteks.
