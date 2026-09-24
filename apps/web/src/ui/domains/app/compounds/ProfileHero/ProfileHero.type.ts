/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';
import type { ProfileModeId } from '../ModeBadge';

/** One label/value cell of the hero's fact strip. */
interface HeroFact {
  label: string;
  value: string;
  /** Full value for the hover tooltip when the cell truncates. */
  title?: string;
  mono?: boolean;
  capitalize?: boolean;
}

/** The save the hero offers to resume. */
interface HeroLastSave {
  name: string;
  timestamp: number;
  screenshotUrl: string | null;
  busy: boolean;
  onLoad: () => void;
}

/** Checks progress of one battery-save file (shown as File slot + 1). */
interface HeroProgressFile {
  slot: number;
  /** The name typed on the file-select screen; null falls back to "File N". */
  name: string | null;
  taken: number;
  available: number;
  left: number;
  total: number;
}

interface ProfileHeroProps {
  mode: ProfileModeId;
  /** Fills the hero behind everything; the host picks the scene. */
  backdrop?: ReactNode;
  facts: HeroFact[];
  /** Seed/connection/session row; null on an unrandomized profile. */
  runFacts: HeroFact[] | null;
  /** One row per save file holding a game; null hides the panel. */
  progress: HeroProgressFile[] | null;
  lastSave: HeroLastSave | null;
  /** The game controls under the mode: Play, or Pause / Stop / Reset while a game runs. */
  actions?: ReactNode;
  canRevealFolder: boolean;
  onOpenFolder: () => void;
  onImportSram: () => void;
}

export type { HeroFact, HeroLastSave, HeroProgressFile, ProfileHeroProps };
