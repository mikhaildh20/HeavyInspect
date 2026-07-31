Product Requirements Document (PRD): (HeavyInspect)

1. Metadata Dokumen

* Product: (HeavyInspect)
* Version / status: v1.0 / APPROVED
* Owner: Program Studi TRPAB
* Last reviewed: 2024-05-23

2. Masalah dan Visi Produk (Problem and Product Vision)

* Problem: Proses Pemeliharaan dan Pemeriksaan Harian (P2H) pada unit alat berat di lingkungan TRPAB saat ini masih bergantung pada formulir berbasis kertas. Metode ini memiliki risiko tinggi terhadap degradasi fisik dokumen akibat kontaminasi oli, lumpur, dan cuaca ekstrem di lapangan. Selain itu, risiko kehilangan data fisik mengakibatkan diskontinuitas riwayat pemeliharaan dan menghambat integritas data akademik serta operasional.
* Target Users: Mahasiswa TRPAB (Operator/Inspektor), Instruktur (Validator Lapangan), dan Dosen (Reviewer Akademik) dalam konteks operasional unit.
* Value Proposition: Transformasi digital melalui platform inspeksi yang tangguh (resilient), memastikan persistensi data tanpa kertas, memvalidasi bukti fisik melalui dokumentasi digital, serta memusatkan informasi kondisi unit dalam satu basis data terintegrasi yang mudah diakses untuk kebutuhan audit dan pendidikan.
* Success Metrics:
  * Zero Paper: 100% eliminasi penggunaan kertas pada inspeksi harian unit.
  * 0% Data Loss: Integritas data terjamin 100% melalui sinkronisasi asinkron yang aman, memastikan tidak ada laporan yang hilang meskipun terjadi kendala konektivitas.

3. Tujuan dan Batasan (Goals and Non-goals)

* In Scope:
  * Digitalisasi formulir P2H spesifik untuk template teknis unit.
  * Mekanisme otentikasi pengguna dan penandaan lokasi inspeksi.
  * Fitur validasi input lapangan (foto wajib dan tanda tangan digital).
  * Penyimpanan data terpusat dengan kemampuan akses berbasis peran (role-based access control).
  * Implementasi offline-first dengan sinkronisasi otomatis.
* Explicitly Out of Scope:
  * Sistem manajemen inventaris suku cadang (Spare Part Inventory).
  * Automasi penjadwalan pemeliharaan preventif (Maintenance Scheduling).
  * Pemesanan jasa perbaikan pihak ketiga.

4. Pengguna dan Peran (Users and Roles)

Role	Goals	Permissions / boundaries
Mahasiswa	Melakukan inspeksi teknis unit secara presisi dan melaporkan kondisi harian.	Membuat entri laporan baru, mengunggah media bukti inspeksi, dan melakukan otentikasi melalui tanda tangan digital pada laporan pribadi.
Instruktur	Melakukan verifikasi faktual hasil inspeksi di lapangan dan memberikan validasi teknis.	Meninjau laporan mahasiswa secara real-time, menyetujui/menolak laporan, dan membubuhkan tanda tangan verifikator.
Dosen	Memantau perkembangan kompetensi mahasiswa dan mengevaluasi kesehatan unit secara periodik.	Akses read-only ke seluruh riwayat laporan; akses ke dashboard analitik agregat dan laporan individu untuk evaluasi akademik.

5. Perjalanan Pengguna Utama (Core Journeys)

Alur Scan-to-Inspect Unit

Trigger: Mahasiswa memindai QR Code unik yang terpasang pada sasis unit menggunakan modul kamera aplikasi.

Happy Path:

