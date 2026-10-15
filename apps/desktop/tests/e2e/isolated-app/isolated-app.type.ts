/* @layer tests @kind type */
import type { ElectronApplication, Page } from 'playwright';

interface StoredSlotSeed {
  index: number;
  code: string;
  label: string;
}

interface ProfileSeed {
  instance: string;
  name?: string;
  config?: Record<string, unknown>;
  storedSlots?: readonly StoredSlotSeed[];
  openByDefault?: boolean;
  automation?: boolean;
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

export type { LaunchOptions, LaunchedApp, StoredSlotSeed, ProfileSeed, StartedApp };
