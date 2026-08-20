/* @layer shared-game @kind constants */
/**
 * The record of save state formats this project has shipped.
 *
 * Nothing here is consulted to decide compatibility — that is the generated id's job.
 * This is the written history: which id, from which version, and what moved. The release
 * gate blocks on an id that has no row, so a layout change cannot ship without one.
 */
import { CURRENT_STATE_FORMAT } from './current-format.generated';
import type { KnownFormat } from './types';

const KNOWN_FORMATS: readonly KnownFormat[] = [
  {
    id: '6895039d1993',
    since: '0.1.0',
    note: 'Original layout. Every release up to and including 0.17.1 wrote this.',
  },
] as const;

/**
 * The last release that shipped before a format id was published alongside it.
 *
 * Without this, every historical version reads as unverifiable and the update dialog
 * would warn about builds that are provably fine. Their format is not a guess: no build
 * that could produce them ever wrote anything but the id below.
 *
 * Frozen. Nothing is ever added here — versions after this one publish for themselves.
 */
const BASELINE = { upToVersion: '0.17.1', id: '6895039d1993' } as const;

const formatById = (id: string): KnownFormat | null =>
  KNOWN_FORMATS.find((f) => f.id === id) ?? null;

/** Whether the current build's computed id has a row. The release gate's whole question. */
const isCurrentFormatRegistered = (): boolean => formatById(CURRENT_STATE_FORMAT.id) !== null;

export { BASELINE, formatById, isCurrentFormatRegistered, KNOWN_FORMATS };
