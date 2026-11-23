# Portfolio — A Minecraft Journey

Website portofolio pribadi bertema Minecraft. Scroll-snap per biome, loading screen
ala "Loading world", bilingual (EN/ID), dan admin panel untuk mengedit konten tanpa code.

## Section

| # | Biome | Konten |
|---|---|---|
| 01 | Overworld | Introduction, nama, foto, about me |
| 02 | Cave | Education, skills (ore tiers) |
| 03 | Deep Dark | Projects & achievements |
| 04 | Nether | Organizations & experiences |
| 05 | The End | Contact & social media |
| 06 | Credits | Closing credits |

## Stack

- Vite + React + TypeScript
- Supabase (Postgres, Auth, Storage)
- TanStack Query
- CSS murni (tanpa framework UI)
- Deploy: Vercel / Netlify

## Menjalankan lokal

```bash
npm install
npm run dev
```

Buka http://localhost:5173

### Environment

Buat `.env.local`:

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-publishable-or-anon-key
```

Tanpa env, situs tetap jalan memakai konten fallback (tidak bisa login admin).

## Setup Supabase

1. Buat project (region Singapore).
2. **Settings → API**: catat Project URL + anon/publishable key.
3. **Authentication → Sign In / Providers → Email**: matikan **Enable Sign Ups**.
4. **Authentication → Users → Add user**: buat admin, centang **Auto Confirm User**.
5. **Storage → New bucket**: nama `media`, **Public**.
6. **SQL Editor** → paste isi `supabase/migrations/0001_init.sql` → **Run**.
7. Paste isi `supabase/migrations/0002_achievements.sql` → **Run**.

Migration `0001` membuat tabel, RLS policy, storage policy, dan starter content
(3 project, 8 skill, 3 experience, 4 social). `0002` menambahkan tabel
`achievements` untuk sertifikat lomba. Kalau kamu sudah pernah menjalankan
`0001`, cukup jalankan `0002` saja.

## Admin

- URL: `/admin`
- Login dengan akun yang dibuat di Supabase Auth.
- Tab: Profile, Projects, Achievements, Skills, Experience, Socials, Settings.
- Semua field teks punya tab **EN** dan **ID**.
- Upload gambar langsung dari browser; dikompres ke WebP (maks 1600px) sebelum masuk
  Supabase Storage.
- Perubahan langsung tampil di situs (tanpa rebuild).

Catatan: Deep Dark menampilkan **semua project published** dalam baris
horizontal — 3 terlihat sekaligus di desktop, sisanya digeser dengan tombol
←/→ atau swipe. **3 achievements per halaman** (tombol ←/→ kalau lebih dari 3).
Gunakan tombol ↑/↓ untuk mengatur urutan. Sertifikat diupload lewat
**Admin → Achievements → Certificate image**.

## Struktur

```
src/
├── main.tsx / App.tsx / Portfolio.tsx
├── data/           # types, fetch, fallback, sections
├── i18n/           # kamus EN/ID + LanguageProvider
├── components/     # loading, hotbar, music, toast, ikon
├── sections/       # Overworld, Cave, DeepDark, Nether, TheEnd, Credits
├── admin/          # login, dashboard, editors, komponen form
├── styles/         # base, layout, sections, admin
└── lib/supabase.ts

public/
├── fonts/          # Monocraft (SIL OFL)
├── textures/       # tekstur 16×16 hasil generate
├── img/biomes/     # background AVIF + WebP (1280/1920/2560)
└── audio/          # musik (di-gitignore)
```

## Musik

File ada di `public/audio/` dan **di-gitignore** karena berhak cipta (C418).
Untuk versi lokal saja. Kalau nanti dipublikasikan, ganti dengan track berlisensi
atau hapus folder audio — player otomatis menyembunyikan kontrolnya.

Track dipetakan per biome:

- `minecraft.mp3` → Overworld, Cave, Deep Dark
- `mice-on-venus.mp3` → Nether, The End, Credits

## Aset & kredit

- Background biome: screenshot/render Minecraft (pemakaian pribadi).
- Font: [Monocraft](https://github.com/IdreesInc/Monocraft) (SIL Open Font License).
- Minecraft adalah merek dagang Mojang Studios. Proyek ini tidak berafiliasi.

## Deploy

- **Netlify**: `netlify.toml` sudah berisi build command + SPA redirect.
- **Vercel**: `vercel.json` sudah mengarahkan `/admin/*` ke SPA.

Tambahkan environment variable `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY`
di dashboard hosting.

## Perintah

```bash
npm run dev        # dev server
npm run build      # typecheck + build produksi
npm run preview    # cek hasil build
npm run typecheck  # TypeScript saja
```
