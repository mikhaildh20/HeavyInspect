# Task Breakdown - HeavyInspect

Project: HeavyInspect
Version: 1.1
Date: 2026-07-31

## 1. Overview

Dokumen ini mendefinisikan hierarki roadmap pengiriman dan pemetaan tugas menyeluruh untuk proyek HeavyInspect. Tugas-tugas diurutkan berdasarkan dependensi dan prioritas implementasi.

## 2. Phase 1: Core Foundation (Completed)

| ID | Task | Status | Dependencies | Evidence |
|---|---|---|---|---|
| TASK-001 | Inisialisasi Project & Setup Database SQLite | DONE | None | Boilerplate Next.js, Drizzle schema push, linter passes |
| TASK-002 | Setup Auth.js dengan Role-Based Access Control | DONE | TASK-001 | Auth.js configured, session management working |
| TASK-003 | Buat Database Schema sesuai 05_ERD.md | DONE | TASK-001 | 6 tables created: users, units, checklist_parameters, p2h_reports, p2h_results, fluid_additions |

## 3. Phase 2: QR Scanner & Unit Identification

| ID | Task | Status | Dependencies | Acceptance Criteria |
|---|---|---|---|---|
| TASK-004 | Implement Real QR Scanner dengan Camera Access | DONE | TASK-003 | Scanner dapat mengakses kamera perangkat, membaca QR Code, dan menavigasi ke form P2H |
| TASK-005 | Buat Unit Management API | DONE | TASK-003 | Endpoint GET/POST/PUT /units tersedia, data unit dapat di-query |
| TASK-006 | Implement Manual Unit ID Input (Fallback) | DONE | None | Form input manual tersedia jika QR scan gagal |

## 4. Phase 3: P2H Inspection Form

| ID | Task | Status | Dependencies | Acceptance Criteria |
|---|---|---|---|---|
| TASK-007 | Implementasi Form P2H dengan Checklist Interaktif | DONE | TASK-003 | Form dapat menerima input SMR, checklist status (G/B/U), dan validasi BR-001 |
| TASK-008 | Implementasi Photo Capture untuk Item Bad/Urgent | DONE | TASK-007 | Kamera dapat diakses, foto tersimpan sebagai base64, validasi photo mandatory untuk status B/U |
| TASK-009 | Implementasi Digital Signature Pad | REMOVED | None | Dihapus — approval by button saja, tidak perlu tanda tangan digital |
| TASK-010 | Implementasi Offline-First dengan Local Storage | DONE | TASK-007 | Draft tersimpan di localStorage, sync saat online |
| TASK-011 | Implementasi SMR Validation (BR-002) | DONE | TASK-003 | Validasi SMR input >= SMR terakhir di database |

## 5. Phase 4: Approval Workflow

| ID | Task | Status | Dependencies | Acceptance Criteria |
|---|---|---|---|---|
| TASK-012 | Implementasi Dashboard untuk Leader/Supervisor | DONE | TASK-003 | Dashboard menampilkan antrian laporan yang perlu persetujuan |
| TASK-013 | Implementasi Sequential Approval (BR-008) | DONE | TASK-012 | Leader dapat approve, Supervisor hanya bisa approve setelah Leader approve |
| TASK-014 | Implementasi Review Form dengan Detail Laporan | DONE | TASK-003 | Form review menampilkan detail laporan, tombol approve/reject |
| TASK-015 | Implementasi Button-Only Approval | DONE | TASK-009 | Tombol approve/reject langsung tanpa tanda tangan digital |

## 6. Phase 5: Dashboard & Analytics

| ID | Task | Status | Dependencies | Acceptance Criteria |
|---|---|---|---|---|
| TASK-016 | Implementasi Mahasiswa Dashboard | DONE | TASK-003 | Dashboard menampilkan daftar laporan milik mahasiswa |
| TASK-017 | Implementasi Aggregated Dashboard untuk Dosen | DONE | TASK-003 | Dashboard menampilkan grafik tren kerusakan unit |
| TASK-018 | Implementasi Report History & Detail View | DONE | TASK-003 | Riwayat laporan dapat diakses, detail lengkap tersedia |

