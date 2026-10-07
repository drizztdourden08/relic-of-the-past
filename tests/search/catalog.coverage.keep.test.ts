/* @layer test @kind test */
/**
 * Runtime coverage checks for the search catalog. The compile-time guard is
 * `PROFILE_HUB_TABS: Record<ProfileHubTab, ...>` in ProfileHub.constants.ts;
 * these verify the built catalog is internally consistent.
 */
import { describe, it, expect } from 'vitest';
import { DEFAULT_SETTINGS } from '@app/lib/game/settings';
import { buildCatalog } from '@app/ui/domains/app/views/SearchPalette/behavior/catalog/build-catalog';
import { PROFILE_HUB_TABS } from '@app/ui/domains/app/views/ProfileHub/ProfileHub.constants';
import type { ProfileHubTab } from '@app/ui/domains/app/views/ProfileHub/ProfileHub.type';
import type { TitleBarProps } from '@app/ui/domains/app/views/TitleBar/TitleBar.type';
import type { WindowControlsPort } from '@shared/platform';
import type { SearchContext } from '@app/ui/domains/app/views/SearchPalette/SearchPalette.type';

// buildTitleBarMenuItems (via menuSource) reads window.api.isDev only when actually
// invoked (inside buildCatalog calls below), and it is real only in the renderer. vitest's default
// environment is plain Node with no window global, so the calls below need this stub.
(globalThis as unknown as { window: unknown }).window = { api: { isDev: false } };

const NOOP = () => {};
const navProps = {
  onImportRom: NOOP, onSwitchProfile: NOOP, onShowProfile: NOOP, onShowLogs: NOOP,
  onToggleSaveStates: NOOP, onToggleInventory: NOOP, onToggleChecks: NOOP, onToggleDebug: NOOP,
  onToggleCheats: NOOP, onShowDataManager: NOOP, onShowInputTester: NOOP, onShowCredits: NOOP,
  onShowDesignGallery: NOOP, onShowSpriteDebug: NOOP, onShowConnectionDebug: NOOP,
  onToggleDataset: NOOP, onToggleSimulator: NOOP, onShowShadowEditor: NOOP, onShowAbout: NOOP,
  activeProfile: null, gameRunning: false, widgetVisibility: {},
} as unknown as TitleBarProps;

const win = {} as WindowControlsPort; // only called from onClick handlers, never during build

const ctx: SearchContext = {
  navProps, win, settings: DEFAULT_SETTINGS, isMobile: false, closePalette: NOOP,
};

describe('search catalog', () => {
  it('has no duplicate entry ids', () => {
    const catalog = buildCatalog(ctx);
    const ids = catalog.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('indexes every ProfileHub tab except home (and mobile-only tabs off mobile)', () => {
    const catalog = buildCatalog(ctx);
    const tabIds = new Set(catalog.filter((e) => e.kind === 'tab').map((e) => e.id));
    for (const [tab, spec] of Object.entries(PROFILE_HUB_TABS) as [ProfileHubTab, typeof PROFILE_HUB_TABS[ProfileHubTab]][]) {
      if (tab === 'home' || spec.mobileOnly) continue;
      expect(tabIds.has(`tab:${tab}`)).toBe(true);
    }
  });

  it('every settingKey names a real, boolean GameSettings field', () => {
    const catalog = buildCatalog(ctx);
    const withKey = catalog.filter((e) => e.settingKey);
    expect(withKey.length).toBeGreaterThan(0);
    for (const entry of withKey) {
      expect(typeof (DEFAULT_SETTINGS as unknown as Record<string, unknown>)[entry.settingKey as string]).toBe('boolean');
    }
  });

  it('every menu-derived entry carries a runnable command', () => {
    const catalog = buildCatalog(ctx);
    const menuEntries = catalog.filter((e) => e.id.startsWith('menu:'));
    expect(menuEntries.length).toBeGreaterThan(0);
    for (const entry of menuEntries) expect(typeof entry.run).toBe('function');
  });

  it('indexes a substantial number of individual settings', () => {
    const catalog = buildCatalog(ctx);
    const settingEntries = catalog.filter((e) => e.kind === 'setting');
    expect(settingEntries.length).toBeGreaterThan(50);
  });

  it('returns nothing when no profile/settings are active', () => {
    const noProfileCtx: SearchContext = { ...ctx, settings: null };
    const catalog = buildCatalog(noProfileCtx);
    expect(catalog.some((e) => e.kind === 'setting')).toBe(false);
    expect(catalog.some((e) => e.kind === 'tab')).toBe(false);
  });
});
