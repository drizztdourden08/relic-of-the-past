/* @layer renderer-components @kind types */
import type { RefObject } from 'react';
import type { LanguageSet } from '@rotp/languages';

type PersistenceRefs = {
  latest: RefObject<LanguageSet | null>;
  revision: RefObject<number>;
  persisted: RefObject<number>;
  epoch: RefObject<number>;
  timer: RefObject<ReturnType<typeof setTimeout> | null>;
  inFlight: RefObject<boolean>;
  live: RefObject<boolean>;
  runRef: RefObject<() => Promise<void>>;
};

type PersistenceContext = {
  refs: PersistenceRefs;
  setDirty: (dirty: boolean) => void;
  setSaving: (saving: boolean) => void;
  setSaveError: (error: string | null) => void;
  arm: () => void;
};

type SavedRun = { at: number; era: number; failure: string | null };

export type { PersistenceContext, PersistenceRefs, SavedRun };
