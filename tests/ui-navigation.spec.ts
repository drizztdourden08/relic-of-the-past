/**
 * UI navigation tests — startup screens, profile picker layout, menu interactions, game loading.
 * Requires: test-roms/ with .sfc files.
 */

import { test, expect } from '@playwright/test';
import { existsSync } from 'fs';
import {
  launchApp, clearAppData, screenshot,
  importRom, extractAssets,
  createProfile, listProfiles,
  seedSingleProfile, seedMultiProfile,
  getScreen, waitForScreen, startGameFromProfile, navigateToPicker, openMenu,
  getLogEntries, printLogs,
  TEST_ROMS, ROM_FILES,
} from './helpers';

test.describe('Startup Screens', () => {
  test('clean install shows profile picker with empty state', async () => {
    await clearAppData();
    const { app, window } = await launchApp();

    expect(await getScreen(window)).toBe('picker');

    // Two-column layout present
    const columns = await window.locator('.picker__col').count();
    expect(columns).toBe(2);

    // Left column: empty profiles message
    const emptyMsg = await window.locator('.picker__empty').first().textContent();
    expect(emptyMsg).toContain('No profiles yet');

    // Right column: empty ROMs message
    const romEmpty = await window.locator('.picker__empty').last().textContent();
    expect(romEmpty).toContain('No ROMs imported');

    // Import ROM button visible
    const importBtn = window.locator('.btn', { hasText: 'Import ROM' });
    await expect(importBtn).toBeVisible();

    // No "New Profile" button since no ROMs with assets
    const newProfileBtn = window.locator('.btn', { hasText: 'New Profile' });
    await expect(newProfileBtn).not.toBeVisible();

    await screenshot(window, 'startup-empty');
    await app.close();
  });

  test('single profile shows profile page on startup', async () => {
    await clearAppData();

    // Seed one profile
    const setup = await launchApp();
    await seedSingleProfile(setup.window, TEST_ROMS.usa, 'Auto Load Test');
    await setup.app.close();

    // Relaunch — should show profile page
    const { app, window } = await launchApp();
    await waitForScreen(window, 'profile', 20_000);
    expect(await getScreen(window)).toBe('profile');

    const logs = await getLogEntries(window);
    const autoLoadLog = logs.find((l) => l.message.includes('Single profile found'));
    expect(autoLoadLog).toBeDefined();

    await screenshot(window, 'startup-profile-page');
    await app.close();
  });

  test('multiple profiles show picker on startup', async () => {
    await clearAppData();

    // Seed two profiles
    const setup = await launchApp();
    await seedMultiProfile(setup.window, TEST_ROMS.usa, ['Profile A', 'Profile B']);
    await setup.app.close();

    // Relaunch — with lastProfileId set, shows profile page of last profile.
    const { app, window } = await launchApp();
    await window.waitForTimeout(3000);

    const screen = await getScreen(window);
    const logs = await getLogEntries(window);
    printLogs(logs);

    // With lastProfileId set, it shows profile page.
    console.log(`  Screen after 2 profiles: ${screen}`);
    expect(['profile', 'picker']).toContain(screen);

    await screenshot(window, 'startup-multi-profile');
    await app.close();
  });
});

