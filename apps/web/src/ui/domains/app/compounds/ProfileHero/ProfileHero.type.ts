/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';
import type { ProfileModeId } from '../ModeBadge';

interface HeroFact {
  label: string;
  value: string;
  title?: string;
  mono?: boolean;
  capitalize?: boolean;
}

interface HeroLastSave {
  name: string;
  timestamp: number;
  screenshotUrl: string | null;
  busy: boolean;
  onLoad: () => void;
}

interface HeroProgressFile {
  slot: number;
  name: string | null;
  taken: number;
  available: number;
  left: number;
  total: number;
}

interface ProfileHeroProps {
  mode: ProfileModeId;
  backdrop?: ReactNode;
  facts: HeroFact[];
  runFacts: HeroFact[] | null;
  progress: HeroProgressFile[] | null;
  lastSave: HeroLastSave | null;
  actions?: ReactNode;
  canRevealFolder: boolean;
  onOpenFolder: () => void;
  onImportSram: () => void;
}

export type { HeroFact, HeroLastSave, HeroProgressFile, ProfileHeroProps };
