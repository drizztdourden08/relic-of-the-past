/* @layer tests @kind type */
import type { ElectronApplication, Page } from 'playwright';

interface ModernSlotSeed {
  index: number;
  code: string;
  label: string;
}

interface ProfileSeed {
  // Also the profile id; the app opens the profile whose id matches `--instance`.
  instance: string;
  // The name the profile list shows. Defaults to the instance.
  name?: string;
  // Settings written to config.json on top of the app defaults.
  config?: Record<string, unknown>;
  // Stored modern controls: keyboard slots in this order, replacing the default list.
  modernSlots?: readonly ModernSlotSeed[];
  // Writes app.json so this profile opens on launch. False leaves the profile list for the spec to pick from.
  openByDefault?: boolean;
  // Marks the profile as an automation profile (the worktree tool's own profiles are).
  automation?: boolean;
  // Fixture save states copied in. Defaults to every fixture.
  fixtures?: readonly string[];
}

interface LaunchOptions extends ProfileSeed {
  args?: readonly string[];
}

interface StartedApp {
  app: ElectronApplication;
  userData: string;
  close: () => Promise<void>;
}

interface LaunchedApp extends StartedApp {
  window: Page;
}

export type { LaunchOptions, LaunchedApp, ModernSlotSeed, ProfileSeed, StartedApp };
