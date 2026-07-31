# HeavyInspect - Edu-P2H

Platform inspeksi P2H (Pelaksanaan Harian) digital untuk heavy equipment di TRPAB.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: SQLite via Drizzle ORM
- **Auth**: NextAuth.js v5 (JWT)
- **UI**: Tailwind CSS, Lucide Icons

## Fitur

- **Operator (Mahasiswa)**: Input laporan P2H dengan foto bukti
- **Instruktur (Leader)**: Review dan approve laporan
- **Dosen (Supervisor)**: Final approval dengan tanda tangan digital
- **Admin**: Kelola user, unit, dan checklist

## Getting Started

```bash
npm install
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

## Project Structure

```
src/
├── app/              # Next.js App Router
├── components/       # React components
├── db/               # Drizzle ORM schema
├── lib/              # Utilities (crypto, auth)
└── actions/          # Server actions
```

## Documentation

Lihat folder `docs/` untuk dokumentasi lengkap:
- `01_PROJECT_RULES.md` - Aturan proyek
- `02_SRS.md` - Software Requirements Specification
- `11_CHANGELOG.md` - Changelog
