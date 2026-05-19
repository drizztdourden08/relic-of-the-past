/**
 * Seed Test Profile Script
 *
 * Creates a "Dev Testing" profile with all 13 chapter reference saves
 * loaded as Normal Saves. Idempotent — skips if profile already exists.
 *
 * Usage: npx playwright test seed-test-profile.spec.ts
 */

import { test } from '@playwright/test';
import { readFile } from 'fs/promises';
import { join } from 'path';
import {
  launchApp,
  seedSingleProfile,
  listProfiles,
  TEST_ROMS,
  PROJECT_ROOT,
} from './helpers';

const PROFILE_NAME = 'Dev Testing';
const REF_SAVES_DIR = join(PROJECT_ROOT, 'core', 'zelda3', 'saves', 'ref');

const CHAPTER_SAVES = [
  'Chapter 1 - Zelda\'s Rescue.sav',
  'Chapter 2 - After Eastern Palace.sav',
  'Chapter 3 - After Desert Palace.sav',
  'Chapter 4 - After Tower of Hera.sav',
  'Chapter 5 - After Hyrule Castle Tower.sav',
  'Chapter 6 - After Dark Palace.sav',
  'Chapter 7 - After Swamp Palace.sav',
  'Chapter 8 - After Skull Woods.sav',
  'Chapter 9 - After Gargoyle\'s Domain.sav',
  'Chapter 10 - After Ice Palace.sav',
  'Chapter 11 - After Misery Mire.sav',
  'Chapter 12 - After Turtle Rock.sav',
  'Chapter 13 - After Ganon\'s Tower.sav',
];

test('Seed Dev Testing profile with chapter saves', async () => {
  const { app, window } = await launchApp({ muted: true });

  try {
    // Check if profile already exists
    const profiles = await listProfiles(window);
    const existing = profiles.find((p) => p.name === PROFILE_NAME);

    let profileId: string;

    if (existing) {
      console.log(`Profile "${PROFILE_NAME}" already exists (id=${existing.id}). Skipping creation.`);
      profileId = existing.id;
    } else {
      console.log(`Creating profile "${PROFILE_NAME}"...`);
      const result = await seedSingleProfile(window, TEST_ROMS.usa, PROFILE_NAME);
      profileId = result.profileId;
      console.log(`Profile created: ${profileId}`);
    }

    // Seed all 13 chapter saves as Normal Saves
    console.log(`Seeding ${CHAPTER_SAVES.length} chapter saves...`);

    // Check existing normal saves to avoid duplicates
    const existingNormals: Array<{ id: string; name: string }> = await window.evaluate(
      (pid) => window.api.listNormalSaves(pid),
      profileId,
    );
    const existingNames = new Set(existingNormals.map((s) => s.name));

    let seeded = 0;
    let skipped = 0;

    for (const fileName of CHAPTER_SAVES) {
      const saveName = fileName.replace('.sav', '');

      if (existingNames.has(saveName)) {
        skipped++;
        continue;
      }

      const savePath = join(REF_SAVES_DIR, fileName);
      const data = await readFile(savePath);
      const b64 = data.toString('base64');

      await window.evaluate(
        ({ pid, name, encoded }) => {
          const binary = atob(encoded);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
          return window.api.createNormalSave(pid, name, bytes.buffer);
        },
        { pid: profileId, name: saveName, encoded: b64 },
      );

      seeded++;
      console.log(`  ✓ ${saveName}`);
    }

    console.log(`\nDone! Seeded ${seeded} saves, skipped ${skipped} existing.`);
    console.log(`Profile "${PROFILE_NAME}" is ready with ${seeded + skipped + existingNormals.length - skipped} total normal saves.`);
  } finally {
    await app.close();
  }
});
