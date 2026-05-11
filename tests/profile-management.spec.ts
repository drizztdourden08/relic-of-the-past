/**
 * Profile management tests — CRUD, app state persistence, last-played tracking.
 * Requires: test-roms/ with at least one .sfc file.
 */

import { test, expect } from '@playwright/test';
import { existsSync } from 'fs';
import {
  launchApp, clearAppData,
  importRom, extractAssets,
  createProfile, listProfiles, deleteProfile, getAppState,
  TEST_ROMS, ROM_FILES,
} from './helpers';

test.beforeEach(async () => {
  await clearAppData();
});

test.describe('Profile CRUD', () => {
  test('create a profile for an imported ROM', async () => {
    test.skip(!existsSync(TEST_ROMS.usa), 'Test ROM not available');

    const { app, window } = await launchApp();

    await importRom(window, TEST_ROMS.usa);
    await extractAssets(window, ROM_FILES.usa);

    const profile = await createProfile(window, 'My Profile', ROM_FILES.usa);
    expect(profile.id).toBeTruthy();
    expect(profile.name).toBe('My Profile');
    expect(profile.romFile).toBe(ROM_FILES.usa);
    expect(profile.created).toBeGreaterThan(0);

    const profiles = await listProfiles(window);
    expect(profiles.length).toBe(1);
    expect(profiles[0].name).toBe('My Profile');

    await app.close();
  });

  test('create multiple profiles for same ROM', async () => {
    test.skip(!existsSync(TEST_ROMS.usa), 'Test ROM not available');

    const { app, window } = await launchApp();

    await importRom(window, TEST_ROMS.usa);
    await extractAssets(window, ROM_FILES.usa);

    const p1 = await createProfile(window, 'Casual Run', ROM_FILES.usa);
    const p2 = await createProfile(window, 'Randomized', ROM_FILES.usa);

    expect(p1.id).not.toBe(p2.id);

    const profiles = await listProfiles(window);
    expect(profiles.length).toBe(2);
    expect(profiles.map((p) => p.name)).toContain('Casual Run');
    expect(profiles.map((p) => p.name)).toContain('Randomized');

    await app.close();
  });

  test('delete a profile', async () => {
    test.skip(!existsSync(TEST_ROMS.usa), 'Test ROM not available');

    const { app, window } = await launchApp();

    await importRom(window, TEST_ROMS.usa);
    await extractAssets(window, ROM_FILES.usa);

    const profile = await createProfile(window, 'Temporary', ROM_FILES.usa);
    expect((await listProfiles(window)).length).toBe(1);

    await deleteProfile(window, profile.id);
    expect((await listProfiles(window)).length).toBe(0);

    await app.close();
  });

  test('profiles for different ROMs', async () => {
    test.skip(!existsSync(TEST_ROMS.usa) || !existsSync(TEST_ROMS.canada), 'Test ROMs not available');

    const { app, window } = await launchApp();

    await importRom(window, TEST_ROMS.usa);
    await importRom(window, TEST_ROMS.canada);
    await extractAssets(window, ROM_FILES.usa);
    await extractAssets(window, ROM_FILES.canada);

    await createProfile(window, 'USA Run', ROM_FILES.usa);
    await createProfile(window, 'Canada Run', ROM_FILES.canada);

    const profiles = await listProfiles(window);
    expect(profiles.length).toBe(2);

    const usaProfile = profiles.find((p) => p.name === 'USA Run');
    const canadaProfile = profiles.find((p) => p.name === 'Canada Run');
    expect(usaProfile!.romFile).toBe(ROM_FILES.usa);
    expect(canadaProfile!.romFile).toBe(ROM_FILES.canada);

    await app.close();
  });
});

test.describe('App State Persistence', () => {
  test('creating a profile sets it as last profile', async () => {
    test.skip(!existsSync(TEST_ROMS.usa), 'Test ROM not available');

    const { app, window } = await launchApp();

    await importRom(window, TEST_ROMS.usa);
    await extractAssets(window, ROM_FILES.usa);

    const profile = await createProfile(window, 'Test', ROM_FILES.usa);
    const state = await getAppState(window);
    expect(state.lastProfileId).toBe(profile.id);

    await app.close();
  });

  test('deleting last profile clears lastProfileId', async () => {
    test.skip(!existsSync(TEST_ROMS.usa), 'Test ROM not available');

    const { app, window } = await launchApp();

    await importRom(window, TEST_ROMS.usa);
    await extractAssets(window, ROM_FILES.usa);

    const profile = await createProfile(window, 'Doomed', ROM_FILES.usa);
    expect((await getAppState(window)).lastProfileId).toBe(profile.id);

    await deleteProfile(window, profile.id);
    expect((await getAppState(window)).lastProfileId).toBeNull();

    await app.close();
  });

  test('profiles persist across app restarts', async () => {
    test.skip(!existsSync(TEST_ROMS.usa), 'Test ROM not available');

    // First launch: create profile
    const first = await launchApp();
    await importRom(first.window, TEST_ROMS.usa);
    await extractAssets(first.window, ROM_FILES.usa);
    const profile = await createProfile(first.window, 'Persistent', ROM_FILES.usa);
    await first.app.close();

    // Second launch: verify profile exists
    const second = await launchApp();
    const profiles = await listProfiles(second.window);
    expect(profiles.length).toBe(1);
    expect(profiles[0].name).toBe('Persistent');
    expect(profiles[0].id).toBe(profile.id);
    await second.app.close();
  });
});
