# 💰 DompetKu — Aplikasi Keuangan Pribadi

Aplikasi web pencatatan keuangan pribadi modern dengan desain mobile-first, fitur lengkap, dan AI-powered receipt scanning.

## ✨ Fitur Utama

- 📊 **Dashboard** — Ringkasan saldo, wallet, dan transaksi terbaru
- 💳 **Transaksi** — Catat pemasukan, pengeluaran, dan transfer
- 📷 **AI Scan Struk** — Scan struk belanja otomatis dengan Claude Vision AI
- 📊 **Budget** — Atur dan pantau budget per kategori
- 🎯 **Target Tabungan** — Buat dan lacak target menabung
- 📈 **Laporan** — Grafik donut & bar chart, filter mingguan/bulanan/tahunan
- 📄 **Export** — Export laporan ke PDF & Excel
- 🌙 **Dark Mode** — Tampilan gelap premium sebagai default
- 🔔 **Notifikasi** — Alert budget dan pengingat harian

## 🛠️ Tech Stack

| Komponen | Teknologi |
|----------|-----------|
| Frontend | Vue 3 (Composition API + `<script setup>`) |
| Build Tool | Vite 5 |
| Styling | Tailwind CSS 3 |
| State | Pinia |
| Router | Vue Router 4 |
| Backend/DB | Supabase (PostgreSQL, Auth, Storage, Edge Functions) |
| Charts | ApexCharts + Vue3-ApexCharts |
| Export PDF | jsPDF + jsPDF-AutoTable |
| Export Excel | SheetJS (xlsx) |
| AI Vision | Claude (claude-opus-4-5) via Supabase Edge Function |

## 🚀 Setup & Instalasi

### 1. Clone & Install

```bash
cd aplikasi-keuangan
npm install
```

### 2. Setup Supabase

1. Buat project baru di [supabase.com](https://supabase.com)
2. Jalankan SQL migration di SQL Editor Supabase:
   - Buka file `supabase/migrations/001_init.sql`
   - Salin dan jalankan di Supabase SQL Editor
3. Buat Storage Buckets:
   - Buat bucket `avatars` (public)
   - Buat bucket `receipts` (public)

### 3. Environment Variables

Salin `.env.example` menjadi `.env` dan isi:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Setup Default Categories

Setelah user pertama register, jalankan di SQL Editor:

```sql
SELECT seed_default_categories('USER_ID_HERE');
```

### 5. Jalankan

```bash
npm run dev
```

Buka `http://localhost:5173` di browser.

### 6. Setup AI Scan Struk (Opsional)

1. Deploy Supabase Edge Function:
   ```bash
   supabase functions deploy scan-receipt
   ```
2. Tambahkan secret `ANTHROPIC_API_KEY` di Supabase Dashboard → Settings → Edge Functions → Secrets

## 📁 Struktur Project

```
src/
├── components/       # Semua komponen Vue
│   ├── common/       # Komponen reusable (BottomSheet, Skeleton, dll)
│   ├── layout/       # AppShell, TopBar, BottomNav
│   ├── dashboard/    # Komponen dashboard
│   ├── transaction/  # Form, list, filter, receipt scanner
│   ├── budget/       # Budget cards
│   ├── report/       # Chart components
│   └── savings/      # Goal cards
├── composables/      # Composable functions
├── pages/            # Semua halaman
├── stores/           # Pinia stores
├── lib/              # Supabase client
├── utils/            # Utilities (currency, date, formatters)
└── router/           # Vue Router config

supabase/
├── migrations/       # SQL migration files
└── functions/        # Edge Functions (scan-receipt)
```

## 📱 Desain

- **Mobile-first** (max-width 430px, centered)
- **Dark mode** sebagai default
- **Glassmorphism** cards
- **Smooth transitions** (Vue Transitions + CSS)
- **Bottom navigation** ala native mobile app
- **Skeleton loading** states
- **Micro-interactions** pada tombol dan input

## 📝 Lisensi

MIT
