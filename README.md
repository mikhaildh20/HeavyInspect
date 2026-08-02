# HeavyInspect - Edu-P2H

Platform inspeksi P2H (Pelaksanaan Harian) digital untuk heavy equipment di TRPAB.

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Database**: PostgreSQL 18 (lokal) via Drizzle ORM
- **Auth**: NextAuth.js v5 (JWT)
- **UI**: Tailwind CSS, Lucide Icons
- **Export**: SheetJS (xlsx) untuk import/export Excel

## Fitur

- **Operator (Mahasiswa)**: Input laporan P2H dengan foto bukti, GPS tracking, QR scanner
- **Instruktur (Leader)**: Review dan approve laporan dengan notifikasi real-time
- **Dosen (Supervisor)**: Final approval dengan one-click approve
- **Admin**: Kelola user (CRUD + import/export Excel), unit, dan master sheet checklist

### Fitur Lanjutan

- **Notifikasi Real-time**: Bell icon dengan unread count, mark as read, action links
- **Dashboard Analitik**: Statistik laporan per role (Mahasiswa, Instruktur, Dosen, Admin)
- **Admin Sidebar**: Desktop-first sidebar navigation untuk admin panel
- **Penambahan Fluida**: Input oli, coolant, grease pada form P2H
- **Audit Log**: Pencatatan semua aksi penting (create, approve, reject)
- **Kompresi Gambar**: Kompresi otomatis di browser sebelum upload
- **ID Encryption**: HMAC-SHA256 untuk semua ID di URL

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 18 (lokal)

### Instalasi

```bash
npm install
```

### Setup Database

```bash
# Push schema ke database lokal
npx drizzle-kit push

# Seed data (4 users + 8 units + 13 parameters)
npm run seed
```

### Jalankan Dev Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

### Akun Default

| Username | Password | Role |
|----------|----------|------|
| operator1 | password123 | Mahasiswa |
| leader1 | password123 | Instruktur |
| supervisor1 | password123 | Dosen |
| admin1 | admin123 | Admin |

### Units

| Kode | Model |
|------|-------|
| PC200-001 | Komatsu PC 200-8 |
| PC200-002 | Komatsu PC 200-8 |
| PC400-001 | Komatsu PC 400-8 |
| CAT320-001 | CAT 320GC |
| CATD6T-001 | CAT D6T |
| HD785-001 | Komatsu HD785-5 |
| WA380-001 | Komatsu WA380-8 |
| GD655-001 | Komatsu GD655-7 |

## Project Structure

```
src/
├── app/              # Next.js App Router (pages & API routes)
│   ├── (auth)/       # Login, change-password
│   ├── (protected)/  # Dashboard, scan, P2H, reports, review
│   ├── admin/        # Admin panel (users, units, checklist)
│   └── api/          # API routes (CRUD, auth, export, uploads)
├── components/       # React components
│   ├── admin/        # AdminSidebar, UserList, UnitForm
│   ├── checksheet/   # MaintenanceChecksheet
│   ├── dashboard/    # MahasiswaDashboard, ApprovalDashboard, DosenDashboard
│   ├── layout/       # AppShell, ConfirmModal
│   ├── p2h/          # P2H form, ReviewForm
│   ├── profile/      # ProfileForm, NotificationBell
│   ├── reports/      # ReportList, ReportDetail
│   ├── scan/         # ScannerView
│   └── units/        # UnitsList, UnitChecklistManager
├── contexts/         # React contexts (NotificationContext)
├── db/               # Drizzle ORM schema, migrations, seed
├── lib/              # Utilities (crypto, auth, audit, upload)
├── actions/          # Server actions (p2h, notifications)
└── middleware.ts     # Route protection, role-based redirect
```

## Documentation

Lihat folder `docs/` untuk dokumentasi lengkap:
- `README.md` - Ringkasan dan hierarki dokumentasi
- `01_PROJECT_RULES.md` - Aturan operasional proyek
- `02_PRD.md` - Product Requirements Document
- `03_FSD.md` - Functional Specification Document
- `04_TSD.md` - Technical Specification Document
- `05_ERD.md` - Entity Relationship Diagram
- `06_API_SPEC.md` - API Specification
- `07_UI_UX_SPEC.md` - UI/UX Specification
- `08_TEST_PLAN.md` - Test Plan
- `09_BACKLOG.md` - Product Backlog
- `10_DEV_LOG.md` - Development Log
- `11_CHANGELOG.md` - Changelog
- `12_CODING_STANDARDS.md` - Coding Standards
- `13_TASK_BREAKDOWN.md` - Task Breakdown
- `HANDOFF.md` - Session Handoff