## 7. Phase 6: Data Management

| ID | Task | Status | Dependencies | Acceptance Criteria |
|---|---|---|---|---|
| TASK-019 | Implementasi CRUD Users (Admin) | DONE | TASK-003 | Admin dapat membuat, membaca, memperbarui, menonaktifkan user |
| TASK-020 | Implementasi CRUD Units (Admin) | DONE | TASK-003 | Admin dapat mengelola data unit alat berat |
| TASK-021 | Implementasi Master Checklist Parameters | DONE | TASK-003 | Admin dapat mengelola parameter pemeriksaan |

## 8. Phase 7: Advanced Features

| ID | Task | Status | Dependencies | Acceptance Criteria |
|---|---|---|---|---|
| TASK-022 | Implementasi GPS Coordinates Capture | DONE | TASK-007 | Koordinat GPS tertangkap saat submit laporan |
| TASK-023 | Implementasi Image Compression (Client-Side) | DONE | TASK-008 | Foto dikompresi otomatis jika ukuran terlalu besar |
| TASK-024 | Implementasi Push Notification | DONE | TASK-013 | Notifikasi terkirim saat laporan disetujui/ditolak |
| TASK-025 | Implementasi Audit Log | DONE | TASK-013 | Seluruh mutasi status tercatat di audit_logs |

## 9. Phase 8: Testing & Quality Assurance

| ID | Task | Status | Dependencies | Acceptance Criteria |
|---|---|---|---|---|
| TASK-026 | Unit Testing untuk Server Actions | TODO | All backend tasks | Coverage > 80% untuk server actions |
| TASK-027 | Integration Testing untuk API Endpoints | TODO | All API tasks | Semua endpoint teruji |
| TASK-028 | E2E Testing untuk Core Journeys | TODO | All features | Happy path dan error paths teruji |
| TASK-029 | Performance Testing & Optimization | TODO | All features | Lighthouse score > 90 |

## 10. Dependency Graph

```
TASK-001 (Init) ──► TASK-003 (DB Schema) ──► TASK-004 (QR Scanner)
                    │                          │
                    │                          ▼
                    │                    TASK-007 (P2H Form) ──► TASK-008 (Photo)
                    │                          │                   │
                    │                          ▼                   ▼
                    │                    TASK-009 (Signature) ◄───┘
                    │                          │
                    │                          ▼
                    │                    TASK-012 (Dashboard) ──► TASK-013 (Approval)
                    │                                            │
                    │                                            ▼
                    │                                      TASK-015 (Approval Signature)
                    │
                    └──► TASK-005 (Unit API) ──► TASK-019 (User CRUD)
                                                  TASK-020 (Unit CRUD)
                                                  TASK-021 (Checklist CRUD)
```

## 11. Current Sprint Focus

**Sprint 1: QR Scanner & Camera Integration** — COMPLETED
- TASK-004: Implement Real QR Scanner dengan Camera Access ✅
- TASK-008: Implementasi Photo Capture untuk Item Bad/Urgent ✅

**Sprint 2: Approval Workflow Completion** — COMPLETED
- TASK-013: Implementasi Sequential Signing (BR-008) ✅
- TASK-015: Implementasi Digital Signature untuk Approval ✅

**Sprint 3: Data Management & Notifications** — COMPLETED
- TASK-019: CRUD Users (Admin) ✅
- TASK-020: CRUD Units (Admin) ✅
- TASK-021: Master Checklist Parameters ✅
- TASK-024: Push Notification ✅
- TASK-025: Audit Log ✅

## 12. Notes

- Semua task harus mengikuti 12_CODING_STANDARDS.md
- Verifikasi harus terdokumentasi di 10_DEV_LOG.md
- Perubahan signifikan harus dicatat di 11_CHANGELOG.md
