# Portfolio — A Minecraft Journey

A personal portfolio website with a Minecraft theme. Biome-based scroll snapping, a
"Loading world" style loading screen, bilingual (EN/ID), and an admin panel to edit
content without code.

## Sections

| # | Biome | Content |
|---|---|---|
| 01 | Overworld | Introduction, name, photo, about me |
| 02 | Cave | Education, skills (ore tiers) |
| 03 | Deep Dark | Projects & achievements |
| 04 | Nether | Organizations & experiences |
| 05 | The End | Contact & social media |
| 06 | Credits | Closing credits |

## Stack

- Vite + React + TypeScript
- Supabase (Postgres, Auth, Storage)
- TanStack Query
- Plain CSS (no UI framework)
- Deploy: Vercel / Netlify

## Running locally

```bash
npm install
npm run dev
```

Open http://localhost:5173

### Environment

Create `.env.local`:

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-publishable-or-anon-key
```

Without the env vars, the site still runs using fallback content (admin login
will not work).

## Supabase setup

1. Create a project (Singapore region).
2. **Settings → API**: note the Project URL + anon/publishable key.
3. **Authentication → Sign In / Providers → Email**: disable **Enable Sign Ups**.
4. **Authentication → Users → Add user**: create an admin, check **Auto Confirm User**.
5. **Storage → New bucket**: name it `media`, set it to **Public**.
6. **SQL Editor** → paste the contents of `supabase/migrations/0001_init.sql` → **Run**.
7. Run `supabase/migrations/0002_achievements.sql` if it has not been applied yet.
8. From the SQL Editor, assign admin based on the **User UID** you verified in Authentication. Replace the placeholder with your account's UUID, make sure exactly one row is updated, then sign out and sign in again so the token refreshes.

```sql
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"portfolio_admin":true}'::jsonb
where id = '<ADMIN_USER_UUID>'::uuid
returning id;
```

9. Apply the [access restriction migration](supabase/migrations/20261126050913_restrict_portfolio_access.sql) in the SQL Editor. Then deploy the matching frontend. For login protection, check Supabase Auth rate limits and enable leaked password rejection if it is available on the project plan.

Migration `0001` creates the tables, RLS policies, storage policies, and starter content
(3 projects, 8 skills, 3 experiences, 4 socials). `0002` adds the
`achievements` table for competition certificates. The last migration restricts content
changes, draft reads, and media uploads to the admin. Files in the public bucket can be
accessed via URL, including images used in drafts.

## Admin

- URL: `/admin`
- Log in with the account created in Supabase Auth.
- Tabs: Profile, Projects, Achievements, Skills, Experience, Socials, Settings.
- Every text field has an **EN** and an **ID** tab.
- Upload images directly from the browser; they are compressed to WebP (max 1600px) before
  reaching Supabase Storage.
- Changes appear on the site immediately (no rebuild).

Note: Deep Dark shows **all published projects** in a horizontal row — 3 visible
at once on desktop, the rest paged with the ←/→ buttons or by swiping. **3 achievements
per page** (←/→ buttons if there are more than 3).
Use the ↑/↓ buttons to reorder. Certificates are uploaded via
**Admin → Achievements → Certificate image**.

## Structure

```
src/
├── main.tsx / App.tsx / Portfolio.tsx
├── data/           # types, fetch, fallback, sections
├── i18n/           # EN/ID dictionary + LanguageProvider
├── components/     # loading, hotbar, music, toast, icons
├── sections/       # Overworld, Cave, DeepDark, Nether, TheEnd, Credits
├── admin/          # login, dashboard, editors, form components
├── styles/         # base, layout, sections, achievements, fishing, admin
└── lib/            # supabase, achievement, fishing, and secret-item storage

