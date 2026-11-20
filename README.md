# VICE COVER STUDIO — GTA-Style Cover Art Maker

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/Ombray88/gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/Ombray88/gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

Built for the make.fun gta6-cover-art-01 bounty; turn your photos into a GTA-style cover — 9-panel grid, sunset/neon grade, bold lettering, export PNG 1080x1080 / 1080x1350 / 1920x1080, 100% offline.

## How to use

1. Open `app/index.html` in your web browser or run a local static server.
2. Add your own photos (or load the built-in sample kits: Boulevard / Pier).
3. Assign photos to grid panels and customize your title and location subtitle.
4. Click **Export PNG** to download your high-resolution cover art.

## What makes it GTA-style

- **Panel Grid:** Classic 9-panel multi-scene layout or 3-column trio composition.
- **Sunset Palette:** Vibrant pink, teal, and orange twilight grading.
- **Vector Mini-Scenes:** Stylized silhouette & painted vignettes (helicopters, speedboats, palms, skyline).
- **Display Typography:** Bold Anton lettering for maximum visual impact.

## Run it

Open `app/index.html` directly in any modern browser, or run a local web server:

```bash
python3 -m http.server 8000
```
Then visit `http://localhost:8000/app/`.

The entrypoint `main.ts` copies `app/` + `screenshots/` beside it into the output directory (`process.env.MAKEFUN_OUTPUT_DIR ?? '/output'`) and writes `/output/dossier.json` using `buildDossier` from `./vendor/makefun-app.ts`.

## License

MIT License. All art assets are 100% original creations. No official Rockstar Games assets, logos, wordmarks, or trademarked characters are used.
