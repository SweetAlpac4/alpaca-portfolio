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
├── styles/         # base, layout, sections, achievements, fishing, admin
└── lib/            # supabase, achievement, fishing, dan secret-item storage

public/
├── fonts/          # Monocraft (SIL OFL)
├── textures/       # tekstur 16×16 hasil generate
├── img/biomes/     # background AVIF + WebP (1280/1920/2560)
└── audio/          # musik (di-track di Git)
```

## Achievement book

- Buka lewat tombol buku di bagian atas atau tekan `E`.
- Ada **6 hidden artifact** di biome berbeda. Klik item yang berkilau untuk
  mendapatkan advancement.
- Progres disimpan di `localStorage` browser dengan key
  `portfolio-achievements-v1` — tanpa akun, tanpa database, dan hanya berlaku
  di browser/perangkat itu. Reset tersedia di dalam buku. Milestone game dicek
  kembali dari progres game saat reload atau progres berubah.
- Keenam artifact membuka **Curious Explorer**. **Secret ending dinonaktifkan**
  lewat `src/lib/features.ts` sampai semua biome punya minigame. Progres artefak
  lama tetap disimpan.
- Ada 13 milestone game: tangkapan pertama/25 tangkapan, semua 6 pancing,
  12 tangkapan reguler, Echo Fish, bahan Rift pertama/6 jenis bahan, racikan
  berhasil pertama, Perfect pertama/5 Perfect, semua resep terbuka/berhasil
  diracik, dan 9 takaran tepat tanpa overheat.
- Buku punya filter Semua, Artefak, dan Minigame. Milestone yang sudah
  terpenuhi dari save lama langsung dikenali saat halaman dibuka.
- Ini terpisah dari tab **Achievements** di Deep Dark, yang berisi prestasi
  asli/sertifikat dari Supabase.

## Fishing mini-game

- Minigame hanya bisa dibuka di biome Overworld, lewat ikon pancing di samping Achievement Book atau tekan `F` saat berada di Overworld.
- Alur: **Cast** → tunggu tanda `!` → tekan **Reel** → tahan tombol untuk menarik
  dan lepas sebelum tension menyentuh batas. Catch progress harus mencapai 100%.
- Pemandangan pixel-art mengikuti jam lokal perangkat: **Malam**, **Fajar**,
  **Siang**, atau **Senja**, dengan warna lanskap dan pantulan yang sesuai.
- Pancing digambar di foreground (kanan bawah). Saat menarik, pancing memantul,
  senar menegang, bobber bergerak ke arah pancing, dan siluet ikan terlihat
  berjuang di bawah air.
- Ada 5 pancing biasa: Basic, Sturdy, Lucky, Golden, Prismarine. Pancing baru terbuka
  dari milestone jumlah tangkapan/spesies; pancing yang sudah terbuka bisa
  di-equip dari tab **Rods**.
- Ada 12 catch normal + **1 secret fish** (Echo Fish) dengan rarity mythic.
  Setiap ikan punya rarity, weight, length, dan size class
  (Tiny/Small/Average/Large/Trophy).
- Tab **Chest** menyimpan maksimal **54 ikan**; ikan bisa dilepas (2x klik untuk
  konfirmasi), dan daftar bisa diurutkan berdasarkan terbaru/terberat.
- Tab **Journal** menampilkan semua spesies. Spesies yang belum tertangkap
  tampil sebagai siluet hitam; yang sudah tertangkap tampil berwarna beserta
  rekor berat/panjang dan jumlah tangkapan.
- Progres disimpan di `localStorage` dengan key `portfolio-fishing-v1`, terpisah
  dari achievement book (`portfolio-achievements-v1`).
- Warden Rod ditempa di Deep Dark. Peluang Echo Fish pada lima lemparan pertama dengan rod ini adalah 20%, 40%, 60%, 80%, dan 100%. Setelah lemparan kelima, gigitan dijamin sampai Echo Fish berhasil ditangkap.

## Deep Dark

Buka ikon sculk di sebelah buku atau tekan D di Deep Dark. Di Silent Steps, ambil Echo Shard dan kembali ke pintu masuk sebelum waktu habis. Dua gelombang yang mengenai pemain membangunkan Warden. Bawa shard, satu Voidsteel (5% per blok Cave baris 7), satu Ramuan Resonansi, dan keenam artefak ke tungku. Aktifkan Api Jiwa di Nether setelah lima racikan Sempurna. Nyalakan semua rune dalam lima langkah untuk menempa Warden Rod. Mengulang puzzle menyimpan bahan.

## Nether Brewmaster

- Minigame hanya bisa dibuka di biome Nether, lewat ikon brewing di samping Achievement Book atau tekan `N` saat berada di Nether.
  `Esc` menutup game. Tombol hotbar bawah khusus navigasi biome.
- Loop: **mancing → tangkapan bahan Rift → brewing → bonus mancing**.
  Bahan menggantikan ikan pada tangkapan itu, bukan bonus bersama ikan.
- Enam bahan: Nether Wart, Glowstone Dust, Nether Quartz, Magma Cream,
  Blaze Powder, Ghast Tear. Peluang bahan dasar 14%, naik dengan luck pancing;
  Umpan Bara menambah 22 poin persentase. Luck pancing juga menaikkan peluang
  bahan langka. Tangkapan Rift punya efek merah pada air.
- Bahan masuk **Tas Racikan**, terpisah dari 54 slot ikan dan 13 entri jurnal
  ikan. Penemuan bahan tercatat permanen setelah bahan dipakai. Reset fishing
  menghapus ikan/pancing/statistik; tas, bonus, dan klaim starter tetap ada.
- Klaim starter kit sekali untuk bahan resep pertama. Satu ronde memakai
  3 bahan, berlangsung **36 detik**: 3 takaran untuk masing-masing bahan.
  Klik **Tambahkan** / `Space` saat penanda berada di zona emas (35–65%).
  Klik **Buang panas** / `V` untuk menurunkan suhu 24%; cooldown 1,6 detik.
  Pertahankan suhu 25–75%. Ronde dijeda saat tab browser tidak aktif.
- Skor: 70% ketepatan timing + 30% durasi suhu aman, dikurangi 4 poin setiap
  overheat. Kualitas: Gagal <35, Canggung 35–61, Bagus 62–87, Sempurna ≥88.
  Miss mengakhiri kombo; klik berulang dalam takaran yang sama tidak dihitung.
- Tutup/reload sebelum selesai: **refund semua bahan**. Gagal juga refund
  semua bahan, Canggung refund bahan pertama. Ronde selesai membuka resep
  setelah total 1, 3, 5, dan 8 ronde, termasuk percobaan gagal.

| Resep | Terbuka setelah | Hadiah kualitas Bagus |
| --- | --- | --- |
| Pengalaman | Awal | Umpan Bara, 5 lemparan |
| Tahan Api | 1 ronde | Umpan Bara, 8 lemparan |
| Kekuatan | 3 ronde | Ramuan Hoki, 5 lemparan |
| Keberuntungan | 5 ronde | Ramuan Hoki, 8 lemparan |
| Resonansi | 8 ronde | 1 Ramuan Resonansi untuk tungku |

- Sempurna menambah 2 lemparan bonus dan 1 **Bara Nether**. Lima Sempurna
  membuka title Brewmaster dan toggle kosmetik **Api Jiwa**. Bara Nether
  disimpan sebagai koleksi untuk update berikutnya, belum membuka ending.
- Bonus aktif otomatis, jumlahnya bisa ditumpuk, dan berkurang **sekali saat
  mulai melempar**, termasuk lemparan yang gagal atau dibatalkan. Ramuan Hoki
  menambah 0,8 luck pada pemilihan rarity ikan; tidak mengubah kapasitas peti.
- Resep, rekor skor, dan kosmetik tersimpan di `portfolio-nether-v1`.
  Tas, bonus, starter kit, dan reservasi bahan ada di `portfolio-fishing-v1`.
  Save versi lama dimigrasikan tanpa menghapus progres.

### Validasi lokal

```sh
npm run test:games   # Node 22.6+ dengan dukungan TypeScript stripping
npm run build       # typecheck + Vite production build
npm run dev         # cek manual: F / N / E
```

Tes logika mencakup migrasi save, tangkapan bahan vs ikan, bonus per lemparan,
reservasi/refund bahan, cooldown, scoring, milestone, dan flag ending.
Untuk cek UI: klaim starter, coba ronde dengan keyboard/touch, cek peti/tas,
reload saat brewing, periksa timer saat pindah tab, dan gunakan viewport mobile. Tombol dari game untuk biome lain akan menavigasi ke biome tersebut; minigame harus dibuka di sana.

## Musik

File ada di `public/audio/` dan ikut ter-deploy karena di-track di Git. Track C418
berhak cipta; kalau nanti ingin lebih aman untuk publikasi, ganti filenya dengan
audio berlisensi — nama file dan player tidak perlu diubah.

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
