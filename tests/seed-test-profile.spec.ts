/**
 * Seed Test Profile Script
 *
 * Creates a "Dev Testing" profile ready to play.
 * Idempotent — skips if profile already exists.
 *
 * Usage: npx playwright test seed-test-profile.spec.ts
 */

import { test } from '@playwright/test';
import {
  launchApp,
  seedSingleProfile,
  listProfiles,
  TEST_ROMS,
} from './helpers';

const PROFILE_NAME = 'Dev Testing';

test('Seed Dev Testing profile', async () => {
  const { app, window } = await launchApp({ muted: true });

  try {
    // Check if profile already exists
    const profiles = await listProfiles(window);
    const existing = profiles.find((p) => p.name === PROFILE_NAME);

    if (existing) {
      console.log(`Profile "${PROFILE_NAME}" already exists (id=${existing.id}). Nothing to do.`);
    } else {
      console.log(`Creating profile "${PROFILE_NAME}"...`);
      const result = await seedSingleProfile(window, TEST_ROMS.usa, PROFILE_NAME);
      console.log(`Profile created: ${result.profileId}`);
    }
  } finally {
    await app.close();
  }
});