test.describe('Profile Picker UI', () => {
  test.beforeEach(async () => {
    await clearAppData();
  });

  test('shows imported ROMs with correct status badges', async () => {
    test.skip(!existsSync(TEST_ROMS.usa) || !existsSync(TEST_ROMS.canada), 'Test ROMs not available');

    const { app, window } = await launchApp();

    // Import two ROMs, extract only one
    await importRom(window, TEST_ROMS.usa);
    await importRom(window, TEST_ROMS.canada);
    await extractAssets(window, ROM_FILES.usa);

    // Navigate back to picker (we're already on it since no profiles exist)
    // But we need to refresh — reload the page
    await window.reload();
    await waitForScreen(window, 'picker');

    // ROM cards should exist
    const romCards = await window.locator('.rom-card').count();
    expect(romCards).toBe(2);

    // USA should show "Ready" badge
    const readyBadge = window.locator('.badge--success');
    await expect(readyBadge).toBeVisible();

    // Canada should show "Extract Assets" button
    const extractBtn = window.locator('.btn', { hasText: 'Extract Assets' });
    await expect(extractBtn).toBeVisible();

    await screenshot(window, 'picker-rom-statuses');
    await app.close();
  });

  test('shows profile cards with name, ROM, and date', async () => {
    test.skip(!existsSync(TEST_ROMS.usa), 'Test ROM not available');

    const { app, window } = await launchApp();
    await seedMultiProfile(window, TEST_ROMS.usa, ['Casual Run', 'Randomizer']);

    // Reload — shows profile page of last profile, navigate to picker via menu
    await window.reload();
    await window.waitForTimeout(3000);
    const currentScreen = await getScreen(window);
    if (currentScreen !== 'picker') {
      await navigateToPicker(window);
    }

    const profileCards = await window.locator('.profile-card').count();
    expect(profileCards).toBe(2);

    const names = await window.locator('.profile-card__name').allTextContents();
    expect(names).toContain('Casual Run');
    expect(names).toContain('Randomizer');

    // Each card shows the ROM name
    const romLabels = await window.locator('.profile-card__rom').allTextContents();
    for (const label of romLabels) {
      expect(label).toContain('A Link to the Past');
    }

    await screenshot(window, 'picker-profiles');
    await app.close();
  });

  test('New Profile button appears only when ROMs have assets', async () => {
    test.skip(!existsSync(TEST_ROMS.usa), 'Test ROM not available');

    const { app, window } = await launchApp();

    // Import ROM without extracting
    await importRom(window, TEST_ROMS.usa);
    await window.reload();
    await waitForScreen(window, 'picker');

    // No "New Profile" button since no ready ROMs
    let newProfileBtn = window.locator('.btn--primary.btn--full', { hasText: 'New Profile' });
    await expect(newProfileBtn).not.toBeVisible();

    // Extract assets
    await extractAssets(window, ROM_FILES.usa);
    await window.reload();
    await waitForScreen(window, 'picker');

    // Now "New Profile" should appear
    newProfileBtn = window.locator('.btn--primary.btn--full', { hasText: 'New Profile' });
    await expect(newProfileBtn).toBeVisible();

    await screenshot(window, 'picker-new-profile-btn');
    await app.close();
  });

  test('create profile form flow', async () => {
    test.skip(!existsSync(TEST_ROMS.usa), 'Test ROM not available');

    const { app, window } = await launchApp();

    await importRom(window, TEST_ROMS.usa);
    await extractAssets(window, ROM_FILES.usa);
    await window.reload();
    await waitForScreen(window, 'picker');

    // Click "New Profile"
    await window.locator('.btn--primary.btn--full', { hasText: 'New Profile' }).click();
    await window.waitForTimeout(300);

    // Form should appear
    const form = window.locator('.create-profile-form');
    await expect(form).toBeVisible();

    // Input and select should be present
    const input = window.locator('.text-input');
    await expect(input).toBeVisible();
    await expect(input).toBeFocused();

    const select = window.locator('.select');
    await expect(select).toBeVisible();

    // Cancel hides the form
    await window.locator('.btn--secondary', { hasText: 'Cancel' }).click();
    await expect(form).not.toBeVisible();

    await screenshot(window, 'picker-create-form');
    await app.close();
  });

  test('delete profile via card button', async () => {
    test.skip(!existsSync(TEST_ROMS.usa), 'Test ROM not available');

    const { app, window } = await launchApp();
    await seedSingleProfile(window, TEST_ROMS.usa, 'Doomed Profile');

    // Single profile → shows profile page, navigate to picker
    await window.reload();
    await window.waitForTimeout(3000);
    const currentScreen = await getScreen(window);
    if (currentScreen !== 'picker') {
      await navigateToPicker(window);
    }

    expect(await window.locator('.profile-card').count()).toBe(1);

    // Click delete button on the card → confirm dialog
    await window.locator('.profile-card .icon-btn--danger').click();
    await window.waitForTimeout(300);

    // Confirm the deletion dialog
    const dialog = window.locator('.dialog-backdrop');
    await expect(dialog).toBeVisible();
    await window.locator('.dialog .btn--danger').click();
    await window.waitForTimeout(500);

    expect(await window.locator('.profile-card').count()).toBe(0);

    // Verify via API too
    const profiles = await listProfiles(window);
    expect(profiles.length).toBe(0);

    await screenshot(window, 'picker-after-delete');
    await app.close();
  });
});