1. Sistem melakukan parsing QR Code dan menghasilkan UUID unik untuk sesi inspeksi tersebut.
2. Aplikasi menampilkan antarmuka formulir yang telah terkonfigurasi sesuai standar teknis unit.
3. Mahasiswa mengisi parameter pemeriksaan pada kategori Engine, Hydraulics, Undercarriage, dan Cabin Safety.
4. Sistem mewajibkan pengambilan foto real-time untuk komponen kritis (misal: level oli mesin, kondisi track shoe).
5. Mahasiswa melakukan tanda tangan digital sebagai bukti tanggung jawab laporan.
6. Instruktur memvalidasi input di lokasi dan melakukan approval melalui tanda tangan digital verifikator.
7. Sistem melakukan payload submission ke server pusat dan mengubah status laporan menjadi "Validated".

Failure / Edge Paths:

* Konektivitas Terputus: Sistem mengaktifkan mekanisme local caching menggunakan IndexedDB untuk menjamin data persistency. Sinkronisasi akan dilakukan secara otomatis saat layanan internet kembali tersedia.
* Kamera Gagal Memindai: Jika QR Code rusak secara fisik, mahasiswa dapat melakukan manual override dengan memasukkan ID unit yang terverifikasi oleh sistem.
* Limitasi Memori Perangkat: Jika unggahan foto gagal karena batasan memori/penyimpanan perangkat, sistem akan melakukan kompresi citra secara otomatis di sisi klien (client-side image compression) sebelum mencoba pengiriman ulang.

Success Condition: Laporan tersimpan dalam basis data dengan status terverifikasi, lengkap dengan koordinat GPS, stempel waktu (timestamp), dan lampiran media yang valid.

6. Persyaratan Produk (Requirements)

ID	Requirement	Priority	Acceptance Criteria	Source / owner
PRD-001	Validasi Foto Inspeksi	MUST	Sistem harus mengunci akses galeri dan mewajibkan penggunaan kamera langsung untuk pengambilan foto komponen kritis (BR-001).	Stakeholder / BR-001
PRD-002	Digital Signature	MUST	Implementasi modul tanda tangan digital yang responsif dengan metadata stempel waktu terenkripsi untuk otentikasi (BR-008).	Stakeholder / BR-008
PRD-003	Technical Template	MUST	Formulir harus mencakup pemeriksaan spesifik: Engine Oil Level, Hydraulic Pressure, Swing Machinery, Undercarriage integrity, dan Monitor Panel functions.	Technical Architect
PRD-004	Offline Data Persistence	MUST	Menggunakan Service Workers atau Local Storage untuk menyimpan data inspeksi selama status offline tanpa kehilangan input pengguna.	Product Management
PRD-005	Aggregated Dashboard	SHOULD	Menyediakan tampilan grafik tren kerusakan unit untuk peran Dosen guna mendukung keputusan akademik.	Dosen TRPAB

7. Batasan dan Asumsi (Constraints and Assumptions)

* 7.1 Business Constraints: Implementasi teknis harus selaras dengan modul praktikum operasional alat berat pada kurikulum TRPAB.
* 7.2 Compliance / Privacy: Seluruh data tanda tangan dan identitas mahasiswa harus disimpan dengan enkripsi at-rest untuk mencegah manipulasi data nilai praktikum.
* 7.3 Dependencies: Ketersediaan perangkat seluler berbasis Android/iOS dengan dukungan fitur kamera dan GPS di sisi pengguna.
* 7.4 Approved Assumptions:
  * Seluruh unit telah dipasangi label QR Code yang tahan cuaca (Keputusan per 2024-05-10).
  * Instruktur memiliki perangkat tablet khusus untuk melakukan validasi massal di lapangan (Keputusan per 2024-05-15).

8. Keputusan Terbuka (Open Decisions)

ID	Question	Impact	Owner	Due Date	Status
DEC-001	Menggunakan penyimpanan Cloud (AWS S3) atau Server NAS Lokal untuk aset foto?	Arsitektur storage dan efisiensi biaya operasional jangka panjang.	Tim TI Kampus	2024-06-01	OPEN
DEC-002	Integrasi API dengan Sistem Informasi Akademik (SIAKAD) untuk otomatisasi nilai praktikum?	Kompleksitas middleware dan keamanan cross-system.	Kaprodi TRPAB	2024-06-15	OPEN