public/
├── fonts/          # Monocraft (SIL OFL)
├── textures/       # generated 16×16 textures
├── img/biomes/     # AVIF + WebP backgrounds (1280/1920/2560)
└── audio/          # music (tracked in Git)
```

## Achievement book

- Open it via the book button at the top or press `E`.
- There are **6 hidden artifacts** in different biomes. Click a sparkling item to
  earn an advancement.
- Progress is stored in the browser's `localStorage` under the key
  `portfolio-achievements-v1` — no account, no database, and only valid
  on that browser/device. A reset is available inside the book. Game milestones are checked
  again from game progress on reload or when progress changes.
- Collecting all six artifacts unlocks **Curious Explorer**. Players who complete the entire
  achievement book can find a personal message after the credits.
- There are 13 game milestones: first catch/25 catches, all 6 rods,
  12 regular catches, Echo Fish, first Rift material/6 material types, first
  successful brew, first Perfect/5 Perfects, all recipes unlocked/successfully
  brewed, and 9 precise pours without overheating.
- The book has All, Artifacts, and Minigame filters. Milestones already
  satisfied by an old save are recognized immediately when the page opens.
- This is separate from the **Achievements** tab in Deep Dark, which holds real
  achievements/certificates from Supabase.

## Fishing mini-game

- The minigame can only be opened in the Overworld biome, via the fishing icon next to the Achievement Book or by pressing `F` while in the Overworld.
- Flow: **Cast** → wait for the `!` signal → press **Reel** → hold the button to pull
  and release before the tension hits the limit. Catch progress must reach 100%.
- The pixel-art scenery follows the device's local time: **Night**, **Dawn**,
  **Day**, or **Dusk**, with matching landscape colors and reflections.
- The rod is drawn in the foreground (bottom right). While reeling, the rod bounces,
  the line tightens, the bobber moves toward the rod, and the fish silhouette can be seen
  struggling underwater.
- There are 5 regular rods: Basic, Sturdy, Lucky, Golden, Prismarine. New rods unlock
  from catch count/species milestones; unlocked rods can be
  equipped from the **Rods** tab.
- There are 12 regular catches + **1 secret fish** (Echo Fish) with mythic rarity.
  Each fish has a rarity, weight, length, and size class
  (Tiny/Small/Average/Large/Trophy).
- The **Chest** tab holds up to **54 fish**; fish can be released (double-click to
  confirm), and the list can be sorted by newest/heaviest.
- The **Journal** tab shows every species. Species that have not been caught
  appear as black silhouettes; caught ones appear in color along with their
  best weight/length records and catch count.
- Progress is stored in `localStorage` under the key `portfolio-fishing-v1`, separate
  from the achievement book (`portfolio-achievements-v1`).
- The Warden Rod is forged in Deep Dark. The Echo Fish chance on the first five casts with this rod is 20%, 40%, 60%, 80%, and 100%. After the fifth cast, a bite is guaranteed until the Echo Fish is successfully caught.

## Deep Dark

Open the sculk icon next to the book or press D in Deep Dark. In Silent Steps, grab the Echo Shard and return to the entrance before time runs out. Two waves that hit the player wake the Warden. Bring the shard, one Voidsteel (5% per Cave row 7 block), one Resonance Potion, and all six artifacts to the furnace. Activate the Soul Flame in the Nether after five Perfect brews. Light all runes in five steps to forge the Warden Rod. Repeating the puzzle keeps the materials.

## Nether Brewmaster

- The minigame can only be opened in the Nether biome, via the brewing icon next to the Achievement Book or by pressing `N` while in the Nether.
  `Esc` closes the game. The bottom hotbar buttons are only for biome navigation.
- Loop: **fishing → Rift material catch → brewing → fishing bonus**.
  The material replaces the fish on that catch, rather than being a bonus alongside the fish.
- Six materials: Nether Wart, Glowstone Dust, Nether Quartz, Magma Cream,
  Blaze Powder, Ghast Tear. Base material chance is 14%, increasing with rod luck;
  Ember Bait adds 22 percentage points. Rod luck also raises the chance of
  rare materials. Rift catches have a red effect on the water.
- Materials go into the **Brewing Bag**, separate from the 54 fish slots and 13 fish
  journal entries. Material discoveries are recorded permanently once a material is used. Resetting fishing
  clears fish/rods/stats; the bag, bonuses, and starter claim remain.
- Claim the starter kit once for the first recipe materials. One round uses
  3 materials and lasts **36 seconds**: 3 pours for each material.
  Click **Add** / `Space` when the marker is in the golden zone (35–65%).
  Click **Vent heat** / `V` to lower the temperature by 24%; cooldown 1.6 seconds.
  Keep the temperature between 25–75%. The round pauses while the browser tab is inactive.
- Score: 70% timing accuracy + 30% safe-temperature duration, minus 4 points for each
  overheat. Quality: Failed <35, Clumsy 35–61, Good 62–87, Perfect ≥88.
  A miss ends the combo; repeated clicks within the same pour are not counted.
- Closing/reloading before finishing: **refunds all materials**. A failure also refunds
  all materials, and Clumsy refunds the first material. Completed rounds unlock recipes
  after a total of 1, 3, 5, and 8 rounds, including failed attempts.

| Recipe | Unlocked after | Good-quality reward |
| --- | --- | --- |
| Experience | Start | Ember Bait, 5 casts |
| Fire Resistance | 1 round | Ember Bait, 8 casts |
| Strength | 3 rounds | Luck Potion, 5 casts |
| Luck | 5 rounds | Luck Potion, 8 casts |
| Resonance | 8 rounds | 1 Resonance Potion for the furnace |

- Perfect adds 2 bonus casts and 1 **Nether Ember**. Five Perfects
  unlock the Brewmaster title and the **Soul Flame** cosmetic toggle. Nether Embers
  are stored as a collection for a future update and do not unlock an ending yet.
- Bonuses activate automatically, stack, and are consumed **once at
  the start of a cast**, including failed or cancelled casts. The Luck Potion
  adds 0.8 luck to fish rarity rolls; it does not change the chest capacity.
- Recipes, score records, and cosmetics are stored in `portfolio-nether-v1`.
  The bag, bonuses, starter kit, and material reservations are in `portfolio-fishing-v1`.
  Older save versions are migrated without losing progress.

### Local validation

```sh
npm run test:games   # Node 22.6+ with TypeScript stripping support
npm run build       # typecheck + Vite production build
npm run dev         # manual check: F / N / E
```

The logic tests cover save migration, material vs fish catches, per-cast bonuses,
material reservation/refund, cooldown, scoring, milestones, and the ending flag.
For UI checks: claim the starter, try a round with keyboard/touch, check the chest/bag,
reload while brewing, check the timer when switching tabs, and use a mobile viewport. Game buttons for other biomes will navigate to that biome; the minigame must be opened there.

## Music

The files live in `public/audio/` and are deployed because they are tracked in Git. The C418
tracks are copyrighted; if you later want to be safer for public release, replace the files with
licensed audio — file names and the player do not need to change.

Tracks are mapped per biome:

- `minecraft.mp3` → Overworld, Cave, Deep Dark
- `mice-on-venus.mp3` → Nether, The End, Credits

## Assets & credits

- Biome backgrounds: Minecraft screenshots/renders (personal use).
- Font: [Monocraft](https://github.com/IdreesInc/Monocraft) (SIL Open Font License).
- Minecraft is a trademark of Mojang Studios. This project is not affiliated.

## Deploy

- **Netlify**: `netlify.toml` already contains the build command + SPA redirect.
- **Vercel**: `vercel.json` already routes `/admin/*` to the SPA.

Add the `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` environment variables
in the hosting dashboard.

## Commands

```bash
npm run dev        # dev server
npm run build      # typecheck + production build
npm run preview    # check the build output
npm run typecheck  # TypeScript only
```