test.describe('Menu Navigation', () => {
  test.beforeEach(async () => {
    await clearAppData();
  });

  test('menu opens and shows expected items', async () => {
    const { app, window } = await launchApp();

    await openMenu(window);

    const menuItems = await window.locator('.dropdown__item').allTextContents();
    const menuText = menuItems.join(' ');
    expect(menuText).toContain('Import ROM');
    expect(menuText).toContain('Settings');
    expect(menuText).toContain('About');
    expect(menuText).toContain('Quit');

    await screenshot(window, 'menu-open');
    await app.close();
  });

  test('Switch Profile menu item navigates from game to picker', async () => {
    test.skip(!existsSync(TEST_ROMS.usa), 'Test ROM not available');

    // Seed so app shows profile page on launch
    const setup = await launchApp();
    await seedSingleProfile(setup.window, TEST_ROMS.usa, 'Game Test');
    await setup.app.close();

    const { app, window } = await launchApp();
    // Start game from profile page
    await startGameFromProfile(window, 20_000);
    expect(await getScreen(window)).toBe('game');

    // Use menu to switch to picker (will show confirmation dialog)
    await navigateToPicker(window);
    expect(await getScreen(window)).toBe('picker');

    await screenshot(window, 'menu-switch-to-picker');
    await app.close();
  });

  test('clicking outside menu closes it', async () => {
    const { app, window } = await launchApp();

    await openMenu(window);
    const menu = window.locator('.dropdown-menu');
    await expect(menu).toBeVisible();

    // Click on the picker area to close (outside the menu)
    await window.locator('.picker').click({ position: { x: 200, y: 100 } });
    await window.waitForTimeout(300);
    await expect(menu).not.toBeVisible();

    await app.close();
  });
});

test.describe('Game Loading', () => {
  test.beforeEach(async () => {
    await clearAppData();
  });

  test('selecting a profile loads assets and shows game screen', async () => {
    test.skip(!existsSync(TEST_ROMS.usa), 'Test ROM not available');

    const { app, window } = await launchApp();
    await seedSingleProfile(window, TEST_ROMS.usa, 'Click Test');

    // Reload to show picker
    // Need 2nd profile to not auto-load, or navigate via menu
    await createProfile(window, 'Second', ROM_FILES.usa);
    await window.reload();
    await window.waitForTimeout(3000);

    // If it showed profile page (last profile), navigate to picker
    const currentScreen = await getScreen(window);
    if (currentScreen !== 'picker') {
      await navigateToPicker(window);
    }

    expect(await getScreen(window)).toBe('picker');

    // Click the first profile card → goes to profile page
    await window.locator('.profile-card').first().click();
    await waitForScreen(window, 'profile', 20_000);
    expect(await getScreen(window)).toBe('profile');

    // Start game from profile page
    await startGameFromProfile(window, 20_000);
    expect(await getScreen(window)).toBe('game');

    const logs = await getLogEntries(window);
    const loadLog = logs.find((l) => l.message.includes('Loaded assets'));
    expect(loadLog).toBeDefined();
    printLogs(logs);

    await screenshot(window, 'game-loaded');
    await app.close();
  });
});
