// ==========================================
// VICE COVER STUDIO — make.fun gta6-cover-art-01
// ==========================================

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });

// Copy app files
const appSrc = join(__dirname, 'app');
const appDest = join(out, 'app');
if (existsSync(appSrc)) {
  cpSync(appSrc, appDest, { recursive: true });
}

// Copy screenshots if present
const shotsSrc = join(__dirname, 'screenshots');
const shotsDest = join(out, 'screenshots');
if (existsSync(shotsSrc)) {
  cpSync(shotsSrc, shotsDest, { recursive: true });
}

const DOSSIER_CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000
};

// Build and write dossier
const dossier = buildDossier(out, DOSSIER_CAPS);

writeFileSync(join(out, 'dossier.json'), JSON.stringify(dossier, null, 2), 'utf-8');

console.log('VICE COVER STUDIO dossier built successfully at:', out);
