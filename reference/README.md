# Referensi & Aset Mentah

Folder ini **tidak ikut build/deploy**. Taruh semua screenshot dan aset mentah di sini,
nanti saya optimasi (WebP/AVIF, resize, crop) ke `public/img/`.

Nama file bebas — tidak perlu rapi. Cukup masukkan ke folder section yang benar.

## Spesifikasi umum screenshot

- **Java Edition**, sembunyikan HUD dengan **F1**
- **FOV 70**, render distance 12+, **tanpa shader**, resource pack default
- Resolusi minimal **2560×1440**, ideal **3840×2160**
- `/weather clear`, waktu konsisten per biome
- Format **PNG** (lossless)

## Checklist per section

### 01 — Overworld Village
- [ ] `wide` — village siang hari, langit biru, sudut sedikit dari atas
- [ ] `detail` — close-up rumah/ jalan desa (untuk kartu about)
- [ ] (opsional) `foreground` — dedaunan/rumput dengan background transparan untuk parallax

Command bantuan:
```
/time set noon
/locate structure minecraft:village_plains
```

### 02 — Cave
- [ ] `wide` — gua dengan obor, suasana gelap
- [ ] `detail` — ore (diamond/iron) atau dripstone/lush cave
- [ ] (opsional) `foreground` — batu/torch di depan kamera

Command bantuan:
```
/locate biome minecraft:lush_caves
/locate biome minecraft:dripstone_caves
```

### 03 — Deep Dark
- [ ] `wide` — ancient city, sculk biru, minim cahaya
- [ ] `detail` — shrieker / sculk sensor / chest ancient city
- [ ] (opsional) `warden` — siluet warden dari jauh (jangan sampai mati)

Command bantuan:
```
/locate structure minecraft:ancient_city
```

### 04 — Nether
- [ ] `wide` — nether wastes dengan lava, fog merah
- [ ] `detail` — nether fortress / portal / soul sand valley
- [ ] (opsional) `foreground` — netherrack atau api

Command bantuan:
```
/locate structure minecraft:fortress
/locate biome minecraft:soul_sand_valley
```

### 05 — The End
- [ ] `wide` — end islands, void, langit gelap
- [ ] `detail` — end city / end portal / chorus plant
- [ ] (opsional) `dragon` — siluet ender dragon

Command bantuan:
```
/execute in minecraft:the_end run locate structure minecraft:end_city
```

### 06 — Credits
Tidak perlu screenshot — akan dibuat dengan CSS/Canvas.
Kalau punya referensi tampilan End poem, taruh di sini.

## Aset lain yang dibutuhkan

Taruh di folder berikut (bukan di `reference/`):

| Aset | Folder | Spesifikasi |
|---|---|---|
| Foto profil | `public/img/profile/` | persegi, min 1000×1000, wajah jelas |
| Screenshot proyek | `public/img/projects/` | 16:9, min 1280×720, 3–6 gambar |
| Logo organisasi | `public/img/organizations/` | PNG transparan atau SVG |
| Musik (lokal saja) | `public/audio/` | MP3, `minecraft.mp3` & `mice-on-venus.mp3` |

## Format nama (opsional, biar gampang)

```
reference/01-overworld/overworld-wide-01.png
reference/01-overworld/overworld-detail-01.png
reference/02-cave/cave-wide-01.png
...
```

Prioritas kalau mau mulai cepat: **Overworld wide + foto profil + 3 screenshot proyek**.
Sisanya bisa menyusul sambil development jalan.
