12_CODING_STANDARDS.md - Standar Pengodean HeavyInspect

1. Informasi Dokumen

Detail	Deskripsi
Nama Proyek	HeavyInspect
Versi	1.0.0
Tumpukan Teknologi	Next.js App Router, TypeScript, Tailwind CSS, SQLite 3
Status Dokumen	Tersetujui (Approved)

Pernyataan Kepatuhan Dokumen ini selaras dengan pedoman operasional dalam 01_PROJECT_RULES.md dan berfungsi sebagai instruksi teknis utama bagi seluruh kontributor dan agen AI. Standar ini bersifat mengikat untuk memastikan konsistensi arsitektur, keamanan, dan keandalan sistem.

2. Prinsip Umum Pengembangan

Filosofi pengodean proyek ini mengutamakan keberlanjutan sistem jangka panjang di atas kemudahan jangka pendek:

* Klaritas di atas Abstraksi: Prioritaskan kode yang mudah dibaca dan kohesif. Hindari abstraksi prematur. Kode harus cukup jelas sehingga intensi pengembang dapat dipahami tanpa dokumentasi ekstensif.
* Validasi di Batas Sistem: Lakukan validasi ketat terhadap untrusted input di setiap batas sistem (API endpoints, Server Actions). Pada batas rendering, gunakan mekanisme escaping otomatis dari React. Penggunaan dangerouslySetInnerHTML dilarang kecuali disertai sanitasi eksplisit (misalnya menggunakan DOMPurify) dan persetujuan arsitek.
* Efek Samping Eksplisit: Fungsi harus transparan mengenai perubahan state yang dilakukan. Pertahankan konteks error yang kaya dan dapat ditindaklanjuti untuk mempercepat debugging.
* Pemisahan Logika Bisnis: Aturan bisnis adalah aset utama. Dilarang menduplikasi aturan bisnis di lapisan UI, transport, atau persistensi. Logika bisnis wajib memiliki tempat tinggal tunggal (lapisan Service).

3. Arsitektur Modular Monolith & Batas Lapisan

Sistem ini mengikuti struktur Modular Monolith. Setiap modul harus mematuhi batasan lapisan berikut:

Lapisan / Modul	Tanggung Jawab (May Do)	Larangan (Must Not Do)
Transport (API / Actions)	Parsing input (Zod), otorisasi, memicu logic, dan pemetaan respons ke klien.	Mengandung aturan bisnis atau melakukan query langsung ke database.
Application (Service)	Mengorkestrasi use case (BR-001, BR-008). Mengembalikan Result Objects atau Domain Exceptions.	Bergantung pada detail framework UI atau objek HTTP (Request/Response).
Repository (Persistence)	Abstraksi akses data SQLite 3. Wajib menggunakan Transactions untuk mutasi multi-tabel.	Menerapkan kebijakan bisnis atau melakukan mutasi data secara diam-diam.
UI (Components)	Rendering state, interaksi pengguna, dan memicu use case. Menggunakan Tailwind CSS.	Menjadi satu-satunya sumber validasi bisnis atau menyimpan logika perhitungan.

4. Konvensi Bahasa & Penamaan

* Strict TypeScript:
  * Larangan keras penggunaan any. Gunakan unknown jika tipe tidak diketahui saat kompilasi.
  * Wajib menangani nilai null dan undefined secara eksplisit. Gunakan discriminated unions untuk state yang kompleks.
* Penamaan File & Folder:
  * Gunakan kebab-case untuk semua file komponen dan utilitas (contoh: inspection-form.tsx).
  * Pengecualian: File reservasi Next.js App Router harus tetap menggunakan standar framework (page.tsx, layout.tsx, route.ts, loading.tsx, serta folder dinamis [id]).
* Formatting & Linting:
  * Standardisasi menggunakan ESLint dan Prettier.
  * Quality Gate: Kegagalan linting atau tipe data akan menyebabkan kegagalan pada CI/CD pipeline dan pre-commit hooks. Kode yang tidak lolos cek tidak boleh masuk ke cabang utama.
* Pengelolaan Error:
  * Gunakan kelas error terpusat yang membedakan antara Operational Errors dan Programmer Errors.
  * Logging dilarang mencantumkan data sensitif (PII) seperti NIK, kata sandi, atau nomor telepon.
* Konfigurasi:
  * Dilarang mengakses process.env secara langsung di dalam kode aplikasi.
  * Gunakan file konfigurasi terpusat (misal: src/config/env.ts) yang memvalidasi seluruh variabel lingkungan menggunakan Zod saat startup.

5. Standar Pengujian (Testing)

Setiap fitur baru wajib disertai dengan bukti pengujian otomatis:

* Unit & Integration Testing (Vitest):
  * Fokus pada pengujian logika di lapisan Application/Service.
  * Uji skenario kegagalan (failure paths), batas sistem, dan transisi state entitas sesuai FSD.
* End-to-End Testing (Playwright):
  * Fokus pada Critical User Journeys.
  * Wajib memverifikasi Role-Based Access Control (RBAC); pastikan aktor hanya dapat mengakses data dan aksi yang diizinkan sesuai spesifikasi PRD/FSD.
* Prinsip Pengujian:
  * Tes harus deterministik dan terisolasi.
  * Gunakan fixtures atau factories untuk data pengujian. Hindari hardcoded setup mentah yang berulang di setiap file tes.

6. Implementasi Aturan Bisnis (Business Rules)

Seluruh aturan bisnis (seperti BR-001 dan BR-008) wajib diimplementasikan di lapisan Application/Service.

1. Gatekeeper: Lapisan Service adalah penjaga gerbang terakhir untuk integritas data. Semua mutasi harus divalidasi terhadap aturan bisnis sebelum dikirim ke Repository.
2. Decoupling: Lapisan Service tidak boleh melempar error HTTP (seperti 404 atau 403). Ia harus mengembalikan objek hasil yang menyatakan sukses atau jenis kegagalan domain, yang kemudian dipetakan ke kode HTTP yang sesuai di lapisan Transport.
3. Consistency: Jika aturan bisnis berubah di FSD, perubahan kode hanya boleh terjadi di satu modul layanan yang bertanggung jawab atas aturan tersebut.

7. Checklist Tinjauan Kode (Review Checklist)

Gunakan daftar ini untuk verifikasi mandiri sebelum mengajukan Pull Request:

* [ ] Keterlacakan: Kode dapat ditelusuri kembali ke Requirement ID di PRD dan FSD.
* [ ] Integritas Database: Operasi multi-langkah di SQLite telah dibungkus dalam transaksi untuk menjamin atomisitas.
* [ ] Keamanan: Input divalidasi dengan Zod, otorisasi RBAC diperiksa di tingkat Server Action/API, dan tidak ada akses process.env langsung.
* [ ] Penanganan Error: Error domain ditangani tanpa membocorkan detail teknis atau PII ke pengguna akhir.
* [ ] Next.js Conventions: File-based routing menggunakan penamaan standar, sementara file pendukung menggunakan kebab-case.
* [ ] Cakupan Tes: Unit test mencakup edge cases logika bisnis dan Playwright memverifikasi alur akses pengguna berdasarkan peran.
* [ ] Kebersihan: Tidak ada rahasia (secrets), console.log untuk debug, atau kode mati (dead code) yang tertinggal.
